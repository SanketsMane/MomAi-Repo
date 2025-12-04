"use client";

import { useEffect, useState } from 'react';
import '../styles/widget-header.css';

interface ClientWidgetProps {
  organizationId?: string;
}

// Loading component
const LoadingWidget = () => (
  <main className="flex h-screen w-full max-w-md mx-auto flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
    <header 
      data-gradient="true"
      className="mom-gradient-header px-5 py-4 rounded-t-xl text-white"
      style={{
        background: 'linear-gradient(180deg, #3b82f6 0%, #0b63f3 100%)',
        backgroundImage: 'linear-gradient(180deg, #3b82f6 0%, #0b63f3 100%)',
        color: 'white'
      }}
    >
      <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
        <p className="text-2xl">👋 MOM AI</p>
        <p className="text-lg">Loading...</p>
      </div>
    </header>
    <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="text-sm">Loading widget...</p>
    </div>
  </main>
);

export const ClientWidget = ({ organizationId = '' }: ClientWidgetProps) => {
  const [WidgetView, setWidgetView] = useState<React.ComponentType<any> | null>(null);
  
  useEffect(() => {
    // Dynamic import on client side only
    import('@/modules/widget/ui/views/widget-view')
      .then(mod => setWidgetView(() => mod.WidgetView))
      .catch(console.error);
  }, []);

  if (!WidgetView) {
    return <LoadingWidget />;
  }

  return <WidgetView organizationId={organizationId} />;
};