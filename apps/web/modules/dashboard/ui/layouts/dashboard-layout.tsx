import { AuthGuard } from "@/modules/auth/ui/components/auth-guard"
import { OrganizationGuard } from "@/modules/auth/ui/components/organization-guard"
import { ApprovalGuard } from "@/components/approval-guard"
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";
import { DashboardHeader } from "@/modules/dashboard/ui/components/dashboard-header";
import { SidebarProvider, SidebarInset } from "@workspace/ui/components/sidebar";
import { Provider } from "jotai";
import { cookies } from "next/headers";
import { Providers } from "@/components/providers";

export const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  // Using SIDEBAR_COOKIE_NAME from sidebar component does not work due to monorepo and SSR
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <Providers>
      <AuthGuard>
        <ApprovalGuard>
          <OrganizationGuard>
            <Provider>
              <SidebarProvider defaultOpen={defaultOpen}>
                <DashboardSidebar />
                <SidebarInset>
                  <DashboardHeader />
                  <main className="flex flex-1 flex-col p-4 pt-0">
                    {children}
                  </main>
                </SidebarInset>
              </SidebarProvider>
            </Provider>
          </OrganizationGuard>
        </ApprovalGuard>
      </AuthGuard>
    </Providers>
  );
};
