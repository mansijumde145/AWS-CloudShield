import requests

BASE_URL = "http://127.0.0.1:5000/api"

def run_tests():
    print("--- 1. Testing Health Check ---")
    r = requests.get(f"{BASE_URL}/health")
    print(r.json())

    print("\n--- 2. Uploading Version 1 ---")
    files = {'file': ('college_data.txt', b'Initial College DR File Content v1')}
    r = requests.post(f"{BASE_URL}/upload", files=files)
    print(r.json())

    print("\n--- 3. Uploading Version 2 (Overwrite Simulation) ---")
    files = {'file': ('college_data.txt', b'Corrupted or Ransomware Overwritten Content v2')}
    r = requests.post(f"{BASE_URL}/upload", files=files)
    print(r.json())

    print("\n--- 4. Listing Version History ---")
    r = requests.get(f"{BASE_URL}/versions?key=college_data.txt")
    data = r.json()
    print(data)

    if data.get("versions") and len(data["versions"]) >= 2:
        older_version_id = data["versions"][-1]["version_id"]
        print(f"\n--- 5. Triggering Restore of Version ID: {older_version_id} ---")
        restore_payload = {"key": "college_data.txt", "versionId": older_version_id}
        r = requests.post(f"{BASE_URL}/restore", json=restore_payload)
        print(r.json())

if __name__ == "__main__":
    run_tests()