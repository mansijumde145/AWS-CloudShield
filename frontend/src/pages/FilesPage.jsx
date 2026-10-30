import { useState, useMemo } from 'react'
import {
  Clock,
  Download,
  FileText,
  Filter,
  HardDrive,
  Layers,
  RotateCcw,
  Search,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { uploadBackupFile, downloadFileVersion } from '../services/api'
import { formatBytes, formatDate } from '../utils/formatters'

export default function FilesPage({
  files,
  onRefreshFiles,
  onSelectFileForVersions,
  onSelectFileForRestore,
  isUploadModalOpen,
  onCloseUploadModal,
  onOpenUploadModal,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [sortBy, setSortBy] = useState('date-desc')

  // Upload modal form state
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadCategory, setUploadCategory] = useState('Application Config')
  const [uploadNote, setUploadNote] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadFeedback, setUploadFeedback] = useState(null) // { type: 'success' | 'error', message: string }

  // Download feedback
  const [downloadingKey, setDownloadingKey] = useState(null)
  const [actionNotice, setActionNotice] = useState(null)

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(files.map((f) => f.category || 'General'))
    return ['ALL', ...Array.from(set)]
  }, [files])

  // Filtered & Sorted files
  const filteredFiles = useMemo(() => {
    let result = files.filter((file) => {
      const matchSearch =
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (file.category && file.category.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchCategory =
        selectedCategory === 'ALL' || file.category === selectedCategory

      return matchSearch && matchCategory
    })

    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.lastModified) - new Date(a.lastModified)
      } else if (sortBy === 'date-asc') {
        return new Date(a.lastModified) - new Date(b.lastModified)
      } else if (sortBy === 'size-desc') {
        return (b.size || 0) - (a.size || 0)
      } else if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name)
      }
      return 0
    })

    return result
  }, [files, searchQuery, selectedCategory, sortBy])

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setUploadFeedback(null)
    }
  }

  // Handle upload submit
  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      setUploadFeedback({ type: 'error', message: 'Please select a file to upload.' })
      return
    }

    setIsUploading(true)
    setUploadFeedback(null)

    try {
      const res = await uploadBackupFile(selectedFile, {
        category: uploadCategory,
        note: uploadNote || 'Manual backup via CloudShield dashboard',
      })

      setUploadFeedback({
        type: 'success',
        message: `${res.message} Version ID: ${res.versionId.substring(0, 14)}...`,
      })
      setSelectedFile(null)
      setUploadNote('')
      if (onRefreshFiles) await onRefreshFiles()

      setTimeout(() => {
        if (onCloseUploadModal) onCloseUploadModal()
        setUploadFeedback(null)
      }, 1800)
    } catch (err) {
      setUploadFeedback({
        type: 'error',
        message: err.message || 'Upload failed. Please check backend connection.',
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Handle download
  const handleDownload = async (fileKey) => {
    setDownloadingKey(fileKey)
    try {
      const res = await downloadFileVersion(fileKey, null)
      setActionNotice({
        type: 'success',
        message: res.isDemo
          ? `Downloaded demo snapshot for "${fileKey.split('/').pop()}".`
          : `Initiated S3 download for "${fileKey.split('/').pop()}".`,
      })
      setTimeout(() => setActionNotice(null), 4000)
    } catch (err) {
      setActionNotice({
        type: 'error',
        message: `Download failed: ${err.message}`,
      })
      setTimeout(() => setActionNotice(null), 4000)
    } finally {
      setDownloadingKey(null)
    }
  }

  return (
    <div className="page-container">
      {/* Header Row */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Backups &amp; Vaulted Files</h1>
          <p className="page-subtitle">
            Catalog of all backed-up objects stored in AWS S3 with version tracking and lifecycle protection.
          </p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenUploadModal}
          >
            <Upload size={15} />
            <span>Upload New Backup</span>
          </button>
        </div>
      </div>

      {/* Global Action Notice */}
      {actionNotice && (
        <div className={`action-notice notice-${actionNotice.type}`}>
          {actionNotice.type === 'success' ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{actionNotice.message}</span>
          <button
            type="button"
            className="notice-close"
            onClick={() => setActionNotice(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="filter-card">
        <div className="filter-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="filter-search-input"
            placeholder="Search by filename, path, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-controls-group">
          <div className="filter-select-wrap">
            <Filter size={14} className="select-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrap">
            <Clock size={14} className="select-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="size-desc">Largest Size</option>
              <option value="name-asc">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Files Table Card */}
      <div className="content-card table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Object / Key</th>
                <th>Category</th>
                <th>Size</th>
                <th>Versions</th>
                <th>Storage Class</th>
                <th>Backup Status</th>
                <th>Last Vaulted</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state-cell">
                    <div className="empty-state-content">
                      <HardDrive size={32} className="empty-icon" />
                      <h4 className="empty-title">No Backed-Up Files Found</h4>
                      <p className="empty-desc">
                        {searchQuery || selectedCategory !== 'ALL'
                          ? 'No files match your current search or category filter.'
                          : 'No files have been vaulted yet. Click "Upload New Backup" to begin.'}
                      </p>
                      {(searchQuery || selectedCategory !== 'ALL') && (
                        <button
                          type="button"
                          className="btn btn-secondary mt-2"
                          onClick={() => {
                            setSearchQuery('')
                            setSelectedCategory('ALL')
                          }}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.key} className="table-row">
                    <td className="td-primary">
                      <div className="file-info-cell">
                        <FileText size={18} className="file-icon" />
                        <div>
                          <div className="file-name">{file.name}</div>
                          <div className="file-path font-mono">{file.key}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-pill">{file.category || 'General'}</span>
                    </td>
                    <td className="font-mono">{formatBytes(file.size)}</td>
                    <td>
                      <button
                        type="button"
                        className="version-count-pill"
                        onClick={() => onSelectFileForVersions(file.key)}
                        title="Click to view full version history"
                      >
                        <Layers size={12} />
                        <span>{file.versionCount || file.versions?.length || 1} revs</span>
                      </button>
                    </td>
                    <td>
                      <StatusBadge
                        type={file.storageClass || 'STANDARD'}
                        label={file.storageClass || 'STANDARD'}
                        size="sm"
                      />
                    </td>
                    <td>
                      <StatusBadge
                        type={file.status || 'Protected'}
                        label={file.status || 'Protected'}
                        size="sm"
                      />
                    </td>
                    <td className="text-muted text-sm">
                      {formatDate(file.lastModified)}
                    </td>
                    <td className="td-actions">
                      <div className="actions-cluster">
                        <button
                          type="button"
                          className="btn-action-icon"
                          onClick={() => onSelectFileForVersions(file.key)}
                          title="View Version History"
                        >
                          <Layers size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-action-icon btn-action-recovery"
                          onClick={() => onSelectFileForRestore(file.key)}
                          title="Open in Recovery Center"
                        >
                          <RotateCcw size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-action-icon"
                          onClick={() => handleDownload(file.key)}
                          disabled={downloadingKey === file.key}
                          title="Download Latest Version"
                        >
                          <Download size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="modal-backdrop" onClick={onCloseUploadModal}>
          <div
            className="modal-container upload-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div className="modal-icon-badge modal-icon-primary">
                  <Upload size={18} />
                </div>
                <h3 className="modal-title">Upload Backup to AWS S3</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={onCloseUploadModal}
                disabled={isUploading}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div className="modal-body">
                {uploadFeedback && (
                  <div className={`form-feedback feedback-${uploadFeedback.type}`}>
                    {uploadFeedback.type === 'success' ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                    <span>{uploadFeedback.message}</span>
                  </div>
                )}

                {/* Dropzone / File Picker */}
                <div className="upload-dropzone">
                  <input
                    type="file"
                    id="backupFileInput"
                    className="file-input-hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  <label htmlFor="backupFileInput" className="dropzone-label">
                    <Upload size={28} className="dropzone-icon" />
                    <span className="dropzone-text-primary">
                      {selectedFile ? selectedFile.name : 'Click to choose a file or drag & drop'}
                    </span>
                    <span className="dropzone-text-sub">
                      {selectedFile
                        ? `${formatBytes(selectedFile.size)} selected`
                        : 'Any file format: SQL dumps, YAML manifests, JSON configs, Tarballs'}
                    </span>
                  </label>
                </div>

                {/* Metadata Form Controls */}
                <div className="form-group mt-3">
                  <label className="form-label" htmlFor="categorySelect">
                    Workload Category
                  </label>
                  <select
                    id="categorySelect"
                    className="form-control"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    disabled={isUploading}
                  >
                    <option value="Database Dump">Database Dump (SQL/RDS)</option>
                    <option value="Infrastructure as Code">Infrastructure as Code (Kubernetes/Terraform)</option>
                    <option value="Application Config">Application Config (JSON/Env)</option>
                    <option value="Network Auditing">Network Auditing (VPC Logs)</option>
                    <option value="Encrypted Vault">Encrypted Customer Vault</option>
                    <option value="General Backup">General Cloud Workload</option>
                  </select>
                </div>

                <div className="form-group mt-3">
                  <label className="form-label" htmlFor="uploadNote">
                    Revision Note / Changelog
                  </label>
                  <input
                    id="uploadNote"
                    type="text"
                    className="form-control"
                    placeholder="e.g., Pre-deployment checkpoint for schema v2.5"
                    value={uploadNote}
                    onChange={(e) => setUploadNote(e.target.value)}
                    disabled={isUploading}
                  />
                </div>

                <div className="modal-info-box mt-3">
                  <p>
                    <strong>AWS S3 Versioning:</strong> If an object with this filename already exists, AWS S3 creates a new immutable version ID and preserves the previous revision.
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onCloseUploadModal}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUploading || !selectedFile}
                >
                  {isUploading ? 'Uploading to S3...' : 'Start Vault Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
