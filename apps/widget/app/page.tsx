"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { WidgetView } from "@/modules/widget/ui/views/widget-view";

const WidgetPageContent = () => {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const organizationId = searchParams.get('organizationId') || '';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="flex h-screen w-full max-w-md mx-auto flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
        <header 
          data-gradient="true"
          className="mom-gradient-header px-5 py-4 text-white rounded-t-xl"
          style={{
            background: 'linear-gradient(180deg, #0F3A7A 0%, #0A2558 100%)',
            backgroundImage: 'linear-gradient(180deg, #0F3A7A 0%, #0A2558 100%)',
            color: 'white',
            '--gradient-from': '#0F3A7A',
            '--gradient-to': '#0A2558'
          } as React.CSSProperties}
        >
          <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
            <p className="text-2xl">👋 MOM AI</p>
            <p className="text-lg">Loading...</p>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  return (
    <WidgetView organizationId={organizationId} />
  );
};

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WidgetPageContent />
    </Suspense>
  );
};

export default Page;
