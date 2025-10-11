# Comprehensive Monitoring System

## Overview

This monitoring system provides real-time tracking, analysis, and auto-correction for all React actions, component behaviors, and backend events in the Cosmic Insights application.

## Features

### 1. **Frontend Monitoring Service** (`src/services/monitoringService.js`)
- **Component Lifecycle Tracking**: Monitors mount/unmount events with timing
- **User Interaction Logging**: Captures all button clicks, form submissions, and user actions
- **API Call Monitoring**: Tracks all HTTP requests with response times and status codes
- **Error Tracking**: Catches and logs all errors with stack traces
- **State Change Monitoring**: Records state transitions for debugging
- **Performance Metrics**: Measures and tracks component render times and API latencies
- **Behavior Validation**: Compares actual behavior against expected behavior for each component
- **Auto-Flush**: Automatically sends logs to backend every 10 seconds

### 2. **Expected Behavior Mapping**

Each component has predefined expected behaviors:

```javascript
{
  Component: {
    action: {
      expected: 'Description of expected outcome',
      timeout: 500, // Max acceptable duration in ms
      action: 'action_type' // e.g., 'api_call', 'navigate', 'state_change'
    }
  }
}
```

**Example for Login Component:**
- `mount`: Should render within 300ms
- `form.submit`: Should call authService.login and store token
- `success.login`: Should navigate to /dashboard
- `error.login`: Should display error message

### 3. **Backend Monitoring System**

#### **Database Model** (`backend/src/models/MonitoringLog.js`)
Stores comprehensive log data:
- Session ID for grouping related events
- Timestamp indexed for efficient queries
- Log level (info, warn, error, debug)
- Category (lifecycle, interaction, api, error, state, performance, navigation, storage)
- Component and action details
- Validation results
- Performance metrics
- TTL index (auto-deletes logs after 30 days)

#### **API Endpoints** (`backend/src/routes/monitoring.js`)

**Public:**
- `POST /api/monitoring/logs` - Store logs from frontend

**Admin Only:**
- `GET /api/monitoring/logs` - Query logs with filters
- `GET /api/monitoring/health/component` - Component health reports
- `GET /api/monitoring/health/application` - Overall app health
- `GET /api/monitoring/analytics/errors` - Error analytics
- `GET /api/monitoring/analytics/performance` - Performance metrics
- `GET /api/monitoring/journey/:sessionId` - User session replay
- `DELETE /api/monitoring/cleanup` - Manual log cleanup

### 4. **Monitoring Dashboard UI** (`src/components/MonitoringDashboard.jsx`)

**Overview Tab:**
- Application health score (0-100%)
- Total events, errors, warnings
- Average response time
- Frontend real-time health
- Error distribution by component

**Logs Tab:**
- Real-time log viewer
- Filter by component, level, category
- Search functionality
- Log export to JSON
- Detailed log inspection modal

**Components Tab:**
- Health score per component
- Event count, error count, warnings
- Average duration metrics
- Validation failure tracking

**Errors Tab:**
- Recent errors list
- Error details with stack traces
- Component and action context

**Performance Tab:**
- Average, min, max, P95 response times
- Call count per component/action
- Performance threshold violations

### 5. **React Hooks** (`src/hooks/useMonitoring.js`)

#### **useMonitoring(componentName, props)**
Auto-tracks component lifecycle:
```javascript
const monitoring = useMonitoring('MyComponent', props);

// Track interactions
monitoring.trackInteraction('button.click', { buttonId: 'submit' });

// Track errors
monitoring.trackError(error, 'api_call', { endpoint: '/api/data' });

// Track state changes
monitoring.trackStateChange('isLoading', false, true);
```

#### **useAPIMonitoring(componentName)**
Wraps API calls with automatic tracking:
```javascript
const { trackAPICall } = useAPIMonitoring('MyComponent');

const fetchData = async () => {
  await trackAPICall('/api/data', 'GET', () => fetch('/api/data'));
};
```

#### **useFormMonitoring(componentName, formName)**
Monitors form submissions and validation:
```javascript
const { trackFormSubmit, trackFieldValidation } = useFormMonitoring('Login', 'loginForm');

trackFormSubmit(true); // success
trackFieldValidation('email', false, 'Invalid email format');
```

#### **usePerformanceMonitoring(componentName)**
Measures custom performance metrics:
```javascript
const { startMeasure, endMeasure } = usePerformanceMonitoring('Dashboard');

startMeasure('data_processing');
// ... expensive operation
endMeasure('data_processing', 1000); // threshold 1000ms
```

#### **useLocalStorageMonitoring(componentName)**
Wraps localStorage with monitoring:
```javascript
const { monitoredSetItem, monitoredGetItem } = useLocalStorageMonitoring('MyComponent');

monitoredSetItem('key', 'value'); // Logged
const value = monitoredGetItem('key'); // Logged
```

#### **withMonitoring(Component, componentName)**
HOC for auto-monitoring:
```javascript
export default withMonitoring(MyComponent, 'MyComponent');
```

### 6. **Auto-Correction Service** (`src/services/autoCorrectionService.js`)

Automatically detects and corrects common errors:

#### **Supported Error Types:**

1. **NETWORK_ERROR**
   - Retries with exponential backoff (max 3 attempts)
   - Delays: 1s, 2s, 4s

2. **STORAGE_QUOTA_EXCEEDED**
   - Clears old data from localStorage
   - Retries the operation

3. **TOKEN_EXPIRED**
   - Attempts token refresh
   - Redirects to login if refresh fails

4. **MISSING_USER_DATA**
   - Redirects to questionnaire if data missing

5. **INVALID_JSON**
   - Returns default value
   - Logs warning

6. **COMPONENT_MOUNT_FAILED**
   - Logs error
   - Suggests page reload for critical components

7. **RATE_LIMIT_EXCEEDED**
   - Waits for retry-after duration
   - Retries automatically

#### **Usage:**
```javascript
import autoCorrectionService from '../services/autoCorrectionService';

try {
  const result = await apiCall();
} catch (error) {
  const correction = await autoCorrectionService.autoCorrect(
    error,
    'MyComponent',
    'api_call',
    {
      retryFunction: () => apiCall(),
      critical: true
    }
  );

  if (correction.success) {
    return correction.result;
  }
}
```

## Setup and Configuration

### 1. **Environment Variables**
```env
REACT_APP_API_URL=http://localhost:5000
```

### 2. **Backend Setup**
The monitoring routes are already integrated into `backend/src/server.js`:
```javascript
const monitoringRoutes = require('./routes/monitoring');
app.use('/api/monitoring', monitoringRoutes);
```

### 3. **Frontend Integration**

#### **Import monitoring service**
```javascript
import monitoringService from './services/monitoringService';
```

#### **Use in components**
```javascript
import { useMonitoring } from '../hooks/useMonitoring';

function MyComponent() {
  const monitoring = useMonitoring('MyComponent');

  const handleClick = () => {
    monitoring.trackInteraction('button.click');
    // ... rest of logic
  };

  return <button onClick={handleClick}>Click Me</button>;
}
```

### 4. **Access Monitoring Dashboard**

1. Log in as admin user
2. Navigate to "Monitoring" in sidebar (admin only)
3. View real-time application health and logs

## Health Score Calculation

```
HealthScore = 100 - (Errors × 10) - (Warnings × 3) - (ValidationFailures × 5)
```

- **Healthy**: Score ≥ 80%
- **Warning**: Score ≥ 60%
- **Critical**: Score < 60%

## Log Levels

- **debug**: Detailed state changes (hidden in production)
- **info**: Normal operations (component mount, interactions)
- **warn**: Performance issues, validation failures
- **error**: Errors, exceptions, failed operations

## Validation Statuses

- **ok**: Behavior matches expected
- **warning**: Behavior acceptable but slow
- **error**: Behavior doesn't match expected
- **unknown**: No expected behavior defined

## Performance Thresholds

Default thresholds can be customized per component:
- Component mount: 500ms
- API calls: 2000ms
- State changes: 100ms
- Navigation: 300ms

## Data Retention

- Local logs: Max 1000 events (circular buffer)
- Backend logs: Auto-deleted after 30 days (TTL index)
- Batch upload: Every 10 seconds (max 50 logs per batch)

## Filtering and Querying

### Frontend (Real-time)
```javascript
const health = monitoringService.getApplicationHealth();
const componentHealth = monitoringService.getComponentHealth('Dashboard');
const sessionLogs = monitoringService.getSessionLogs();
```

### Backend (Historical)
```
GET /api/monitoring/logs?component=Dashboard&level=error&startDate=2025-10-01
```

## User Journey Replay

View complete user session with all events:
```
GET /api/monitoring/journey/:sessionId
```

Returns:
- Session summary (duration, pages visited, errors)
- Complete event timeline
- Component interaction patterns

## Testing the Monitoring System

### 1. **Trigger Test Events**
```javascript
// Manual error
monitoringService.trackError(
  new Error('Test error'),
  'TestComponent',
  'test_action'
);

// Manual interaction
monitoringService.trackInteraction('TestComponent', 'test.button', {
  testData: 'value'
});

// Performance test
monitoringService.trackPerformance('TestComponent', 'test_metric', 1500, 1000);
```

### 2. **View in Dashboard**
1. Navigate to Monitoring dashboard
2. Check "Logs" tab for new events
3. Check "Components" tab for TestComponent health
4. Check "Errors" tab for error details

### 3. **Query Backend**
```bash
# Get all logs for component
curl "http://localhost:5000/api/monitoring/logs?component=TestComponent" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get application health
curl "http://localhost:5000/api/monitoring/health/application" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Example Integration: Login Component

```javascript
import React, { useState } from 'react';
import { useMonitoring, useFormMonitoring } from '../hooks/useMonitoring';
import autoCorrectionService from '../services/autoCorrectionService';

function Login() {
  const monitoring = useMonitoring('Login');
  const { trackFormSubmit, trackFieldValidation } = useFormMonitoring('Login', 'loginForm');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    monitoring.trackInteraction('form.submit');

    // Validate
    if (!email.includes('@')) {
      trackFieldValidation('email', false, 'Invalid email');
      return;
    }

    try {
      const result = await authService.login(email, password);
      trackFormSubmit(true);
      monitoring.trackNavigation('/login', '/dashboard');
    } catch (error) {
      // Try auto-correction
      const correction = await autoCorrectionService.autoCorrect(
        error,
        'Login',
        'form.submit',
        {
          retryFunction: () => authService.login(email, password)
        }
      );

      if (!correction.success) {
        trackFormSubmit(false, [error.message]);
        monitoring.trackError(error, 'form.submit');
      }
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Troubleshooting

### Logs not appearing in dashboard
1. Check browser console for errors
2. Verify backend is running: `curl http://localhost:5000/health`
3. Check MongoDB connection
4. Verify admin user has correct role

### High memory usage
- Reduce `maxLocalLogs` in monitoringService (default: 1000)
- Decrease `flushInterval` (default: 10000ms)
- Increase `batchSize` for more efficient uploads

### Slow performance
- Set log level to 'info' or higher (disable 'debug')
- Filter out unnecessary components
- Use shorter time ranges in dashboard

## Best Practices

1. **Always use hooks in components** - Automatic lifecycle tracking
2. **Define expected behaviors** - Enable validation
3. **Set performance thresholds** - Catch slow operations early
4. **Review logs regularly** - Identify patterns
5. **Use auto-correction for common errors** - Improve UX
6. **Export logs for analysis** - Long-term trends
7. **Clean up old logs** - Maintain database performance

## Future Enhancements

- [ ] Real-time alerts (email, Slack, webhook)
- [ ] Machine learning for anomaly detection
- [ ] Performance regression detection
- [ ] Session replay visualization
- [ ] Integration with error tracking services (Sentry, Rollbar)
- [ ] Custom dashboard widgets
- [ ] Log aggregation across multiple instances
- [ ] Advanced analytics (user flows, conversion tracking)

## Security Considerations

- Monitoring endpoints require admin authentication
- Sensitive data (passwords, tokens) are never logged
- IP addresses and user agents collected for security analysis
- Logs automatically expire after 30 days (configurable)

## License

Part of Cosmic Insights Astrology Application - Internal monitoring system.

---

**For support or questions, contact the development team.**
