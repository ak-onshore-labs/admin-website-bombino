import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { readUsers, isProtectedUser } from "@/lib/users";
import { UsersManager } from "./UsersManager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (me.role !== "admin") redirect("/dashboard");

  const users = readUsers().map((u) => ({
    id: u.id, email: u.email, name: u.name, role: u.role,
    createdAt: u.createdAt, updatedAt: u.updatedAt,
    protected: isProtectedUser(u.email),
  }));

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage who can access the admin panel and what they can do.
        </p>
      </div>

      <UsersManager initialUsers={users} currentUserId={me.id} />
    </div>
  );
}
