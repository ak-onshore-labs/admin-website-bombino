import { Sidebar } from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        role={user?.role ?? "editor"}
        name={user?.name ?? ""}
        email={user?.email ?? ""}
      />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {children}
      </main>
    </div>
  );
}
