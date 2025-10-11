import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  TrendingUp,
  XCircle,
  Eye,
  Download,
  BarChart3,
} from 'lucide-react';
import monitoringService from '../services/monitoringService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MonitoringDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [appHealth, setAppHealth] = useState(null);
  const [componentHealth, setComponentHealth] = useState([]);
  const [logs, setLogs] = useState([]);
  const [errorAnalytics, setErrorAnalytics] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);
  
  // Filters
  const [selectedComponent, setSelectedComponent] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('1h');
  
  // View state
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLog, setSelectedLog] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch data from backend
  const fetchMonitoringData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '1h':
          startDate.setHours(startDate.getHours() - 1);
          break;
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        default:
          startDate.setHours(startDate.getHours() - 1);
      }

      const dateParams = `startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;

      // Fetch all data in parallel
      const [healthRes, componentRes, logsRes, errorRes, perfRes] = await Promise.all([
        fetch(`${API_URL}/api/monitoring/health/application?${dateParams}`, { headers }),
        fetch(`${API_URL}/api/monitoring/health/component?${dateParams}`, { headers }),
        fetch(`${API_URL}/api/monitoring/logs?${dateParams}&limit=100`, { headers }),
        fetch(`${API_URL}/api/monitoring/analytics/errors?${dateParams}`, { headers }),
        fetch(`${API_URL}/api/monitoring/analytics/performance?${dateParams}`, { headers }),
      ]);

      const [healthData, componentData, logsData, errorData, perfData] = await Promise.all([
        healthRes.json(),
        componentRes.json(),
        logsRes.json(),
        errorRes.json(),
        perfRes.json(),
      ]);

      if (healthData.success) setAppHealth(healthData.data);
      if (componentData.success) setComponentHealth(componentData.data);
      if (logsData.success) setLogs(logsData.data.logs);
      if (errorData.success) setErrorAnalytics(errorData.data);
      if (perfData.success) setPerformanceMetrics(perfData.data);

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    
    // Auto-refresh every 30 seconds
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchMonitoringData, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, autoRefresh]);

  // Get local frontend health (real-time)
  const [frontendHealth, setFrontendHealth] = useState(null);
  
  useEffect(() => {
    const updateFrontendHealth = () => {
      setFrontendHealth(monitoringService.getApplicationHealth());
    };

    updateFrontendHealth();
    const interval = setInterval(updateFrontendHealth, 5000);

    return () => clearInterval(interval);
  }, []);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (selectedComponent !== 'all' && log.component !== selectedComponent) return false;
    if (selectedLevel !== 'all' && log.level !== selectedLevel) return false;
    if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Get unique components from logs
  const components = ['all', ...new Set(logs.map(log => log.component).filter(Boolean))];

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthBg = (score) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  const getLevelColor = (level) => {
    const colors = {
      error: 'text-red-500 bg-red-100 dark:bg-red-900',
      warn: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900',
      info: 'text-blue-500 bg-blue-100 dark:bg-blue-900',
      debug: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
    };
    return colors[level] || colors.info;
  };

  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `monitoring-logs-${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Activity className="w-8 h-8 text-primary" />
                Application Monitoring
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Real-time monitoring and diagnostics
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="1h">Last 1 Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>

              {/* Auto Refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg transition-colors ${
                  autoRefresh
                    ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
                title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
              >
                <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
              </button>

              {/* Manual Refresh */}
              <button
                onClick={fetchMonitoringData}
                className="p-2 rounded-lg bg-primary text-white hover:bg-primary/80 transition-colors"
                title="Refresh now"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Overall Health Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Application Health */}
          <div className={`p-6 rounded-xl ${getHealthBg(appHealth?.overallHealth || 0)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Application Health
              </span>
              {appHealth?.status === 'healthy' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              )}
            </div>
            <div className={`text-3xl font-bold ${getHealthColor(appHealth?.overallHealth || 0)}`}>
              {appHealth?.overallHealth?.toFixed(0) || 0}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 capitalize">
              {appHealth?.status || 'unknown'}
            </div>
          </div>

          {/* Total Events */}
          <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Events
              </span>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {appHealth?.totalEvents?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Across {appHealth?.totalComponents || 0} components
            </div>
          </div>

          {/* Errors */}
          <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Errors
              </span>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-500">
              {appHealth?.totalErrors || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {appHealth?.totalWarnings || 0} warnings
            </div>
          </div>

          {/* Avg Response Time */}
          <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Avg Response Time
              </span>
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {appHealth?.avgResponseTime || 0}ms
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Performance metric
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'logs', label: 'Logs', icon: Eye },
              { id: 'components', label: 'Components', icon: Activity },
              { id: 'errors', label: 'Errors', icon: AlertTriangle },
              { id: 'performance', label: 'Performance', icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Frontend Health (Real-time)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Active Components</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {frontendHealth?.activeComponents || 0}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Session Events</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {frontendHealth?.totalEvents || 0}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Session Errors</div>
                      <div className="text-2xl font-bold text-red-500 mt-1">
                        {frontendHealth?.totalErrors || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {errorAnalytics && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Error Distribution
                    </h3>
                    <div className="space-y-2">
                      {errorAnalytics.errorsByComponent?.slice(0, 5).map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900"
                        >
                          <span className="text-gray-700 dark:text-gray-300">{item._id || 'Unknown'}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {item.uniqueErrors?.length} unique errors
                            </span>
                            <span className="font-semibold text-red-500">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <select
                    value={selectedComponent}
                    onChange={(e) => setSelectedComponent(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    {components.map(comp => (
                      <option key={comp} value={comp}>{comp === 'all' ? 'All Components' : comp}</option>
                    ))}
                  </select>

                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Levels</option>
                    <option value="error">Error</option>
                    <option value="warn">Warning</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                  </select>

                  <button
                    onClick={exportLogs}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>

                {/* Logs List */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.logId || log._id}
                      onClick={() => setSelectedLog(log)}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                              {log.level?.toUpperCase()}
                            </span>
                            {log.component && (
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {log.component}
                              </span>
                            )}
                            {log.action && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {log.action}
                              </span>
                            )}
                            {log.duration && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDuration(log.duration)}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {log.message}
                          </div>
                          {log.validation && log.validation.status !== 'ok' && (
                            <div className="mt-2 p-2 rounded bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                              <div className="text-xs text-yellow-800 dark:text-yellow-400">
                                ⚠️ {log.validation.message}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredLogs.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      No logs found
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Components Tab */}
            {activeTab === 'components' && (
              <div className="space-y-3">
                {componentHealth
                  .sort((a, b) => a.healthScore - b.healthScore)
                  .map((comp) => (
                    <div
                      key={comp._id}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {comp.component || comp._id}
                            </h4>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthBg(comp.healthScore)} ${getHealthColor(comp.healthScore)}`}>
                              {comp.healthScore?.toFixed(0)}% Health
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600 dark:text-gray-400">Events</div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {comp.totalEvents}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600 dark:text-gray-400">Errors</div>
                              <div className="font-semibold text-red-500">
                                {comp.errors}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600 dark:text-gray-400">Warnings</div>
                              <div className="font-semibold text-yellow-500">
                                {comp.warnings}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600 dark:text-gray-400">Avg Duration</div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {comp.avgDuration?.toFixed(0) || 0}ms
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                
                {componentHealth.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No component data available
                  </div>
                )}
              </div>
            )}

            {/* Errors Tab */}
            {activeTab === 'errors' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Errors
                  </h3>
                  <div className="space-y-2">
                    {appHealth?.recentErrors?.map((error) => (
                      <div
                        key={error._id}
                        className="p-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {error.component}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {error.action}
                              </span>
                            </div>
                            <div className="text-sm text-red-700 dark:text-red-400">
                              {error.message}
                            </div>
                            {error.error && (
                              <div className="mt-2 text-xs font-mono text-gray-600 dark:text-gray-400">
                                {error.error}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(error.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {(!appHealth?.recentErrors || appHealth.recentErrors.length === 0) && (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No recent errors
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Performance Metrics
                </h3>
                {performanceMetrics.map((metric) => (
                  <div
                    key={metric._id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {metric.name || metric._id}
                      </h4>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {metric.count} calls
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Average</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {metric.avgDuration}ms
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Min</div>
                        <div className="font-semibold text-green-500">
                          {metric.minDuration}ms
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Max</div>
                        <div className="font-semibold text-red-500">
                          {metric.maxDuration}ms
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">P95</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {metric.p95Duration}ms
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {performanceMetrics.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No performance data available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Log Detail Modal */}
        {selectedLog && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedLog(null)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Log Details
                  </h3>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <pre className="text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringDashboard;
