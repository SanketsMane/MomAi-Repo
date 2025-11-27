// Suppress React DevTools searchParams warnings in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    
    // Suppress specific React DevTools warnings that don't affect functionality
    if (
      message.includes('searchParams._debugInfo') ||
      message.includes('searchParams should be unwrapped with React.use()') ||
      (message.includes('use') && message.includes('try/catch'))
    ) {
      return; // Don't log these specific warnings
    }
    
    // Log all other errors normally
    originalError.apply(console, args);
  };
}

export {};