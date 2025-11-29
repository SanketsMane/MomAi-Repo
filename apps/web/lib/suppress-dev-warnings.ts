// Suppress React DevTools searchParams warnings in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // Enhanced error suppression
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    const stack = args[1]?.stack || '';
    
    // Suppress specific React DevTools warnings and Next.js searchParams errors
    if (
      message.includes('searchParams._debugInfo') ||
      message.includes('searchParams should be unwrapped with React.use()') ||
      message.includes('sync-dynamic-apis') ||
      message.includes('trackDebugInfoFromUsedThenables') ||
      message.includes('chrome-extension://') ||
      stack.includes('chrome-extension://') ||
      stack.includes('installHook.js') ||
      (message.includes('use') && message.includes('try/catch'))
    ) {
      return; // Don't log these specific warnings
    }
    
    // Log all other errors normally
    originalError.apply(console, args);
  };
  
  // Also suppress warnings
  console.warn = (...args) => {
    const message = args[0]?.toString() || '';
    
    if (
      message.includes('searchParams') ||
      message.includes('sync-dynamic-apis')
    ) {
      return;
    }
    
    originalWarn.apply(console, args);
  };
  
  // Suppress unhandled error events
  window.addEventListener('error', (event) => {
    const message = event.message || '';
    if (
      message.includes('searchParams') ||
      message.includes('sync-dynamic-apis') ||
      event.filename?.includes('chrome-extension://')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

export {};