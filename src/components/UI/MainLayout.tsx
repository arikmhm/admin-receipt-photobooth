import { NavLink, Outlet } from "react-router-dom";
import {
  LogOut,
  User,
  LayoutTemplate,
  Server,
  LayoutDashboard,
  Camera,
  Settings,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors rounded-md ${
    isActive
      ? "text-accent bg-accent/10"
      : "text-lo hover:bg-surface-hover hover:text-hi"
  }`;

const disabledClass =
  "flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-lo/40 cursor-not-allowed select-none rounded-md";

export function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-void">
      {/* SIDEBAR */}
      <aside className="flex flex-col w-56 font-sans border-r bg-surface border-dim shrink-0">
        {/* BRAND */}
        <div className="flex items-center gap-3 px-5 py-4">
          <span className="font-serif text-lg font-semibold tracking-widest text-hi">
            MEMOIR.
          </span>
        </div>

        {/* NAV LINKS */}
        <nav className="flex flex-col flex-1 gap-0.5 px-3 py-4">
          {/* Section: Main */}
          <p className="px-3 pt-1 pb-2 text-[9px] font-medium uppercase text-lo/60 tracking-widest">
            Main
          </p>
          <NavLink to="/dashboard" className={navLinkClass}>
            <LayoutDashboard className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            Dashboard
          </NavLink>

          {/* Section: Content */}
          <p className="px-3 pt-4 pb-2 text-[9px] font-medium uppercase text-lo/60 tracking-widest">
            Content
          </p>
          <NavLink to="/templates" className={navLinkClass}>
            <LayoutTemplate className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            Templates
          </NavLink>
          <NavLink to="/kiosks" className={navLinkClass}>
            <Server className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            Device Manager
          </NavLink>

          {/* Section: Coming Soon */}
          <p className="px-3 pt-4 pb-2 text-[9px] font-medium uppercase text-lo/60 tracking-widest">
            Coming Soon
          </p>
          <div className={disabledClass} title="Coming Soon">
            <Camera className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            <span>Sessions</span>
            <span className="ml-auto text-[8px] border border-dim px-1.5 py-0.5 rounded text-lo/40 font-mono">
              SOON
            </span>
          </div>
          <div className={disabledClass} title="Coming Soon">
            <Settings className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            <span>Settings</span>
            <span className="ml-auto text-[8px] border border-dim px-1.5 py-0.5 rounded text-lo/40 font-mono">
              SOON
            </span>
          </div>
        </nav>

        {/* BOTTOM: USER + LOGOUT */}
        <div className="px-4 py-4 border-t border-dim">
          <div className="flex items-center gap-2 mb-3 text-xs text-lo">
            <div className="p-1 rounded bg-surface-raised shrink-0">
              <User className="w-3 h-3" strokeWidth={1.5} />
            </div>
            <span className="truncate">{user?.email ?? "OWNER"}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center w-full gap-2 px-3 py-1.5 text-xs font-medium text-err border border-err/25 rounded-md hover:bg-err/10 transition-colors"
          >
            <LogOut className="w-3 h-3" strokeWidth={1.5} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-void">
        <Outlet />
      </main>
    </div>
  );
}
