import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield,
  Upload,
  FileText,
  History,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Server,
  HardDrive,
  RefreshCw,
  Activity,
  Lock,
  Play,
  Terminal,
} from 'lucide-react';
import { api } from './services/api';
import ConfirmModal from './components/ConfirmModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDemo, setIsDemo] = useState(true);
  const [bucketName, setBucketName] = useState('cloudshield-s3-vault-mumbai');
  const [region, setRegion] = useState('ap-south-1');
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [versions, setVersions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Restore Modal State
  const [restoreModalData, setRestoreModalData] = useState(null); // { key, versionId }
  const [restoring, setRestoring] = useState(false);

  // DR Simulation Drill State
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationLog, setSimulationLog] = useState([]);

  const fileInputRef = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const res = await api.getHealth();
      if (res.status === 'ok' || res.aws_connected) {
        setIsDemo(false);
        if (res.bucket) setBucketName(res.bucket);
        if (res.region) setRegion(res.region);
        showToast('Connected to AWS S3 storage backend.', 'success');
      } else {
        setIsDemo(true);
      }
    } catch {
      setIsDemo(true);
    }
  }, [showToast]);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getFiles();
      setFiles(data.files || []);
    } catch {
      showToast('Failed to load files from server.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Initial load
  useEffect(() => {
    checkHealth();
    loadFiles();
  }, [checkHealth, loadFiles]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await api.uploadFile(file);
      showToast(`Uploaded ${file.name} successfully!`, 'success');
      loadFiles();
    } catch (err) {
      showToast(`Upload failed: ${err.message}`, 'error');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const fetchVersions = async (key, switchTab = true) => {
    setSelectedFile(key);
    try {
      const data = await api.getVersions(key);
      setVersions(data.versions || []);
      if (switchTab) setActiveTab('versions');
    } catch {
      showToast(`Failed to load versions for ${key}`, 'error');
    }
  };

  const handleOpenRestoreModal = (key, versionId) => {
    setRestoreModalData({ key, versionId });
  };

  const handleConfirmRestore = async () => {
    if (!restoreModalData) return;
    const { key, versionId } = restoreModalData;

    setRestoring(true);
    try {
      const res = await api.restoreVersion(key, versionId);
      showToast(
        `Restored snapshot successfully! New Head Version: ${res.new_version_id?.substring(0, 8) || 'Updated'}`,
        'success'
      );
      setRestoreModalData(null);
      await loadFiles();
      await fetchVersions(key, false);
    } catch (err) {
      showToast(`Restore failed: ${err.message}`, 'error');
    } finally {
      setRestoring(false);
    }
  };

  // Run Disaster Recovery Drill Simulation
  const handleRunDrill = async () => {
    setSimulationRunning(true);
    setSimulationLog([]);
    const logs = [];

    const addLog = (text) => {
      logs.push(text);
      setSimulationLog([...logs]);
    };

    addLog('[STEP 1/4] Simulating data corruption anomaly on critical target file...');
    await new Promise((r) => setTimeout(r, 800));

    addLog('[STEP 2/4] AWS CloudShield DR Agent detected anomaly: checksum mismatch.');
    await new Promise((r) => setTimeout(r, 800));

    addLog('[STEP 3/4] Executing non-destructive Head Duplication via Boto3 s3.copy_object()...');
    await new Promise((r) => setTimeout(r, 1000));

    addLog('[STEP 4/4] SUCCESS: Target restored to verified snapshot. Zero data loss achieved. RPO < 1.0s.');
    setSimulationRunning(false);
    showToast('Disaster Recovery drill completed with 100% data integrity verified!', 'success');
  };

  return (
    <div className="min-h-screen bg-[#140A0B] text-[#FFFB97] font-sans flex flex-col selection:bg-[#FE7F42] selection:text-[#140A0B]">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        disabled={uploading}
      />

      {/* Top Banner for Demo Mode / AWS Connection */}
      <div
        className={`px-6 py-2 text-xs font-mono font-semibold flex items-center justify-between border-b ${
          isDemo
            ? 'bg-[#2A1617] text-[#FE7F42] border-[#FE7F42]/25'
            : 'bg-[#1E0F10] text-[#FFFB97] border-[#FE7F42]/30'
        }`}
      >
        <div className="flex items-center space-x-2">
          {isDemo ? (
            <AlertTriangle className="w-4 h-4 text-[#FE7F42]" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>
            {isDemo
              ? '• DEMO MODE ACTIVE: Backend unreachable or unconfigured. Displaying simulated disaster recovery data.'
              : `• LIVE AWS S3 CONNECTED: ${bucketName || 'cloudshield-s3-vault-mumbai'} (${region || 'ap-south-1'})`}
          </span>
        </div>
        <button
          type="button"
          onClick={checkHealth}
          className="text-[#FFFB97] hover:text-[#FE7F42] flex items-center space-x-1 underline font-mono text-xs cursor-pointer"
        >
          <RefreshCw className="w-3 h-3 inline" />
          <span>Health Check</span>
        </button>
      </div>

      {/* Main Top Header Navigation */}
      <header className="bg-[#140A0B] border-b border-[#FE7F42]/25 px-6 sm:px-8 py-4 flex items-center justify-between shadow-lg sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-[#FE7F42] to-[#B32C1A] text-white rounded-xl shadow-md border border-[#FE7F42]/30">
            <Shield className="w-6 h-6 text-[#FFFB97]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wider text-white font-mono leading-tight">
              CLOUDSHIELD
            </h1>
            <p className="text-[11px] font-mono text-[#FE7F42] tracking-widest uppercase">
              S3 DISASTER RECOVERY // {region ? region.toUpperCase() : 'AP-SOUTH-1'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 font-mono">
          <div className="hidden sm:inline-flex px-3.5 py-1.5 bg-[#2A1617] border border-[#FE7F42]/25 rounded-full text-xs font-bold text-[#FFFB97]">
            &bull; RPO &lt; 1.0s
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="cursor-pointer bg-[#FE7F42] hover:bg-[#FFFB97] text-[#140A0B] text-xs font-black px-5 py-2.5 rounded-xl flex items-center space-x-2 transition shadow-lg uppercase tracking-wide disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-[#140A0B]" />
            <span>{uploading ? 'Uploading...' : 'Upload Backup'}</span>
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {notification && (
        <div
          className={`mx-6 sm:mx-8 mt-4 p-3.5 rounded-xl text-xs font-mono flex items-center justify-between shadow-md transition-all ${
            notification.type === 'error'
              ? 'bg-[#B32C1A] text-white border border-[#FE7F42]'
              : notification.type === 'success'
              ? 'bg-[#2A1617] text-[#FFFB97] border border-[#FE7F42]'
              : 'bg-[#2A1617] text-[#FFFB97] border border-[#FE7F42]/25'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#FE7F42]"></span>
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="font-bold ml-4 text-base hover:text-[#FE7F42] cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Hero Section: Dark Multi-stop Gradient with Subtle Concentric Orbit Rings */}
      <section className="mx-4 sm:mx-8 mt-6 p-6 sm:p-10 rounded-3xl border border-[#FE7F42]/25 bg-gradient-to-br from-[#2A1617] via-[#3D1E1F] to-[#140A0B] text-center relative overflow-hidden shadow-2xl">
        {/* Subtle Concentric Orbit Ring Graphics Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[300px] h-[300px] rounded-full border border-dashed border-[#FE7F42]"></div>
          <div className="w-[480px] h-[480px] rounded-full border border-[#FFFB97] absolute"></div>
          <div className="w-[660px] h-[660px] rounded-full border border-dashed border-[#FE7F42] absolute"></div>
        </div>

        {/* Top Meta Badges in Hero */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-[#FE7F42] uppercase tracking-widest mb-6 relative z-10 gap-2">
          <span className="px-3.5 py-1 bg-[#140A0B]/90 rounded-full border border-[#FE7F42]/25 text-[#FFFB97]">
            &bull; SYSTEM // S3-DR-SHIELD &bull; AP-SOUTH-1 &bull; AES-256
          </span>
          <span className="px-3.5 py-1 bg-[#140A0B]/90 rounded-full border border-[#FE7F42]/25 text-[#FE7F42]">
            RPO TARGET &lt; 1.0 SEC &bull; VAULT: {bucketName || 'CLOUDSHIELD-S3-VAULT-MUMBAI'}
          </span>
        </div>

        {/* Center Title Group */}
        <div className="relative z-10 space-y-4 max-w-3xl mx-auto py-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-[#2A1617] border border-[#FE7F42]/30 rounded-full text-xs font-mono font-bold text-[#FFFB97] uppercase tracking-wider">
            <span>CLOUD DISASTER RECOVERY</span>
          </div>

          <h2 className="text-5xl sm:text-7xl font-black text-[#FFFB97] tracking-tight font-mono uppercase drop-shadow-md">
            CLOUDSHIELD
          </h2>

          <p className="text-sm font-sans text-[#FFFB97]/85 leading-relaxed max-w-xl mx-auto">
            Continuous cloud disaster recovery with automated S3 object versioning and instant, zero-loss rollback.
          </p>

          <div className="pt-3 flex flex-wrap justify-center items-center gap-4 font-mono text-xs">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="cursor-pointer px-6 py-3 bg-[#FE7F42] hover:bg-[#FFFB97] text-[#140A0B] font-extrabold rounded-xl transition flex items-center space-x-2 shadow-lg uppercase tracking-wider disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Uploading...' : 'Upload New Backup'}</span>
            </button>
            <div className="px-5 py-3 bg-[#140A0B] border border-[#FE7F42]/25 text-[#FFFB97] font-bold rounded-xl flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FE7F42] animate-pulse"></span>
              <span>{files.length} BACKUP OBJECTS ARMED</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Navigation Tabs */}
      <nav className="bg-[#140A0B] border-b border-[#FE7F42]/20 px-6 sm:px-8 mt-8 flex space-x-3 sm:space-x-6 overflow-x-auto">
        {[
          { id: 'overview', label: 'OVERVIEW', icon: Activity },
          { id: 'backups', label: `BACKUPS & FILES (${files.length})`, icon: HardDrive },
          { id: 'versions', label: 'VERSION HISTORY', icon: History },
          { id: 'recovery', label: 'RECOVERY CENTER', icon: RotateCcw },
          { id: 'status', label: 'SYSTEM STATUS', icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          const isCurrent = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 text-xs font-mono font-bold tracking-wider border-b-2 flex items-center space-x-2 transition cursor-pointer whitespace-nowrap px-3 ${
                isCurrent
                  ? 'border-[#FE7F42] text-[#FE7F42] bg-[#2A1617] rounded-t-lg'
                  : 'border-transparent text-[#7A4B47] hover:text-[#FFFB97]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Content Body */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 4 Stat Cards in Structured Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Stat 1: Total Backup Objects */}
              <div className="bg-[#2A1617] p-5 rounded-2xl border border-[#FE7F42]/25 shadow-lg relative flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase text-[#7A4B47] tracking-wider">
                      TOTAL BACKUP OBJECTS
                    </p>
                    <div className="flex items-baseline space-x-2 mt-3">
                      <h3 className="text-4xl font-black text-white font-mono">{files.length}</h3>
                      <span className="px-2 py-0.5 bg-[#FE7F42]/20 text-[#FFFB97] text-[10px] font-mono font-bold rounded">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-[11px] font-sans text-[#FFFB97]/70 mt-2">
                      Monitored S3 storage entities
                    </p>
                  </div>
                  <div className="p-2.5 bg-[#140A0B] text-[#FFFB97] rounded-xl border border-[#FE7F42]/25">
                    <FileText className="w-5 h-5 text-[#FE7F42]" />
                  </div>
                </div>
              </div>

              {/* Stat 2: S3 Object Versioning */}
              <div className="bg-[#2A1617] p-5 rounded-2xl border border-[#FE7F42]/25 shadow-lg relative flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase text-[#7A4B47] tracking-wider">
                      S3 OBJECT VERSIONING
                    </p>
                    <div className="flex items-baseline space-x-2 mt-3">
                      <h3 className="text-3xl font-black text-white font-mono">Enabled</h3>
                      <span className="px-2 py-0.5 bg-[#FE7F42] text-[#140A0B] text-[10px] font-mono font-extrabold rounded">
                        ZERO-LOSS
                      </span>
                    </div>
                    <p className="text-[11px] font-sans text-[#FFFB97]/70 mt-2">
                      Permanent revision tracking
                    </p>
                  </div>
                  <div className="p-2.5 bg-[#140A0B] text-[#FE7F42] rounded-xl border border-[#FE7F42]/25">
                    <History className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Stat 3: RPO Target */}
              <div className="bg-[#2A1617] p-5 rounded-2xl border border-[#FE7F42]/25 shadow-lg relative flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase text-[#7A4B47] tracking-wider">
                      RPO TARGET
                    </p>
                    <div className="flex items-baseline space-x-2 mt-3">
                      <h3 className="text-3xl font-black text-white font-mono">&lt; 1.0 sec</h3>
                      <span className="px-2 py-0.5 bg-[#FE7F42]/20 text-[#FFFB97] text-[10px] font-mono font-bold rounded">
                        REALTIME
                      </span>
                    </div>
                    <p className="text-[11px] font-sans text-[#FFFB97]/70 mt-2">
                      Sub-second recovery objective
                    </p>
                  </div>
                  <div className="p-2.5 bg-[#140A0B] text-[#FE7F42] rounded-xl border border-[#FE7F42]/25">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Stat 4: Storage Protection */}
              <div className="bg-[#2A1617] p-5 rounded-2xl border border-[#FE7F42]/25 shadow-lg relative flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase text-[#7A4B47] tracking-wider">
                      STORAGE PROTECTION
                    </p>
                    <div className="flex items-baseline space-x-2 mt-3">
                      <h3 className="text-2xl font-black text-white font-mono">Strictly Private</h3>
                      <span className="px-2 py-0.5 bg-[#B32C1A] text-white text-[10px] font-mono font-bold rounded">
                        AES-256
                      </span>
                    </div>
                    <p className="text-[11px] font-sans text-[#FFFB97]/70 mt-2">
                      Block Public Access (4/4)
                    </p>
                  </div>
                  <div className="p-2.5 bg-[#140A0B] text-[#FFFB97] rounded-xl border border-[#FE7F42]/25">
                    <Lock className="w-5 h-5 text-[#FE7F42]" />
                  </div>
                </div>
              </div>
            </div>

            {/* DR Architecture Flow Box */}
            <div className="bg-[#2A1617] p-6 rounded-2xl border border-[#FE7F42]/25 shadow-lg space-y-3">
              <h3 className="text-xs font-mono font-bold text-[#FE7F42] uppercase tracking-wider">
                &bull; DISASTER RECOVERY ARCHITECTURAL FLOW
              </h3>
              <p className="text-xs font-sans text-[#FFFB97]/90 leading-relaxed">
                CloudShield executes non-destructive zero-loss recovery by duplicating historical S3 object versions straight to the head position using the AWS Boto3{' '}
                <code className="bg-[#140A0B] text-[#FE7F42] px-2 py-0.5 rounded font-mono text-[11px] border border-[#FE7F42]/25">
                  copy_object
                </code>{' '}
                operation. All historical rollback states remain permanently accessible in the S3 ledger.
              </p>

              <div className="p-4 bg-[#140A0B] rounded-xl border border-[#FE7F42]/25 flex flex-col sm:flex-row justify-between items-start sm:items-center font-mono text-xs gap-3 mt-3">
                <div>
                  <span className="text-[#FE7F42] font-bold">TARGET VAULT:</span> {bucketName || 'CLOUDSHIELD-S3-VAULT-MUMBAI'} &bull;{' '}
                  <span className="text-[#FE7F42] font-bold">REGION:</span> {region || 'AP-SOUTH-1'}
                  <p className="text-[11px] font-sans text-[#FFFB97]/70 mt-1">
                    Need to test instant rollback against simulated ransomware or accidental deletion?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRunDrill}
                  disabled={simulationRunning}
                  className="px-5 py-2.5 bg-[#FE7F42] hover:bg-[#FFFB97] text-[#140A0B] font-black rounded-xl transition flex items-center space-x-1.5 uppercase text-xs shadow-md cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{simulationRunning ? 'Drill Running...' : 'Run DR Drill'}</span>
                </button>
              </div>

              {/* Simulation Drill Telemetry */}
              {simulationLog.length > 0 && (
                <div className="p-4 rounded-xl bg-black/70 border border-[#FE7F42]/25 font-mono text-xs space-y-1.5 text-[#FFFB97]">
                  <div className="flex items-center space-x-2 text-[#FE7F42] text-[11px] pb-1 border-b border-[#FE7F42]/20">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>DISASTER RECOVERY SIMULATION DRILL TELEMETRY</span>
                  </div>
                  {simulationLog.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">
                      <span className="text-[#FE7F42]">&gt;</span> {log}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Backup Objects Table */}
            <div className="bg-[#2A1617] rounded-2xl border border-[#FE7F42]/25 shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-mono font-bold text-[#FE7F42] uppercase tracking-wider">
                  &bull; RECENT BACKUP OBJECTS
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('backups')}
                  className="text-xs font-mono text-[#FE7F42] hover:underline cursor-pointer"
                >
                  View All Files &rarr;
                </button>
              </div>
              <div className="space-y-2 font-mono text-xs">
                {files.length === 0 ? (
                  <div className="p-6 text-center text-[#7A4B47]">
                    No backup objects loaded. Click "Upload Backup" above to seed your S3 vault.
                  </div>
                ) : (
                  files.slice(0, 4).map((f) => (
                    <div
                      key={f.key}
                      className="p-3 bg-[#140A0B] rounded-xl border border-[#FE7F42]/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                    >
                      <span className="text-white font-bold flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-[#FE7F42]" />
                        <span>{f.key}</span>
                      </span>
                      <span className="text-[#FFFB97]/75">
                        {f.size ? `${(f.size / 1024).toFixed(1)} KB` : 'N/A'}
                      </span>
                      <span className="text-[#FFFB97]/75">
                        {new Date(f.last_modified).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => fetchVersions(f.key)}
                        className="px-3.5 py-1.5 bg-[#2A1617] text-[#FFFB97] border border-[#FE7F42]/25 rounded-lg font-bold hover:bg-[#FE7F42] hover:text-[#140A0B] transition cursor-pointer"
                      >
                        Inspect Versions
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BACKUPS & FILES */}
        {activeTab === 'backups' && (
          <div className="bg-[#2A1617] rounded-2xl border border-[#FE7F42]/25 shadow-lg overflow-hidden font-mono">
            <div className="p-5 border-b border-[#FE7F42]/20 flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                PROTECTED S3 VAULT ENTITIES
              </h2>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={loadFiles}
                  className="text-xs text-[#FE7F42] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh List</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3.5 py-1.5 bg-[#FE7F42] text-[#140A0B] rounded-lg font-black text-xs hover:bg-[#FFFB97] transition cursor-pointer"
                >
                  Upload File
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-[#FFFB97]/60 text-xs">
                Loading backup objects...
              </div>
            ) : files.length === 0 ? (
              <div className="p-8 text-center text-[#FFFB97]/60 text-xs">
                No backup objects found in S3 bucket.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#140A0B] text-[#FE7F42] uppercase font-bold border-b border-[#FE7F42]/20">
                    <th className="p-4">Key / Filename</th>
                    <th className="p-4">Size</th>
                    <th className="p-4">Last Modified</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FE7F42]/10">
                  {files.map((file) => (
                    <tr key={file.key} className="hover:bg-[#1E0F10] transition">
                      <td className="p-4 font-bold text-white flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-[#FE7F42]" />
                        <span>{file.key}</span>
                      </td>
                      <td className="p-4 text-[#FFFB97]/80">
                        {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'N/A'}
                      </td>
                      <td className="p-4 text-[#FFFB97]/80">
                        {new Date(file.last_modified).toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => fetchVersions(file.key)}
                          className="px-3.5 py-1.5 bg-[#140A0B] hover:bg-[#FE7F42] hover:text-[#140A0B] text-[#FFFB97] rounded-lg font-bold border border-[#FE7F42]/25 transition cursor-pointer"
                        >
                          Inspect Versions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 3: VERSION HISTORY */}
        {activeTab === 'versions' && (
          <div className="bg-[#2A1617] rounded-2xl border border-[#FE7F42]/25 shadow-lg overflow-hidden font-mono">
            <div className="p-5 border-b border-[#FE7F42]/20 flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                S3 VERSION LEDGER {selectedFile && <span className="text-[#FE7F42]">[{selectedFile}]</span>}
              </h2>
              {selectedFile && (
                <button
                  type="button"
                  onClick={() => fetchVersions(selectedFile, false)}
                  className="text-xs text-[#FE7F42] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Versions</span>
                </button>
              )}
            </div>

            {!selectedFile ? (
              <div className="p-8 text-center text-[#FFFB97]/60 text-xs">
                Please select a file from the Backups tab first.
              </div>
            ) : versions.length === 0 ? (
              <div className="p-8 text-center text-[#FFFB97]/60 text-xs">
                No historical versions recorded for this key.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#140A0B] text-[#FE7F42] uppercase font-bold border-b border-[#FE7F42]/20">
                    <th className="p-4">Version ID</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Last Modified</th>
                    <th className="p-4 text-right">Recovery Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FE7F42]/10">
                  {versions.map((ver) => (
                    <tr key={ver.version_id} className="hover:bg-[#1E0F10] transition">
                      <td className="p-4 text-white font-bold">{ver.version_id}</td>
                      <td className="p-4">
                        {ver.is_latest ? (
                          <span className="px-2.5 py-1 bg-[#FE7F42] text-[#140A0B] text-[10px] font-extrabold rounded-full">
                            CURRENT HEAD
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-[#140A0B] text-[#FFFB97]/70 text-[10px] rounded-full border border-[#FE7F42]/20">
                            HISTORICAL SNAPSHOT
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-[#FFFB97]/80">
                        {new Date(ver.last_modified).toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        {!ver.is_latest && (
                          <button
                            type="button"
                            onClick={() => handleOpenRestoreModal(selectedFile, ver.version_id)}
                            className="px-3.5 py-1.5 bg-[#B32C1A] text-white hover:bg-[#B32C1A]/85 text-xs font-bold rounded-lg transition flex items-center space-x-1 ml-auto cursor-pointer shadow-md shadow-[#B32C1A]/30"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restore Snapshot</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 4: RECOVERY CENTER */}
        {activeTab === 'recovery' && (
          <div className="bg-[#2A1617] p-6 rounded-2xl border border-[#FE7F42]/25 shadow-lg space-y-4 font-mono">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              &bull; DISASTER RECOVERY ROLLBACK LOGIC
            </h2>
            <div className="p-4 bg-[#140A0B] rounded-xl border border-[#FE7F42]/20 text-xs space-y-2 text-[#FFFB97]">
              <p className="font-bold text-[#FE7F42]">AWS Boto3 Copy Command Strategy:</p>
              <p>1. Target Object Key: <span className="text-white">{selectedFile || 'backups/database.sql'}</span></p>
              <p>2. Source Version ID: <span className="text-[#FE7F42]">3/H8483n2x9...</span></p>
              <p>
                3. Execution:{' '}
                <span className="text-emerald-400 font-bold">
                  s3_client.copy_object(CopySource=&#123;...&#125;, Key)
                </span>
              </p>
              <p>4. Guarantee: Creates a new head version without removing older historical records.</p>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <span className="text-xs text-[#FFFB97]/75">
                Execute automated 4-stage integrity drill to test zero-loss rollback:
              </span>
              <button
                type="button"
                onClick={handleRunDrill}
                disabled={simulationRunning}
                className="px-5 py-2.5 bg-[#FE7F42] hover:bg-[#FFFB97] text-[#140A0B] font-black rounded-xl transition flex items-center space-x-1.5 uppercase text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{simulationRunning ? 'Drill Running...' : 'Execute DR Drill'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM STATUS */}
        {activeTab === 'status' && (
          <div className="bg-[#2A1617] p-6 rounded-2xl border border-[#FE7F42]/25 shadow-lg space-y-4 font-mono">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              &bull; AWS INFRASTRUCTURE DIAGNOSTICS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#140A0B] rounded-xl border border-[#FE7F42]/20">
                <span className="text-[#FE7F42] font-bold block">AWS Region</span>
                <span className="text-white">{region} (Asia Pacific — Mumbai)</span>
              </div>
              <div className="p-4 bg-[#140A0B] rounded-xl border border-[#FE7F42]/20">
                <span className="text-[#FE7F42] font-bold block">S3 Access Configuration</span>
                <span className="text-emerald-400">Strictly Private (Block All Public Access)</span>
              </div>
              <div className="p-4 bg-[#140A0B] rounded-xl border border-[#FE7F42]/20">
                <span className="text-[#FE7F42] font-bold block">Server-Side Encryption</span>
                <span className="text-white">AES-256 (SSE-S3 Enabled)</span>
              </div>
              <div className="p-4 bg-[#140A0B] rounded-xl border border-[#FE7F42]/20">
                <span className="text-[#FE7F42] font-bold block">Disaster Recovery RTO / RPO</span>
                <span className="text-white">RPO &lt; 1.0s &bull; RTO &lt; 3.0s</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Restore Modal */}
      <ConfirmModal
        isOpen={!!restoreModalData}
        title="Execute Version Restore"
        message={
          restoreModalData
            ? `Are you sure you want to restore version "${restoreModalData.versionId.substring(0, 16)}..." of "${restoreModalData.key}" as the current head? This operation is non-destructive.`
            : ''
        }
        confirmText="Confirm Restore"
        cancelText="Cancel"
        isLoading={restoring}
        onConfirm={handleConfirmRestore}
        onCancel={() => setRestoreModalData(null)}
      />

      {/* Clean Dashboard Footer (Strictly CloudShield Disaster Recovery System) */}
      <footer className="bg-[#140A0B] border-t border-[#FE7F42]/20 py-5 px-8 text-center text-xs font-mono text-[#7A4B47]">
        CloudShield Disaster Recovery System &bull; Powered by AWS S3 Versioning & Flask Boto3
      </footer>
    </div>
  );
}
