/**
 * Analytics Service
 * Tracks user behavior, events, and interactions for admin dashboard
 */

class AnalyticsService {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
    this.initializeSession();
  }

  /**
   * Initialize tracking session
   */
  initializeSession() {
    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden', { duration: Date.now() - this.sessionStart });
      } else {
        this.trackEvent('page_visible');
        this.sessionStart = Date.now();
      }
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.trackEvent('session_end', { 
        duration: Date.now() - this.sessionStart,
        sessionId: this.sessionId
      });
      this.endSession();
    });

    // Track errors
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error?.stack
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        error: event.reason?.stack
      });
    });

    // Start session tracking
    this.trackEvent('session_start', { sessionId: this.sessionId });
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Track custom event
   */
  trackEvent(eventName, data = {}) {
    const event = {
      eventId: this.generateEventId(),
      eventName,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      url: window.location.href,
      pathname: window.location.pathname,
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      userId: this.getUserId(),
      ...data
    };

    this.storeEvent(event);
    this.sendToServer(event);

    return event;
  }

  /**
   * Track page view
   */
  trackPageView(pageName, pageData = {}) {
    return this.trackEvent('page_view', {
      pageName,
      referrer: document.referrer,
      ...pageData
    });
  }

  /**
   * Track user interaction
   */
  trackInteraction(element, action, data = {}) {
    return this.trackEvent('user_interaction', {
      element,
      action,
      ...data
    });
  }

  /**
   * Track button click
   */
  trackButtonClick(buttonName, buttonData = {}) {
    return this.trackEvent('button_click', {
      buttonName,
      ...buttonData
    });
  }

  /**
   * Track form submission
   */
  trackFormSubmit(formName, formData = {}) {
    return this.trackEvent('form_submit', {
      formName,
      ...formData
    });
  }

  /**
   * Track error
   */
  trackError(errorData) {
    return this.trackEvent('error', {
      severity: 'error',
      ...errorData
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance() {
    if (!window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    return this.trackEvent('performance', {
      loadTime: navigation?.loadEventEnd - navigation?.fetchStart,
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.fetchStart,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
      timeToInteractive: navigation?.domInteractive - navigation?.fetchStart
    });
  }

  /**
   * Track user journey/funnel
   */
  trackFunnel(funnelName, step, stepData = {}) {
    return this.trackEvent('funnel_step', {
      funnelName,
      step,
      ...stepData
    });
  }

  /**
   * Track conversion
   */
  trackConversion(conversionType, value = 0, data = {}) {
    return this.trackEvent('conversion', {
      conversionType,
      value,
      ...data
    });
  }

  /**
   * Track payment event
   */
  trackPayment(paymentData) {
    return this.trackEvent('payment', {
      ...paymentData,
      timestamp: Date.now()
    });
  }

  /**
   * Track subscription change
   */
  trackSubscription(action, tier, data = {}) {
    return this.trackEvent('subscription', {
      action,
      tier,
      ...data
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(featureName, data = {}) {
    return this.trackEvent('feature_usage', {
      featureName,
      ...data
    });
  }

  /**
   * Track search
   */
  trackSearch(query, results = 0) {
    return this.trackEvent('search', {
      query,
      results
    });
  }

  /**
   * Track time on page
   */
  trackTimeOnPage(pageName, duration) {
    return this.trackEvent('time_on_page', {
      pageName,
      duration
    });
  }

  /**
   * Store event locally
   */
  storeEvent(event) {
    const events = this.getStoredEvents();
    events.push(event);

    // Keep only last 5000 events to prevent storage overflow
    if (events.length > 5000) {
      events.splice(0, events.length - 5000);
    }

    localStorage.setItem('cosmic_analytics_events', JSON.stringify(events));
  }

  /**
   * Get stored events
   */
  getStoredEvents() {
    return JSON.parse(localStorage.getItem('cosmic_analytics_events') || '[]');
  }

  /**
   * Send event to server (simulated)
   */
  sendToServer(event) {
    // In production, this would send to your analytics backend
    // Example: fetch('/api/analytics/track', { method: 'POST', body: JSON.stringify(event) })
    
    // For now, store in a separate queue for admin dashboard
    const queue = JSON.parse(localStorage.getItem('cosmic_analytics_queue') || '[]');
    queue.push(event);
    
    if (queue.length > 100) {
      queue.splice(0, queue.length - 100);
    }
    
    localStorage.setItem('cosmic_analytics_queue', JSON.stringify(queue));
  }

  /**
   * Get user ID
   */
  getUserId() {
    const token = localStorage.getItem('cosmic_auth_token');
    if (!token) return 'anonymous';

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch {
      return 'anonymous';
    }
  }

  /**
   * Generate event ID
   */
  generateEventId() {
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * End session
   */
  endSession() {
    const sessionData = {
      sessionId: this.sessionId,
      duration: Date.now() - this.sessionStart,
      endTime: Date.now()
    };

    // Store session summary
    const sessions = JSON.parse(localStorage.getItem('cosmic_sessions') || '[]');
    sessions.push(sessionData);
    
    if (sessions.length > 1000) {
      sessions.shift();
    }
    
    localStorage.setItem('cosmic_sessions', JSON.stringify(sessions));
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(timeRange = 24 * 60 * 60 * 1000) {
    const events = this.getStoredEvents();
    const cutoffTime = Date.now() - timeRange;
    const recentEvents = events.filter(e => e.timestamp > cutoffTime);

    const summary = {
      totalEvents: recentEvents.length,
      uniqueUsers: new Set(recentEvents.map(e => e.userId)).size,
      pageViews: recentEvents.filter(e => e.eventName === 'page_view').length,
      interactions: recentEvents.filter(e => e.eventName === 'user_interaction').length,
      errors: recentEvents.filter(e => e.eventName === 'error').length,
      conversions: recentEvents.filter(e => e.eventName === 'conversion').length,
      payments: recentEvents.filter(e => e.eventName === 'payment').length,
      topPages: this.getTopPages(recentEvents),
      topFeatures: this.getTopFeatures(recentEvents),
      errorTypes: this.getErrorTypes(recentEvents)
    };

    return summary;
  }

  /**
   * Get top pages
   */
  getTopPages(events) {
    const pageViews = events.filter(e => e.eventName === 'page_view');
    const pageCounts = {};

    pageViews.forEach(e => {
      const page = e.pageName || e.pathname;
      pageCounts[page] = (pageCounts[page] || 0) + 1;
    });

    return Object.entries(pageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }));
  }

  /**
   * Get top features
   */
  getTopFeatures(events) {
    const featureUsage = events.filter(e => e.eventName === 'feature_usage');
    const featureCounts = {};

    featureUsage.forEach(e => {
      const feature = e.featureName;
      featureCounts[feature] = (featureCounts[feature] || 0) + 1;
    });

    return Object.entries(featureCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([feature, count]) => ({ feature, count }));
  }

  /**
   * Get error types
   */
  getErrorTypes(events) {
    const errors = events.filter(e => e.eventName === 'error');
    const errorCounts = {};

    errors.forEach(e => {
      const errorType = e.message || 'Unknown Error';
      errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
    });

    return Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([error, count]) => ({ error, count }));
  }

  /**
   * Get user journey
   */
  getUserJourney(userId, sessionId = null) {
    const events = this.getStoredEvents();
    let userEvents = events.filter(e => e.userId === userId);

    if (sessionId) {
      userEvents = userEvents.filter(e => e.sessionId === sessionId);
    }

    return userEvents.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Export analytics data
   */
  exportData(format = 'json') {
    const events = this.getStoredEvents();
    
    if (format === 'csv') {
      return this.convertToCSV(events);
    }
    
    return JSON.stringify(events, null, 2);
  }

  /**
   * Convert events to CSV
   */
  convertToCSV(events) {
    if (events.length === 0) return '';

    const headers = Object.keys(events[0]);
    const csv = [
      headers.join(','),
      ...events.map(event => 
        headers.map(header => 
          JSON.stringify(event[header] || '')
        ).join(',')
      )
    ].join('\n');

    return csv;
  }

  /**
   * Clear analytics data
   */
  clearData() {
    localStorage.removeItem('cosmic_analytics_events');
    localStorage.removeItem('cosmic_analytics_queue');
    localStorage.removeItem('cosmic_sessions');
  }
}

export default new AnalyticsService();
