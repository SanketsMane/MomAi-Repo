import { ClientWidget } from '@/components/client-widget';

interface PageProps {
  searchParams: Promise<{ organizationId?: string }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const organizationId = params?.organizationId || '';
  
  return <ClientWidget organizationId={organizationId} />;
};

export default Page;
