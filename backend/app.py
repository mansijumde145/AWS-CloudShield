import os
import io
import json
import uuid
import hashlib
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

# Local Mock Vault Directory for testing before AWS setup
LOCAL_VAULT_DIR = os.path.join(os.path.dirname(__file__), "local_vault")
LEDGER_FILE = os.path.join(LOCAL_VAULT_DIR, "versions.json")
os.makedirs(LOCAL_VAULT_DIR, exist_ok=True)

def get_local_ledger():
    if not os.path.exists(LEDGER_FILE):
        return {}
    with open(LEDGER_FILE, "r") as f:
        return json.load(f)

def save_local_ledger(ledger):
    with open(LEDGER_FILE, "w") as f:
        json.dump(ledger, f, indent=2)

def is_aws_available():
    if not S3_BUCKET_NAME or S3_BUCKET_NAME == "your-actual-bucket-name":
        return False
    try:
        s3 = boto3.client("s3", region_name=AWS_REGION)
        s3.head_bucket(Bucket=S3_BUCKET_NAME)
        return True
    except Exception:
        return False

# --- API ENDPOINTS ---

@app.get("/api/health")
def health():
    aws_active = is_aws_available()
    return jsonify({
        "status": "ok",
        "service": "CloudShield API",
        "aws_connected": aws_active,
        "engine": "Live AWS S3" if aws_active else "Local Standalone Vault (Pre-AWS)",
        "bucket": S3_BUCKET_NAME if aws_active else "local_vault_simulated",
        "region": AWS_REGION
    }), 200

@app.get("/api/files")
def list_files():
    if is_aws_available():
        try:
            s3 = boto3.client("s3", region_name=AWS_REGION)
            response = s3.list_objects_v2(Bucket=S3_BUCKET_NAME)
            files = []
            if "Contents" in response:
                for item in response["Contents"]:
                    files.append({
                        "key": item["Key"],
                        "size": item["Size"],
                        "last_modified": item["LastModified"].isoformat()
                    })
            return jsonify({"files": files}), 200
        except ClientError as e:
            return jsonify({"error": str(e)}), 500
    else:
        # Local pre-AWS fallback
        ledger = get_local_ledger()
        files = []
        for key, versions in ledger.items():
            if versions:
                latest = versions[0]
                files.append({
                    "key": key,
                    "size": latest["size"],
                    "last_modified": latest["last_modified"],
                    "checksum": latest.get("sha256")
                })
        return jsonify({"files": files}), 200

@app.post("/api/upload")
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file attached"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    key = file.filename

    if is_aws_available():
        try:
            s3 = boto3.client("s3", region_name=AWS_REGION)
            s3.upload_fileobj(file, S3_BUCKET_NAME, key)
            return jsonify({"message": "File uploaded to AWS S3", "key": key}), 201
        except ClientError as e:
            return jsonify({"error": str(e)}), 500
    else:
        # Local pre-AWS upload & version creation
        content = file.read()
        sha256 = hashlib.sha256(content).hexdigest()
        version_id = f"ver-{uuid.uuid4().hex[:8]}"
        
        # Save file snapshot locally
        saved_filename = f"{version_id}_{key}"
        with open(os.path.join(LOCAL_VAULT_DIR, saved_filename), "wb") as f:
            f.write(content)

        ledger = get_local_ledger()
        if key not in ledger:
            ledger[key] = []

        # Set all previous as not latest
        for v in ledger[key]:
            v["is_latest"] = False

        new_entry = {
            "version_id": version_id,
            "is_latest": True,
            "last_modified": datetime.now().isoformat(),
            "size": len(content),
            "sha256": sha256,
            "stored_file": saved_filename
        }
        ledger[key].insert(0, new_entry)
        save_local_ledger(ledger)

        return jsonify({
            "message": "File backed up locally (Pre-AWS Mode)",
            "key": key,
            "version_id": version_id,
            "sha256": sha256
        }), 201

@app.get("/api/versions")
def list_versions():
    key = request.args.get("key")
    if not key:
        return jsonify({"error": "Query param 'key' is required"}), 400

    if is_aws_available():
        try:
            s3 = boto3.client("s3", region_name=AWS_REGION)
            resp = s3.list_object_versions(Bucket=S3_BUCKET_NAME, Prefix=key)
            versions = []
            if "Versions" in resp:
                for ver in resp["Versions"]:
                    if ver["Key"] == key:
                        versions.append({
                            "version_id": ver["VersionId"],
                            "is_latest": ver["IsLatest"],
                            "last_modified": ver["LastModified"].isoformat(),
                            "size": ver["Size"]
                        })
            return jsonify({"key": key, "versions": versions}), 200
        except ClientError as e:
            return jsonify({"error": str(e)}), 500
    else:
        ledger = get_local_ledger()
        return jsonify({"key": key, "versions": ledger.get(key, [])}), 200

@app.post("/api/restore")
def restore_version():
    data = request.get_json() or {}
    key = data.get("key")
    version_id = data.get("versionId")

    if not key or not version_id:
        return jsonify({"error": "'key' and 'versionId' required"}), 400

    if is_aws_available():
        try:
            s3 = boto3.client("s3", region_name=AWS_REGION)
            copy_source = {"Bucket": S3_BUCKET_NAME, "Key": key, "VersionId": version_id}
            res = s3.copy_object(Bucket=S3_BUCKET_NAME, CopySource=copy_source, Key=key)
            return jsonify({"message": "Version restored on AWS S3", "new_version_id": res.get("VersionId")}), 200
        except ClientError as e:
            return jsonify({"error": str(e)}), 500
    else:
        # Local DR restore logic: Duplicate target version into new latest head
        ledger = get_local_ledger()
        if key not in ledger:
            return jsonify({"error": "Key not found"}), 404

        target = next((v for v in ledger[key] if v["version_id"] == version_id), None)
        if not target:
            return jsonify({"error": "VersionId not found"}), 404

        new_version_id = f"ver-restore-{uuid.uuid4().hex[:8]}"
        new_stored = f"{new_version_id}_{key}"

        # Copy file content locally
        src_path = os.path.join(LOCAL_VAULT_DIR, target["stored_file"])
        dst_path = os.path.join(LOCAL_VAULT_DIR, new_stored)
        
        with open(src_path, "rb") as src, open(dst_path, "wb") as dst:
            dst.write(src.read())

        for v in ledger[key]:
            v["is_latest"] = False

        new_entry = {
            "version_id": new_version_id,
            "is_latest": True,
            "last_modified": datetime.now().isoformat(),
            "size": target["size"],
            "sha256": target["sha256"],
            "stored_file": new_stored
        }
        ledger[key].insert(0, new_entry)
        save_local_ledger(ledger)

        return jsonify({
            "message": f"Successfully restored snapshot {version_id} as current head",
            "key": key,
            "new_version_id": new_version_id
        }), 200

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)