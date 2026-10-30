const BASE_URL = '/api';

export const api = {
  async getHealth() {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch (err) {
      return { status: 'degraded', aws_connected: false, message: err.message };
    }
  },

  async getFiles() {
    try {
      const res = await fetch(`${BASE_URL}/files`);
      if (!res.ok) throw new Error('Failed to fetch files');
      return await res.json();
    } catch (err) {
      // Demo Mode sample files when backend is offline
      return {
        files: [
          { key: 'backups/db_dump_20261025.sql', size: 1048576, last_modified: new Date().toISOString() },
          { key: 'backups/system_config.json', size: 2048, last_modified: new Date().toISOString() }
        ]
      };
    }
  },

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Upload failed');
    }
    return await res.json();
  },

  async getVersions(key) {
    try {
      const res = await fetch(`${BASE_URL}/versions?key=${encodeURIComponent(key)}`);
      if (!res.ok) throw new Error('Failed to fetch versions');
      return await res.json();
    } catch (err) {
      // Demo Mode sample version log
      return {
        key,
        versions: [
          { version_id: 'v2_head_latest_snapshot', is_latest: true, last_modified: new Date().toISOString(), size: 2048 },
          { version_id: 'v1_historical_backup_orig', is_latest: false, last_modified: new Date(Date.now() - 86400000).toISOString(), size: 1980 }
        ]
      };
    }
  },

  async restoreVersion(key, versionId) {
    const res = await fetch(`${BASE_URL}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, versionId }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Restore failed');
    }
    return await res.json();
  }
};

export default api;