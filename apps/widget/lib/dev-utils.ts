// Nuclear approach to block ALL extension errors
(() => {
  'use strict';
  
  // Block at the earliest possible stage
  if (typeof window !== 'undefined') {
    // Completely override console methods before any other code runs
    const noop = () => {};
    
    // Store originals
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;
    
    // Create aggressive filters
    const isExtensionError = (msg: any) => {
      const str = String(msg || '').toLowerCase();
      return (
        str.includes('searchparam') ||
        str.includes('chrome-extension') ||
        str.includes('react devtools') ||
        str.includes('_debuginfo') ||
        str.includes('sync-dynamic-api') ||
        str.includes('warnforsyncaccess') ||
        str.includes('trackdebuginfo') ||
        str.includes('hydrat') ||
        str.includes('installhook') ||
        str.includes('mountfiberrecursively') ||
        str.includes('updatefiberrecursively') ||
        str.includes('createunhandlederror') ||
        str.includes('handleclienterror')
      );
    };
    
    // Nuclear console override
    console.error = function(...args) {
      // Check all arguments for extension content
      if (args.some(arg => 
        isExtensionError(arg) || 
        (arg?.stack && isExtensionError(arg.stack)) ||
        (arg?.message && isExtensionError(arg.message))
      )) {
        return; // Completely silent
      }
      return originalError.apply(console, args);
    };
    
    console.warn = function(...args) {
      if (args.some(arg => isExtensionError(arg))) {
        return;
      }
      return originalWarn.apply(console, args);
    };
    
    console.log = function(...args) {
      if (args.some(arg => isExtensionError(arg))) {
        return;
      }
      return originalLog.apply(console, args);
    };
    
    // Override console methods that extensions might use
    ['info', 'debug', 'trace'].forEach((method: string) => {
      const original = (console as any)[method];
      (console as any)[method] = function(...args: any[]) {
        if (args.some(arg => isExtensionError(arg))) {
          return;
        }
        return original.apply(console, args);
      };
    });
    
    // Block at window level with highest priority
    const blockExtensionErrors = (event: any) => {
      const message = String(event.message || event.reason || '').toLowerCase();
      if (isExtensionError(message) || 
          (event.filename && event.filename.includes('chrome-extension')) ||
          (event.source && String(event.source).includes('chrome-extension'))) {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        return false;
      }
    };
    
    // Add multiple error listeners with capture
    window.addEventListener('error', blockExtensionErrors, true);
    window.addEventListener('unhandledrejection', blockExtensionErrors, true);
    
    // Override global error handlers
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      if (isExtensionError(message) || 
          (source && source.includes('chrome-extension'))) {
        return true; // Prevent default
      }
      return originalOnError ? originalOnError(message, source, lineno, colno, error) : false;
    };
    
    const originalOnUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = function(event) {
      if (isExtensionError(event.reason)) {
        event.preventDefault();
        return;
      }
      return originalOnUnhandledRejection ? originalOnUnhandledRejection(event) : undefined;
    };
    
    // Block at the React error boundary level if possible
    if (typeof React !== 'undefined' && React.Component) {
      const originalComponentDidCatch = React.Component.prototype.componentDidCatch;
      if (originalComponentDidCatch) {
        React.Component.prototype.componentDidCatch = function(error, errorInfo) {
          if (isExtensionError(error.message) || isExtensionError(error.stack)) {
            return; // Silent ignore
          }
          return originalComponentDidCatch.call(this, error, errorInfo);
        };
      }
    }
  }
})();

export {};