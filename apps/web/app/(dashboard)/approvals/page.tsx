"use client";

import dynamic from 'next/dynamic';

// Dynamically import the ApprovalsView component with no SSR
const ApprovalsView = dynamic(
  () => import('@/modules/approvals/ui/views/approvals-view').then((mod) => ({ default: mod.ApprovalsView })),
  { 
    ssr: false,
    loading: () => <div>Loading approvals...</div>
  }
);

const ApprovalsPage = () => {
  return <ApprovalsView />;
};

export default ApprovalsPage;