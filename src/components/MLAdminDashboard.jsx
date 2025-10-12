import React, { useState, useEffect } from 'react';
import {
  Database, 
  RefreshCw, 
  Search, 
  Download, 
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  FileText,
  Target,
  Zap
} from 'lucide-react';

const MLAdminDashboard = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [documents, setDocuments] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [activeSyncJobs, setActiveSyncJobs] = useState([]);
  const [recentSyncJobs, setRecentSyncJobs] = useState([]);
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    role: 'ml_engineer',
    name: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0
  });

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
      fetchSyncStatus();
    } else if (activeTab === 'documents') {
      fetchDocuments();
    } else if (activeTab === 'users') {
      fetchUsers();
      fetchUserStats();
    } else if (activeTab === 'sync') {
      fetchRecentSyncJobs();
    }
  }, [activeTab]);

  // Poll for active sync jobs
  useEffect(() => {
    let pollInterval;
    
    const pollSyncJobs = async () => {
      try {
        const response = await fetch('/api/ml/sync/jobs', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        if (data.success && data.jobs) {
          const running = data.jobs.filter(j => j.status === 'running');
          setActiveSyncJobs(running);
          setRecentSyncJobs(data.jobs.slice(0, 10));
          
          // If there are running jobs, keep polling
          if (running.length > 0) {
            setSyncing(true);
          } else {
            setSyncing(false);
            if (activeTab === 'documents') {
              fetchDocuments(); // Refresh documents when sync completes
            }
            if (activeTab === 'overview') {
              fetchStats(); // Refresh stats when sync completes
            }
          }
        }
      } catch (error) {
        console.error('Failed to poll sync jobs:', error);
      }
    };
    
    // Initial poll
    pollSyncJobs();
    
    // Set up polling interval (every 2 seconds)
    pollInterval = setInterval(pollSyncJobs, 2000);
    
    // Cleanup on unmount
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/ml/documents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success && data.data.results) {
        const docs = data.data.results;
        setStats({
          total: docs.length,
          pending: docs.filter(d => d.embedding_status === 'pending').length,
          processing: docs.filter(d => d.embedding_status === 'processing').length,
          completed: docs.filter(d => d.embedding_status === 'completed').length,
          failed: docs.filter(d => d.embedding_status === 'failed').length
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/ml/sync/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setSyncStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setUserStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/users/create-admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUserForm)
      });
      const data = await response.json();
      
      if (data.success) {
        alert('User created successfully!');
        setNewUserForm({
          email: '',
          password: '',
          role: 'ml_engineer',
          name: ''
        });
        fetchUsers();
        fetchUserStats();
      } else {
        alert('Failed to create user: ' + data.error);
      }
    } catch (error) {
      alert('Error creating user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await response.json();
      
      if (data.success) {
        alert('User role updated successfully!');
        fetchUsers();
        fetchUserStats();
      } else {
        alert('Failed to update role: ' + data.error);
      }
    } catch (error) {
      alert('Error updating role: ' + error.message);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ml/documents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.data.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    if (!window.confirm('This will sync all your journal entries and goals to the ML service. Continue?')) {
      return;
    }

    setSyncing(true);
    try {
      const response = await fetch('/api/ml/sync/all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`Successfully synced ${data.totalSynced} items!`);
        fetchStats();
        fetchSyncStatus();
        if (activeTab === 'documents') {
          fetchDocuments();
        }
      } else {
        alert('Sync failed: ' + data.error);
      }
    } catch (error) {
      alert('Sync error: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const fetchRecentSyncJobs = async () => {
    try {
      const response = await fetch('/api/ml/sync/jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setRecentSyncJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Failed to fetch sync jobs:', error);
    }
  };

  const handleSyncJournal = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/ml/sync/journal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Polling will automatically show progress
        console.log('Journal sync started:', data);
      } else {
        alert('Sync failed: ' + data.error);
        setSyncing(false);
      }
    } catch (error) {
      alert('Sync error: ' + error.message);
      setSyncing(false);
    }
  };

  const handleSyncGoals = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/ml/sync/goals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Polling will automatically show progress
        console.log('Goals sync started:', data);
      } else {
        alert('Sync failed: ' + data.error);
        setSyncing(false);
      }
    } catch (error) {
      alert('Sync error: ' + error.message);
      setSyncing(false);
    }
  };

  const handleRetryEmbedding = async (documentId) => {
    try {
      const response = await fetch(`/api/ml/documents/${documentId}/embed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Embedding generation triggered');
        fetchDocuments();
      } else {
        alert('Failed to trigger embedding');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Delete this document from the ML service?')) {
      return;
    }

    try {
      const response = await fetch(`/api/ml/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Document deleted');
        fetchDocuments();
        fetchStats();
      } else {
        alert('Delete failed');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.document_type?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || doc.embedding_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'processing': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'processing': return <RefreshCw size={16} className="animate-spin" />;
      case 'failed': return <XCircle size={16} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Database className="text-purple-600" size={32} />
          ML Service Administration
        </h1>
        <p className="text-gray-600">
          Manage machine learning documents, embeddings, and data synchronization
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="inline mr-2" size={18} />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'documents'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="inline mr-2" size={18} />
          Documents
        </button>
        <button
          onClick={() => setActiveTab('sync')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'sync'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <RefreshCw className="inline mr-2" size={18} />
          Data Sync
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'users'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <svg className="inline mr-2" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Users
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Documents</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Database className="text-gray-400" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="text-green-400" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="text-yellow-400" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Processing</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.processing}</p>
                </div>
                <Zap className="text-blue-400" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <XCircle className="text-red-400" size={32} />
              </div>
            </div>
          </div>

          {/* Sync Status */}
          {syncStatus && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Sync Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">MongoDB</h3>
                  <p className="text-sm text-gray-600">Journal Entries: {syncStatus.mongodb?.journalEntries || 0}</p>
                  <p className="text-sm text-gray-600">Goals: {syncStatus.mongodb?.goals || 0}</p>
                  <p className="text-sm font-semibold mt-2">Total: {syncStatus.mongodb?.total || 0}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">ML Service</h3>
                  <p className="text-sm text-gray-600">Documents: {syncStatus.mlService?.total || 0}</p>
                  <p className="text-sm font-semibold mt-2">
                    Sync Progress: {syncStatus.syncPercentage || 0}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${syncStatus.syncPercentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSyncAll}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                Sync All Data
              </button>
              <button
                onClick={fetchStats}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                <RefreshCw size={18} />
                Refresh Stats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 flex items-center gap-3">
                <Search className="text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none"
                />
              </div>
              
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>

              {/* Bulk Actions */}
              {selectedDocuments.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm(`Delete ${selectedDocuments.length} selected documents?`)) {
                      // Bulk delete
                      Promise.all(selectedDocuments.map(id => 
                        fetch(`/api/ml/documents/${id}`, {
                          method: 'DELETE',
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        })
                      )).then(() => {
                        alert('Documents deleted!');
                        setSelectedDocuments([]);
                        fetchDocuments();
                      });
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete {selectedDocuments.length}
                </button>
              )}
            </div>
          </div>

          {/* Documents List */}
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="animate-spin mx-auto mb-4 text-purple-600" size={32} />
              <p className="text-gray-600">Loading documents...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDocuments(filteredDocuments.map(d => d.id));
                          } else {
                            setSelectedDocuments([]);
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(doc.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDocuments([...selectedDocuments, doc.id]);
                            } else {
                              setSelectedDocuments(selectedDocuments.filter(id => id !== doc.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          {doc.document_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 text-sm font-medium ${getStatusColor(doc.embedding_status)}`}>
                          {getStatusIcon(doc.embedding_status)}
                          {doc.embedding_status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {doc.embedding_status === 'failed' && (
                            <button
                              onClick={() => handleRetryEmbedding(doc.id)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Retry embedding"
                            >
                              <RefreshCw size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete document"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredDocuments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No documents found
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sync Tab */}
      {activeTab === 'sync' && (
        <div className="space-y-6">
          {/* Active Sync Jobs */}
          {activeSyncJobs.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <RefreshCw size={18} className="animate-spin" />
                Active Sync Operations
              </h3>
              <div className="space-y-3">
                {activeSyncJobs.map((job) => (
                  <div key={job.id} className="bg-white rounded p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium capitalize">
                        {job.type.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-600">
                        {job.processedItems} / {job.totalItems} items
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{job.progress}% complete</span>
                      <span>
                        ✓ {job.syncedItems} synced, ✗ {job.failedItems} failed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Journal Sync */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="text-purple-600" size={24} />
                <h3 className="text-lg font-semibold">Journal Entries</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Sync all your journal entries to the ML service for semantic search and pattern analysis.
              </p>
              <button
                onClick={handleSyncJournal}
                disabled={syncing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Syncing...' : 'Sync Journal Entries'}
              </button>
            </div>

            {/* Goals Sync */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="text-purple-600" size={24} />
                <h3 className="text-lg font-semibold">Goals</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Sync all your goals to the ML service for tracking and recommendations.
              </p>
              <button
                onClick={handleSyncGoals}
                disabled={syncing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                Sync Goals
              </button>
            </div>
          </div>

          {/* Full Sync */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Database className="text-white" size={24} />
              <h3 className="text-lg font-semibold">Full Data Sync</h3>
            </div>
            <p className="text-sm mb-4 opacity-90">
              Sync all your data (journal entries and goals) to the ML service in one operation.
            </p>
            <button
              onClick={handleSyncAll}
              disabled={syncing}
              className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 font-semibold"
            >
              <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing...' : 'Sync All Data'}
            </button>
          </div>

          {/* Recent Sync Jobs */}
          {recentSyncJobs.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Recent Sync Operations</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentSyncJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm capitalize">
                          {job.type.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            job.status === 'completed' ? 'bg-green-100 text-green-800' :
                            job.status === 'running' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div 
                                className={`h-2 rounded-full ${
                                  job.status === 'completed' ? 'bg-green-600' :
                                  job.status === 'running' ? 'bg-blue-600' :
                                  'bg-red-600'
                                }`}
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">{job.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="text-xs">
                            <div className="text-green-600">✓ {job.syncedItems}</div>
                            {job.failedItems > 0 && (
                              <div className="text-red-600">✗ {job.failedItems}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(job.startTime).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {job.duration ? `${Math.round(job.duration / 1000)}s` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sync Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">ℹ️ About Data Sync</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Syncing creates document records in the ML service</li>
              <li>• Embeddings are generated asynchronously after sync</li>
              <li>• Existing documents won't be duplicated</li>
              <li>• Real-time progress shows above while syncing</li>
              <li>• Recent operations are tracked in the table</li>
            </ul>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-blue-600 mb-1">Total Users</div>
              <div className="text-2xl font-bold text-blue-900">
                {Object.values(userStats).reduce((a, b) => a + b, 0)}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-sm text-green-600 mb-1">ML Engineers</div>
              <div className="text-2xl font-bold text-green-900">{userStats.ml_engineer || 0}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="text-sm text-purple-600 mb-1">Analytics Admins</div>
              <div className="text-2xl font-bold text-purple-900">{userStats.analytics_admin || 0}</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="text-sm text-orange-600 mb-1">System Admins</div>
              <div className="text-2xl font-bold text-orange-900">{userStats.admin || 0}</div>
            </div>
          </div>

          {/* Create New Admin User Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Admin User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength="8"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Min 8 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="ml_engineer">ML Engineer</option>
                    <option value="analytics_admin">Analytics Admin</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">All Users</h3>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="animate-spin text-purple-600" size={24} />
                  <span className="ml-2 text-gray-600">Loading users...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No users found
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {user.profile?.name || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                            disabled={user._id === currentUser?.id}
                            className="px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="ml_engineer">ML Engineer</option>
                            <option value="analytics_admin">Analytics Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.tier === 'premium' ? 'bg-purple-100 text-purple-800' :
                            user.tier === 'pro' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.tier || 'free'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {user._id !== currentUser?.id && (
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this user?')) {
                                  // TODO: Implement delete
                                  alert('Delete functionality coming soon');
                                }
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Role Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Role Permissions</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>ML Engineer:</strong> Access to ML Admin dashboard, can manage documents and embeddings</li>
              <li>• <strong>Analytics Admin:</strong> Access to ML Admin and Analytics dashboards</li>
              <li>• <strong>System Admin:</strong> Full access to all admin features</li>
              <li>• <strong>User:</strong> Standard user access to app features</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default MLAdminDashboard;
