import { ChangePasswordForm } from "./ChangePasswordForm";
import { TeamEmailForm } from "./TeamEmailForm";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your admin account</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-1">Notification Email</h2>
        <p className="text-sm text-slate-500 mb-5">
          Where website form submissions (contact, quotes, pickups, customs) are
          sent. Changes apply immediately to new submissions.
        </p>
        <TeamEmailForm />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-1">Change Password</h2>
        <p className="text-sm text-slate-500 mb-5">
          Update your login email or password. You&apos;ll need your current password to confirm.
        </p>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
