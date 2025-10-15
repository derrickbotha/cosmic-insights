/**
 * Comprehensive Monitoring Service
 * Tracks all React actions, component lifecycle, user interactions, and errors
 * Maps functionality to expected behavior for each component
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class MonitoringService {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.logs = [];
    this.maxLocalLogs = 1000;
    this.batchSize = 50;
    this.flushInterval = 10000; // 10 seconds
    this.componentStates = new Map();
    this.expectedBehaviors = this.initializeExpectedBehaviors();
    this.startAutoFlush();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Define expected behaviors for each component
   * Maps component actions to expected outcomes
   */
  initializeExpectedBehaviors() {
    return {
      // Landing Page
      LandingPage: {
        mount: { expected: 'Component should render within 500ms', timeout: 500 },
        'button.get-started': { expected: 'Should navigate to /questionnaire', action: 'navigate' },
        'button.sign-in': { expected: 'Should navigate to /login', action: 'navigate' },
      },
      
      // Authentication
      Login: {
        mount: { expected: 'Form should render with email and password fields', timeout: 300 },
        'form.submit': { expected: 'Should call authService.login and store token', action: 'api_call' },
        'validation.email': { expected: 'Should show error for invalid email', action: 'validation' },
        'success.login': { expected: 'Should navigate to /dashboard', action: 'navigate' },
        'error.login': { expected: 'Should display error message', action: 'error_display' },
      },

      Register: {
        mount: { expected: 'Registration form should render', timeout: 300 },
        'form.submit': { expected: 'Should call authService.register', action: 'api_call' },
        'validation.password': { expected: 'Password must meet requirements', action: 'validation' },
        'success.register': { expected: 'Should navigate to /questionnaire', action: 'navigate' },
      },

      // Questionnaire
      Questionnaire: {
        mount: { expected: 'First question should display', timeout: 500 },
        'button.next': { expected: 'Should advance to next question', action: 'state_change' },
        'button.previous': { expected: 'Should go back to previous question', action: 'state_change' },
        'input.answer': { expected: 'Should update answer state', action: 'state_change' },
        'form.submit': { expected: 'Should save to localStorage and navigate to dashboard', action: 'storage' },
        'validation.required': { expected: 'Should prevent progress if required field empty', action: 'validation' },
      },

      // Dashboard
      Dashboard: {
        mount: { expected: 'Should load user data from localStorage', timeout: 500 },
        'data.charts': { expected: 'Should render Chart.js visualizations', action: 'render' },
        'data.missing': { expected: 'Should show prompt to complete questionnaire', action: 'conditional_render' },
        'refresh.data': { expected: 'Should recalculate all metrics', action: 'computation' },
      },

      // AI Chat Interface
      AIChatInterface: {
        mount: { expected: 'Chat history should load', timeout: 500 },
        'message.send': { expected: 'Should call aiService.sendMessage', action: 'api_call' },
        'message.receive': { expected: 'Should display AI response in chat', action: 'state_change' },
        'error.api': { expected: 'Should show error message and allow retry', action: 'error_handling' },
        'typing.indicator': { expected: 'Should show typing animation during API call', action: 'ui_feedback' },
      },

      // Pattern Recognition
      PatternRecognition: {
        mount: { expected: 'Should analyze journal entries', timeout: 1000 },
        'analysis.complete': { expected: 'Should display detected patterns', action: 'data_display' },
        'pattern.click': { expected: 'Should show pattern details', action: 'interaction' },
        'filter.category': { expected: 'Should filter patterns by category', action: 'filter' },
      },

      // Journal
      Journal: {
        mount: { expected: 'Should load journal entries from localStorage', timeout: 500 },
        'entry.create': { expected: 'Should add new entry and update localStorage', action: 'storage' },
        'entry.edit': { expected: 'Should update existing entry', action: 'storage' },
        'entry.delete': { expected: 'Should remove entry and refresh list', action: 'storage' },
        'mood.select': { expected: 'Should update mood data', action: 'state_change' },
      },

      // Goal Tracker
      GoalTracker: {
        mount: { expected: 'Should load goals from localStorage', timeout: 500 },
        'goal.create': { expected: 'Should add goal and persist', action: 'storage' },
        'goal.update': { expected: 'Should update progress', action: 'storage' },
        'goal.complete': { expected: 'Should mark as complete and show celebration', action: 'state_change' },
        'progress.calculate': { expected: 'Should show accurate progress percentage', action: 'computation' },
      },

      // Crystal Recommendations
      CrystalRecommendations: {
        mount: { expected: 'Should load user data and calculate recommendations', timeout: 800 },
        'recommendations.display': { expected: 'Should show personalized crystal list', action: 'data_display' },
        'crystal.click': { expected: 'Should show detailed crystal information', action: 'interaction' },
        'filter.apply': { expected: 'Should filter crystals by category', action: 'filter' },
      },

      // My Profile
      MyProfile: {
        mount: { expected: 'Should load user profile data', timeout: 500 },
        'profile.edit': { expected: 'Should enable edit mode', action: 'state_change' },
        'profile.save': { expected: 'Should update localStorage and show success', action: 'storage' },
        'picture.upload': { expected: 'Should validate file and show preview', action: 'file_handling' },
        'picture.save': { expected: 'Should store base64 image in localStorage', action: 'storage' },
        'subscription.display': { expected: 'Should show current plan and features', action: 'data_display' },
      },

      // Admin Dashboard
      AdminDashboard: {
        mount: { expected: 'Should verify admin role and load analytics', timeout: 1000 },
        'access.denied': { expected: 'Should redirect non-admin users', action: 'authorization' },
        'analytics.load': { expected: 'Should fetch and display user statistics', action: 'api_call' },
        'chart.render': { expected: 'Should render analytics charts', action: 'render' },
      },

      // Payment Modal
      PaymentModal: {
        mount: { expected: 'Should display subscription options', timeout: 500 },
        'plan.select': { expected: 'Should highlight selected plan', action: 'state_change' },
        'payment.process': { expected: 'Should call payment API', action: 'api_call' },
        'payment.success': { expected: 'Should update user tier and close modal', action: 'state_change' },
        'payment.error': { expected: 'Should display error and allow retry', action: 'error_handling' },
      },
    };
  }

  /**
   * Log an event with automatic behavior validation
   */
  logEvent(eventData) {
    const timestamp = new Date().toISOString();
    const log = {
      id: this.generateLogId(),
      sessionId: this.sessionId,
      timestamp,
      ...eventData,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Check if behavior matches expected
    if (eventData.component && eventData.action) {
      log.validation = this.validateBehavior(eventData.component, eventData.action, eventData);
    }

    this.logs.push(log);
    
    // Keep local logs limited
    if (this.logs.length > this.maxLocalLogs) {
      this.logs = this.logs.slice(-this.maxLocalLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(log);
    }

    return log;
  }

  generateLogId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate if component behavior matches expected behavior
   */
  validateBehavior(component, action, eventData) {
    const expectedBehavior = this.expectedBehaviors[component]?.[action];
    
    if (!expectedBehavior) {
      return {
        status: 'unknown',
        message: `No expected behavior defined for ${component}.${action}`,
      };
    }

    const validation = {
      expected: expectedBehavior.expected,
      actual: eventData.result || eventData.message,
      status: 'ok',
      message: 'Behavior matches expected',
    };

    // Validate timeout if specified
    if (expectedBehavior.timeout && eventData.duration) {
      if (eventData.duration > expectedBehavior.timeout) {
        validation.status = 'warning';
        validation.message = `Action took ${eventData.duration}ms (expected < ${expectedBehavior.timeout}ms)`;
      }
    }

    // Validate action type
    if (expectedBehavior.action && eventData.actionType !== expectedBehavior.action) {
      validation.status = 'error';
      validation.message = `Action type mismatch: expected ${expectedBehavior.action}, got ${eventData.actionType}`;
    }

    // Check for errors in event
    if (eventData.error || eventData.level === 'error') {
      validation.status = 'error';
      validation.message = `Error occurred: ${eventData.error || eventData.message}`;
    }

    return validation;
  }

  /**
   * Track component lifecycle
   */
  trackComponentMount(componentName, props = {}) {
    const startTime = performance.now();
    
    this.componentStates.set(componentName, {
      mounted: true,
      mountTime: startTime,
      props,
      interactions: 0,
      errors: 0,
    });

    return this.logEvent({
      level: 'info',
      category: 'lifecycle',
      component: componentName,
      action: 'mount',
      actionType: 'lifecycle',
      message: `${componentName} mounted`,
      props,
    });
  }

  trackComponentUnmount(componentName) {
    const state = this.componentStates.get(componentName);
    const duration = state ? performance.now() - state.mountTime : 0;

    this.logEvent({
      level: 'info',
      category: 'lifecycle',
      component: componentName,
      action: 'unmount',
      actionType: 'lifecycle',
      message: `${componentName} unmounted`,
      duration,
      interactions: state?.interactions || 0,
      errors: state?.errors || 0,
    });

    this.componentStates.delete(componentName);
  }

  /**
   * Track user interactions
   */
  trackInteraction(componentName, action, details = {}) {
    const state = this.componentStates.get(componentName);
    if (state) {
      state.interactions++;
    }

    return this.logEvent({
      level: 'info',
      category: 'interaction',
      component: componentName,
      action,
      actionType: 'interaction',
      message: `User interaction: ${action}`,
      ...details,
    });
  }

  /**
   * Track API calls
   */
  trackAPICall(endpoint, method, componentName) {
    const startTime = performance.now();

    return {
      success: (response) => {
        const duration = performance.now() - startTime;
        this.logEvent({
          level: 'info',
          category: 'api',
          component: componentName,
          action: 'api_call',
          actionType: 'api_call',
          endpoint,
          method,
          status: response.status || 200,
          duration,
          message: `API call successful: ${method} ${endpoint}`,
          result: 'success',
        });
      },
      error: (error) => {
        const duration = performance.now() - startTime;
        this.logEvent({
          level: 'error',
          category: 'api',
          component: componentName,
          action: 'api_call',
          actionType: 'api_call',
          endpoint,
          method,
          status: error.response?.status || 0,
          duration,
          error: error.message,
          message: `API call failed: ${method} ${endpoint}`,
          result: 'error',
          stack: error.stack,
        });
      },
    };
  }

  /**
   * Track errors
   */
  trackError(error, componentName, action, additionalInfo = {}) {
    const state = this.componentStates.get(componentName);
    if (state) {
      state.errors++;
    }

    return this.logEvent({
      level: 'error',
      category: 'error',
      component: componentName,
      action,
      actionType: 'error',
      error: error.message,
      stack: error.stack,
      message: `Error in ${componentName}: ${error.message}`,
      ...additionalInfo,
    });
  }

  /**
   * Track state changes
   */
  trackStateChange(componentName, stateName, oldValue, newValue) {
    return this.logEvent({
      level: 'debug',
      category: 'state',
      component: componentName,
      action: 'state_change',
      actionType: 'state_change',
      stateName,
      oldValue,
      newValue,
      message: `State changed: ${stateName}`,
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(componentName, metricName, value, threshold) {
    const status = threshold && value > threshold ? 'warning' : 'ok';

    return this.logEvent({
      level: status === 'warning' ? 'warn' : 'info',
      category: 'performance',
      component: componentName,
      action: metricName,
      actionType: 'performance',
      value,
      threshold,
      message: `Performance metric: ${metricName} = ${value}ms`,
      validation: {
        status,
        message: status === 'warning' ? `Exceeded threshold of ${threshold}ms` : 'Within acceptable range',
      },
    });
  }

  /**
   * Track navigation
   */
  trackNavigation(from, to, componentName) {
    return this.logEvent({
      level: 'info',
      category: 'navigation',
      component: componentName,
      action: 'navigate',
      actionType: 'navigate',
      from,
      to,
      message: `Navigation: ${from} → ${to}`,
    });
  }

  /**
   * Track storage operations
   */
  trackStorageOperation(operation, key, componentName, success = true) {
    return this.logEvent({
      level: success ? 'info' : 'error',
      category: 'storage',
      component: componentName,
      action: 'storage',
      actionType: 'storage',
      operation,
      key,
      success,
      message: `Storage ${operation}: ${key} - ${success ? 'success' : 'failed'}`,
    });
  }

  /**
   * Log to console with formatting
   */
  logToConsole(log) {
    const styles = {
      info: 'color: #2196F3',
      warn: 'color: #FF9800',
      error: 'color: #F44336',
      debug: 'color: #9E9E9E',
    };

    const style = styles[log.level] || styles.info;
    console.log(
      `%c[${log.timestamp}] ${log.category?.toUpperCase()} - ${log.component || 'System'}: ${log.message}`,
      style,
      log
    );

    if (log.validation && log.validation.status !== 'ok') {
      console.warn(`⚠️ Validation: ${log.validation.message}`, log.validation);
    }
  }

  /**
   * Flush logs to backend
   */
  async flushLogs() {
    if (this.logs.length === 0) return;

    const logsToSend = this.logs.splice(0, this.batchSize);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/monitoring/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          logs: logsToSend,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send logs: ${response.status}`);
      }

      console.log(`✅ Sent ${logsToSend.length} logs to backend`);
    } catch (error) {
      console.error('Failed to flush logs:', error);
      // Put logs back if failed
      this.logs.unshift(...logsToSend);
    }
  }

  /**
   * Start auto-flush interval
   * DISABLED: Backend monitoring endpoint causes app crash
   */
  startAutoFlush() {
    // Temporarily disabled to prevent 404 errors
    // Backend monitoring route needs debugging before re-enabling
    
    // setInterval(() => {
    //   this.flushLogs();
    // }, this.flushInterval);

    // // Flush on page unload
    // window.addEventListener('beforeunload', () => {
    //   this.flushLogs();
    // });
    
    // Use debug level to avoid console clutter in development
    if (process.env.NODE_ENV === 'development') {
      console.debug('ℹ️ Monitoring: Auto-flush disabled for development');
    }
  }

  /**
   * Get current session logs
   */
  getSessionLogs() {
    return this.logs;
  }

  /**
   * Get component health report
   */
  getComponentHealth(componentName) {
    const componentLogs = this.logs.filter(log => log.component === componentName);
    const state = this.componentStates.get(componentName);

    const errors = componentLogs.filter(log => log.level === 'error').length;
    const warnings = componentLogs.filter(log => log.level === 'warn').length;
    const validationFailures = componentLogs.filter(
      log => log.validation && log.validation.status === 'error'
    ).length;

    const health = {
      componentName,
      mounted: state?.mounted || false,
      totalEvents: componentLogs.length,
      errors,
      warnings,
      validationFailures,
      interactions: state?.interactions || 0,
      healthScore: this.calculateHealthScore(componentLogs.length, errors, warnings, validationFailures),
    };

    return health;
  }

  calculateHealthScore(total, errors, warnings, validationFailures) {
    if (total === 0) return 100;
    
    const errorWeight = 10;
    const warningWeight = 3;
    const validationWeight = 5;

    const deductions = (errors * errorWeight) + (warnings * warningWeight) + (validationFailures * validationWeight);
    const score = Math.max(0, 100 - deductions);

    return score;
  }

  /**
   * Get overall application health
   */
  getApplicationHealth() {
    const components = Array.from(this.componentStates.keys());
    const componentHealths = components.map(name => this.getComponentHealth(name));

    const totalErrors = this.logs.filter(log => log.level === 'error').length;
    const totalWarnings = this.logs.filter(log => log.level === 'warn').length;
    const avgHealthScore = componentHealths.reduce((sum, h) => sum + h.healthScore, 0) / (componentHealths.length || 1);

    return {
      overallHealth: avgHealthScore,
      totalComponents: components.length,
      activeComponents: components.length,
      totalEvents: this.logs.length,
      totalErrors,
      totalWarnings,
      components: componentHealths,
      status: avgHealthScore >= 80 ? 'healthy' : avgHealthScore >= 60 ? 'warning' : 'critical',
    };
  }
}

// Create singleton instance
const monitoringService = new MonitoringService();

// Setup global error handler
window.addEventListener('error', (event) => {
  monitoringService.trackError(
    new Error(event.message),
    'Global',
    'uncaught_error',
    {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    }
  );
});

// Setup unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  monitoringService.trackError(
    new Error(event.reason),
    'Global',
    'unhandled_rejection'
  );
});

export default monitoringService;
