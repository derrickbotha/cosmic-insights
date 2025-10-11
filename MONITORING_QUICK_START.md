# Monitoring System - Quick Start Guide

## 🚀 System is LIVE and Running!

The comprehensive monitoring system has been successfully implemented and is now tracking all application activities in real-time.

## ✅ What's Been Implemented

### 1. **Frontend Monitoring** (`src/services/monitoringService.js`)
- ✅ Tracks all component lifecycles (mount/unmount)
- ✅ Logs user interactions (clicks, form submissions)
- ✅ Monitors API calls with response times
- ✅ Captures errors with stack traces
- ✅ Validates behavior against expected outcomes
- ✅ Auto-flushes logs to backend every 10 seconds

### 2. **Backend System**
- ✅ MongoDB model for storing logs (30-day TTL)
- ✅ API endpoints for log storage and querying
- ✅ Component health analytics
- ✅ Error analytics and performance metrics
- ✅ Session replay functionality

### 3. **Monitoring Dashboard** (Admin Only)
- ✅ Real-time application health score
- ✅ Component health tracking
- ✅ Error analytics with details
- ✅ Performance metrics (avg, min, max, P95)
- ✅ Log viewer with filtering and search
- ✅ Export functionality

### 4. **Auto-Correction System**
- ✅ Network error retry with exponential backoff
- ✅ Storage quota management
- ✅ Token refresh automation
- ✅ Missing data detection and redirect
- ✅ Rate limit handling

## 🎯 How to Access

### For Admin Users:
1. **Log in with admin credentials**
2. **Click "Monitoring" in the sidebar** (new menu item)
3. **View real-time health and logs**

### Current Status:
- **React Server**: Running on http://localhost:3000
- **Backend Server**: Running on http://localhost:5000
- **MongoDB**: Running on mongodb://localhost:27017
- **Monitoring Dashboard**: Available at `/monitoring` route (admin only)

## 📊 What's Being Tracked

### Automatically Tracked for ALL Components:
- Component mount/unmount times
- User interactions (button clicks, form submissions)
- API calls (endpoint, method, status, duration)
- Errors (message, stack trace, component context)
- State changes
- Navigation events
- localStorage operations
- Performance metrics

### Validation Against Expected Behavior:
Each component has predefined expected behaviors. For example:

**Login Component:**
- ✅ Should mount within 300ms
- ✅ Form submission should call API
- ✅ Success should navigate to dashboard
- ✅ Errors should display message

If actual behavior doesn't match expected, it's logged as a validation failure.

## 🔧 How to Use in Your Components

### Method 1: Use Monitoring Hooks (Recommended)

```javascript
import { useMonitoring } from '../hooks/useMonitoring';

function MyComponent() {
  const monitoring = useMonitoring('MyComponent');

  const handleClick = () => {
    monitoring.trackInteraction('button.click', { buttonId: 'submit' });
    // Your logic here
  };

  const handleError = (error) => {
    monitoring.trackError(error, 'api_call', { endpoint: '/api/data' });
  };

  return <button onClick={handleClick}>Click Me</button>;
}
```

### Method 2: Use Auto-Correction

```javascript
import autoCorrectionService from '../services/autoCorrectionService';

async function fetchData() {
  try {
    const response = await api.getData();
    return response;
  } catch (error) {
    // Auto-correction will retry network errors, refresh tokens, etc.
    const correction = await autoCorrectionService.autoCorrect(
      error,
      'MyComponent',
      'api_call',
      {
        retryFunction: () => api.getData(),
        critical: true
      }
    );

    if (correction.success) {
      return correction.result;
    } else {
      throw error;
    }
  }
}
```

### Method 3: Monitor Forms

```javascript
import { useFormMonitoring } from '../hooks/useMonitoring';

function LoginForm() {
  const { trackFormSubmit, trackFieldValidation } = useFormMonitoring('Login', 'loginForm');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!email.includes('@')) {
      trackFieldValidation('email', false, 'Invalid email');
      return;
    }

    try {
      await submitForm();
      trackFormSubmit(true); // Success
    } catch (error) {
      trackFormSubmit(false, [error.message]); // Failed
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## 🔍 Viewing Logs

### In the Dashboard:
1. Go to **Monitoring** dashboard
2. Use the tabs:
   - **Overview**: Overall health and stats
   - **Logs**: Detailed log viewer with filters
   - **Components**: Per-component health scores
   - **Errors**: Recent errors with details
   - **Performance**: Response time metrics

### Filters Available:
- Component name
- Log level (error, warn, info, debug)
- Time range (1h, 24h, 7d, 30d)
- Search by message

### Export Logs:
Click the **Export** button to download logs as JSON for external analysis.

## 📈 Health Score Interpretation

### Application Health Score Formula:
```
Score = 100 - (Errors × 10) - (Warnings × 3) - (ValidationFailures × 5)
```

### Status Levels:
- **🟢 Healthy**: Score ≥ 80% - All systems operating normally
- **🟡 Warning**: Score ≥ 60% - Some issues detected, monitoring required
- **🔴 Critical**: Score < 60% - Immediate attention needed

## 🐛 Diagnosing Issues

### Example: Component Taking Too Long to Load

1. **Go to Monitoring Dashboard**
2. **Click "Performance" tab**
3. **Find your component**
4. **Check metrics:**
   - Average duration
   - Max duration
   - P95 duration
5. **Click "Logs" tab**
6. **Filter by component**
7. **Look for validation warnings** about timeout

### Example: User Reports Error

1. **Go to "Errors" tab**
2. **Find recent error for that component**
3. **Click to see full details:**
   - Error message
   - Stack trace
   - Component context
   - User actions leading to error
4. **Use "Session" ID to see full user journey**
5. **Fix the issue based on insights**

## 🔄 Auto-Correction in Action

### Errors That Are Automatically Fixed:

1. **Network Failures**: 
   - System retries 3 times with delays: 1s, 2s, 4s
   - Logged: "Attempting correction for NETWORK_ERROR"

2. **Token Expiration**:
   - System attempts token refresh
   - If successful, retries original request
   - If failed, redirects to login

3. **Storage Quota Exceeded**:
   - System clears old data
   - Retries storage operation

4. **Rate Limiting**:
   - System waits for retry-after duration
   - Automatically retries request

You'll see these logged as:
- ℹ️ "Attempting correction for [ERROR_TYPE] (attempt X)"
- ✅ "Successfully corrected [ERROR_TYPE] after X attempt(s)"
- ❌ "Failed to correct [ERROR_TYPE]: [reason]"

## 🧪 Testing the System

### Test 1: Manual Log Entry
```javascript
// In browser console or any component
import monitoringService from './services/monitoringService';

monitoringService.trackInteraction('TestComponent', 'manual.test', {
  testData: 'Hello from manual test!',
  timestamp: new Date().toISOString()
});

// Check dashboard - should appear in logs within 10 seconds
```

### Test 2: Trigger an Error
```javascript
// In browser console
monitoringService.trackError(
  new Error('This is a test error'),
  'TestComponent',
  'test_action',
  { additionalInfo: 'Testing error tracking' }
);

// Check "Errors" tab in dashboard
```

### Test 3: View Real-time Health
1. Open Monitoring Dashboard
2. Click around the app (navigate, submit forms, etc.)
3. Return to dashboard
4. Refresh to see updated metrics
5. Check "Components" tab for health scores

## 📝 Expected Behaviors Defined

All components have predefined expected behaviors in `monitoringService.js`:

- **LandingPage**: Should render within 500ms
- **Login**: Form submission should call authService
- **Dashboard**: Should load data within 500ms
- **AI Chat**: Should show typing indicator during API call
- **Journal**: Entry operations should update localStorage
- **Profile**: Picture upload should validate file type/size

When actual behavior doesn't match, you'll see:
- ⚠️ "Validation: [status] - [message]"

## 🎓 Best Practices

### DO:
- ✅ Use monitoring hooks in all new components
- ✅ Define expected behaviors for critical paths
- ✅ Review dashboard weekly for patterns
- ✅ Set up auto-correction for known error types
- ✅ Export logs for long-term analysis

### DON'T:
- ❌ Log sensitive data (passwords, tokens)
- ❌ Over-monitor (keep log level at 'info' in production)
- ❌ Ignore validation warnings
- ❌ Let logs accumulate (auto-deleted after 30 days)

## 🚨 Troubleshooting

### Dashboard Not Loading
1. Verify you're logged in as admin
2. Check browser console for errors
3. Verify backend is running: `curl http://localhost:5000/health`

### Logs Not Appearing
1. Check browser network tab for failed POST to `/api/monitoring/logs`
2. Verify MongoDB is running: `docker-compose ps`
3. Check backend logs: `docker-compose logs backend`

### High Memory Usage
- Reduce `maxLocalLogs` in `monitoringService.js` (default: 1000)
- Decrease `flushInterval` (default: 10000ms)

## 📚 Full Documentation

For complete technical documentation, see:
- **MONITORING_SYSTEM_GUIDE.md** - Complete system documentation
- **src/services/monitoringService.js** - Frontend service with comments
- **backend/src/controllers/monitoringController.js** - Backend API docs

## ✨ Summary

**Your monitoring system is now:**
- ✅ Tracking every action in real-time
- ✅ Validating component behavior
- ✅ Auto-correcting common errors
- ✅ Providing health insights
- ✅ Helping diagnose issues quickly

**Access it now:**
1. Log in as admin
2. Click "Monitoring" in sidebar
3. Explore your application's health!

---

**Questions or need help? Check the full guide or contact the dev team.**
