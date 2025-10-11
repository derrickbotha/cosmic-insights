import { useEffect, useRef } from 'react';
import monitoringService from '../services/monitoringService';

/**
 * Hook to automatically monitor component lifecycle
 * Usage: useMonitoring('ComponentName', props);
 */
export const useMonitoring = (componentName, props = {}) => {
  const mountTimeRef = useRef(null);

  useEffect(() => {
    // Track mount
    mountTimeRef.current = performance.now();
    monitoringService.trackComponentMount(componentName, props);

    // Track unmount
    return () => {
      const duration = performance.now() - mountTimeRef.current;
      monitoringService.trackComponentUnmount(componentName);
      
      // Log mount duration
      monitoringService.trackPerformance(componentName, 'mount_duration', duration, 1000);
    };
  }, [componentName]);

  return {
    trackInteraction: (action, details) =>
      monitoringService.trackInteraction(componentName, action, details),
    trackError: (error, action, additionalInfo) =>
      monitoringService.trackError(error, componentName, action, additionalInfo),
    trackStateChange: (stateName, oldValue, newValue) =>
      monitoringService.trackStateChange(componentName, stateName, oldValue, newValue),
    trackNavigation: (from, to) =>
      monitoringService.trackNavigation(from, to, componentName),
    trackStorageOperation: (operation, key, success) =>
      monitoringService.trackStorageOperation(operation, key, componentName, success),
  };
};

/**
 * Hook to monitor API calls with automatic error handling
 * Usage: const { trackAPICall } = useAPIMonitoring('ComponentName');
 */
export const useAPIMonitoring = (componentName) => {
  return {
    trackAPICall: async (endpoint, method, apiFunction, ...args) => {
      const tracker = monitoringService.trackAPICall(endpoint, method, componentName);
      
      try {
        const result = await apiFunction(...args);
        tracker.success(result);
        return result;
      } catch (error) {
        tracker.error(error);
        throw error;
      }
    },
  };
};

/**
 * Hook to monitor form submissions
 * Usage: const { trackFormSubmit } = useFormMonitoring('ComponentName', 'formName');
 */
export const useFormMonitoring = (componentName, formName) => {
  return {
    trackFormSubmit: (success, validationErrors = []) => {
      if (success) {
        monitoringService.trackInteraction(componentName, `form.${formName}.submit`, {
          result: 'success',
        });
      } else {
        monitoringService.trackInteraction(componentName, `form.${formName}.submit`, {
          result: 'validation_failed',
          errors: validationErrors,
        });
      }
    },
    trackFieldValidation: (fieldName, isValid, error) => {
      if (!isValid) {
        monitoringService.trackInteraction(componentName, `form.${formName}.validation.${fieldName}`, {
          result: 'invalid',
          error,
        });
      }
    },
  };
};

/**
 * Hook to monitor performance metrics
 * Usage: const { startMeasure, endMeasure } = usePerformanceMonitoring('ComponentName');
 */
export const usePerformanceMonitoring = (componentName) => {
  const measurements = useRef({});

  return {
    startMeasure: (metricName) => {
      measurements.current[metricName] = performance.now();
    },
    endMeasure: (metricName, threshold) => {
      const startTime = measurements.current[metricName];
      if (startTime) {
        const duration = performance.now() - startTime;
        monitoringService.trackPerformance(componentName, metricName, duration, threshold);
        delete measurements.current[metricName];
      }
    },
  };
};

/**
 * Hook to monitor user interactions with automatic tracking
 * Usage: const buttonProps = useInteractionTracking('ComponentName', 'button.name', onClick);
 */
export const useInteractionTracking = (componentName, action, originalHandler) => {
  return {
    onClick: (...args) => {
      monitoringService.trackInteraction(componentName, action, {
        timestamp: new Date().toISOString(),
      });
      
      if (originalHandler) {
        return originalHandler(...args);
      }
    },
  };
};

/**
 * HOC to wrap a component with automatic monitoring
 * Usage: export default withMonitoring(MyComponent, 'MyComponent');
 */
export const withMonitoring = (WrappedComponent, componentName) => {
  return function MonitoredComponent(props) {
    const monitoring = useMonitoring(componentName, props);
    
    return (
      <WrappedComponent
        {...props}
        monitoring={monitoring}
      />
    );
  };
};

/**
 * Hook to monitor state changes automatically
 * Usage: useStateMonitoring('ComponentName', 'stateName', stateValue);
 */
export const useStateMonitoring = (componentName, stateName, stateValue) => {
  const previousValueRef = useRef(stateValue);

  useEffect(() => {
    const previousValue = previousValueRef.current;
    
    if (previousValue !== stateValue) {
      monitoringService.trackStateChange(componentName, stateName, previousValue, stateValue);
      previousValueRef.current = stateValue;
    }
  }, [componentName, stateName, stateValue]);
};

/**
 * Hook to monitor navigation changes
 * Usage: useNavigationMonitoring('ComponentName');
 */
export const useNavigationMonitoring = (componentName) => {
  const previousPathRef = useRef(window.location.pathname);

  useEffect(() => {
    const handleNavigation = () => {
      const currentPath = window.location.pathname;
      const previousPath = previousPathRef.current;
      
      if (previousPath !== currentPath) {
        monitoringService.trackNavigation(previousPath, currentPath, componentName);
        previousPathRef.current = currentPath;
      }
    };

    // Listen for navigation events
    window.addEventListener('popstate', handleNavigation);
    
    // Also check on component mount
    handleNavigation();

    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [componentName]);
};

/**
 * Hook to automatically monitor localStorage operations
 * Usage: const { monitoredSetItem, monitoredGetItem, monitoredRemoveItem } = useLocalStorageMonitoring('ComponentName');
 */
export const useLocalStorageMonitoring = (componentName) => {
  return {
    monitoredSetItem: (key, value) => {
      try {
        localStorage.setItem(key, value);
        monitoringService.trackStorageOperation('set', key, componentName, true);
      } catch (error) {
        monitoringService.trackStorageOperation('set', key, componentName, false);
        monitoringService.trackError(error, componentName, 'localStorage.setItem');
        throw error;
      }
    },
    monitoredGetItem: (key) => {
      try {
        const value = localStorage.getItem(key);
        monitoringService.trackStorageOperation('get', key, componentName, true);
        return value;
      } catch (error) {
        monitoringService.trackStorageOperation('get', key, componentName, false);
        monitoringService.trackError(error, componentName, 'localStorage.getItem');
        throw error;
      }
    },
    monitoredRemoveItem: (key) => {
      try {
        localStorage.removeItem(key);
        monitoringService.trackStorageOperation('remove', key, componentName, true);
      } catch (error) {
        monitoringService.trackStorageOperation('remove', key, componentName, false);
        monitoringService.trackError(error, componentName, 'localStorage.removeItem');
        throw error;
      }
    },
  };
};

/**
 * Hook to catch and monitor errors within a component
 * Usage: useErrorBoundaryMonitoring('ComponentName');
 */
export const useErrorBoundaryMonitoring = (componentName) => {
  useEffect(() => {
    const handleError = (event) => {
      monitoringService.trackError(
        new Error(event.error?.message || 'Unknown error'),
        componentName,
        'error_boundary',
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      );
    };

    const handleRejection = (event) => {
      monitoringService.trackError(
        new Error(event.reason),
        componentName,
        'unhandled_promise_rejection'
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [componentName]);
};

export default {
  useMonitoring,
  useAPIMonitoring,
  useFormMonitoring,
  usePerformanceMonitoring,
  useInteractionTracking,
  withMonitoring,
  useStateMonitoring,
  useNavigationMonitoring,
  useLocalStorageMonitoring,
  useErrorBoundaryMonitoring,
};
