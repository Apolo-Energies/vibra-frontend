import { Sidebar } from "@/components/sidebar/Sidebar";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Alert } from "@/components/ui/Alert";
import { Header } from "@/components/ui/Header";
import { auth } from "@/auth.config";
import { sidebarItems } from "@/constants/SidebarItems";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userRole = (session?.user as { role?: string })?.role ?? "";
  const allowedUrls = sidebarItems
    .filter((item) => item.roles.some((r) => r.toLowerCase() === userRole.toLowerCase()))
    .map((item) => item.url);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar allowedUrls={allowedUrls} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden bg-body overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <LoadingOverlay />
      <Alert />
    </div>
  );
}
