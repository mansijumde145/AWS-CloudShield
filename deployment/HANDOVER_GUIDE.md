# AWS CloudShield: Infrastructure Deployment & Teammate Handover Guide

This document accompanies the automated AWS CloudShell setup script for **AWS CloudShield** (`deployment/cloudshield_aws_setup.sh`).

---

## 1. Quick Reference: Roles & Responsibilities

| Role | Teammate | Primary Responsibility | Key Files |
| :--- | :--- | :--- | :--- |
| **AWS Lead** | Teammate 1 | Execute `cloudshield_aws_setup.sh` in AWS CloudShell, verify S3 DR mechanics, hand over credentials | `deployment/cloudshield_aws_setup.sh`, `deployment/iam-policy.json` |
| **Backend Lead** | Teammate 2 | Configure `backend/.env`, run Flask API, verify Boto3 S3 live routes | `backend/app.py`, `backend/.env.example`, `backend/requirements.txt` |
| **Frontend Lead** | Teammate 3 | Run React/Vite dashboard, verify live telemetry and non-destructive restore | `frontend/src/App.jsx`, `frontend/src/services/api.js` |

---

## 2. Infrastructure Architecture Overview

- **AWS Region:** `ap-south-1` (Asia Pacific - Mumbai)
- **Primary S3 Bucket:** `cloudshield-s3-vault-mumbai`
  - Versioning: `Enabled` (Mandatory for point-in-time snapshot recovery)
  - Block Public Access: `Enabled` (4/4 controls enforced - 100% private)
  - Encryption: `SSE-S3 (AES-256)`
- **Dedicated IAM Identity:** `cloudshield-backend-user`
- **IAM Policy:** `CloudShieldBackendS3Policy` (Least-privilege scoped strictly to target bucket)

---

## 3. Teammate 1 (AWS Lead) Execution Instructions

1. Log in to the [AWS Management Console](https://console.aws.amazon.com/).
2. Switch region to **Asia Pacific (Mumbai) `ap-south-1`** from the top right navigation bar.
3. Open **AWS CloudShell** by clicking the terminal icon in the top header.
4. Create the setup script:
   ```bash
   nano cloudshield_aws_setup.sh
   ```
5. Paste the complete script from `deployment/cloudshield_aws_setup.sh`.
6. Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).
7. Make the script executable:
   ```bash
   chmod +x cloudshield_aws_setup.sh
   ```
8. Execute the setup suite:
   ```bash
   ./cloudshield_aws_setup.sh
   ```
9. Once completed, inspect credentials in `cloudshield_backend_credentials.txt`:
   ```bash
   cat ./cloudshield_backend_credentials.txt
   ```
10. Securely transfer the credentials to Teammate 2 and shred the temporary file:
    ```bash
    shred -u ./cloudshield_backend_credentials.txt 2>/dev/null || rm -f ./cloudshield_backend_credentials.txt
    ```

---

## 4. Teammate 2 (Backend Developer) Setup Instructions

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create your `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with the values provided by Teammate 1:
   ```env
   AWS_REGION=ap-south-1
   S3_BUCKET_NAME=cloudshield-s3-vault-mumbai
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   ```
4. Activate the virtual environment and start the Flask backend:
   ```bash
   # Windows PowerShell:
   .\.venv\Scripts\Activate.ps1
   python app.py
   ```
5. Verify health check at `http://127.0.0.1:5000/api/health`. It should report:
   ```json
   {
     "status": "ok",
     "service": "CloudShield API",
     "aws_connected": true,
     "engine": "Live AWS S3",
     "bucket": "cloudshield-s3-vault-mumbai",
     "region": "ap-south-1"
   }
   ```

---

## 5. Teammate 3 (Frontend Developer) Verification

1. In the `frontend/` directory, start the Vite development server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:5173`.
3. The top banner will display:
   `• LIVE AWS S3 CONNECTED: cloudshield-s3-vault-mumbai (ap-south-1)`
4. Upload test files, view version histories, and test snapshot restoration.

