import React from "react";
import {
  Camera,
  TrendingUp,
  Monitor,
  LayoutTemplate,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────

const STAT_CARDS = [
  {
    label: "Sessions Today",
    value: "24",
    change: "+12%",
    up: true,
    sub: "vs. yesterday",
    icon: Camera,
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
  },
  {
    label: "Revenue This Month",
    value: "Rp 4.2jt",
    change: "+8%",
    up: true,
    sub: "vs. last month",
    icon: TrendingUp,
    iconBg: "bg-ok/10",
    iconColor: "text-ok",
  },
  {
    label: "Active Kiosks",
    value: "3 / 5",
    change: "-1",
    up: false,
    sub: "devices online",
    icon: Monitor,
    iconBg: "bg-warn/10",
    iconColor: "text-warn",
  },
  {
    label: "Total Templates",
    value: "12",
    change: "+2",
    up: true,
    sub: "this week",
    icon: LayoutTemplate,
    iconBg: "bg-surface-hover",
    iconColor: "text-lo",
  },
];

const WEEKLY_SESSIONS = [
  { day: "Mon", sessions: 18 },
  { day: "Tue", sessions: 32 },
  { day: "Wed", sessions: 27 },
  { day: "Thu", sessions: 41 },
  { day: "Fri", sessions: 55 },
  { day: "Sat", sessions: 72 },
  { day: "Sun", sessions: 24 },
];

const RECENT_SESSIONS = [
  {
    id: "s001",
    kiosk: "Mall Central Park",
    template: "Wedding Classic",
    time: "14:32",
    revenue: "Rp 35.000",
    prints: 2,
  },
  {
    id: "s002",
    kiosk: "Grand Indonesia",
    template: "Minimal Strip",
    time: "14:15",
    revenue: "Rp 25.000",
    prints: 1,
  },
  {
    id: "s003",
    kiosk: "Plaza Senayan",
    template: "Retro Mono",
    time: "13:58",
    revenue: "Rp 45.000",
    prints: 3,
  },
  {
    id: "s004",
    kiosk: "Mall Central Park",
    template: "Wedding Classic",
    time: "13:40",
    revenue: "Rp 35.000",
    prints: 2,
  },
  {
    id: "s005",
    kiosk: "Pondok Indah Mall",
    template: "Y2K Vibe",
    time: "13:21",
    revenue: "Rp 25.000",
    prints: 1,
  },
];

const TOP_TEMPLATES = [
  { name: "Wedding Classic", sessions: 142, pct: 90 },
  { name: "Minimal Strip", sessions: 98, pct: 62 },
  { name: "Retro Mono", sessions: 76, pct: 48 },
  { name: "Y2K Vibe", sessions: 54, pct: 34 },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const maxSessions = Math.max(...WEEKLY_SESSIONS.map((d) => d.sessions));

export const DashboardPage: React.FC = () => {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-full p-6 font-sans bg-void">
      {/* PAGE HEADER */}
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-hi tracking-tight">
          Overview
        </h1>
        <p className="mt-0.5 font-mono text-xs text-lo">{today}</p>
      </header>

      {/* ── STAT CARDS ── */}
      <section className="grid grid-cols-2 gap-4 mb-6 xl:grid-cols-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-surface border border-dim rounded-lg p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-lo uppercase tracking-wider">
                  {card.label}
                </span>
                <div className={`${card.iconBg} p-1.5 rounded`}>
                  <Icon
                    className={`w-3.5 h-3.5 ${card.iconColor}`}
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <p className="text-2xl font-semibold text-hi">{card.value}</p>
              <div className="flex items-center gap-1 font-mono text-xs">
                {card.up ? (
                  <ArrowUpRight className="w-3 h-3 text-ok" strokeWidth={1.5} />
                ) : (
                  <ArrowDownRight
                    className="w-3 h-3 text-err"
                    strokeWidth={1.5}
                  />
                )}
                <span
                  className={
                    card.up ? "text-ok font-medium" : "text-err font-medium"
                  }
                >
                  {card.change}
                </span>
                <span className="text-lo">{card.sub}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── MIDDLE ROW: Chart + Top Templates ── */}
      <section className="grid grid-cols-1 gap-4 mb-6 xl:grid-cols-3">
        {/* Weekly Sessions Bar Chart */}
        <div className="xl:col-span-2 bg-surface border border-dim rounded-lg p-5">
          <h2 className="mb-5 text-xs font-medium text-lo uppercase tracking-wider">
            Sessions — Last 7 Days
          </h2>
          <div className="flex items-end h-40 gap-3">
            {WEEKLY_SESSIONS.map((d) => {
              const heightPct = Math.round((d.sessions / maxSessions) * 100);
              const isToday = d.day === "Sat";
              return (
                <div
                  key={d.day}
                  className="flex flex-col items-center flex-1 gap-1.5"
                >
                  <span className="font-mono text-[10px] text-lo">
                    {d.sessions}
                  </span>
                  <div
                    className="flex items-end w-full"
                    style={{ height: "100px" }}
                  >
                    <div
                      className={`w-full rounded-sm transition-all ${
                        isToday ? "bg-accent" : "bg-dim-strong"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span
                    className={`font-mono text-[10px] font-medium ${isToday ? "text-accent" : "text-lo"}`}
                  >
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Templates */}
        <div className="bg-surface border border-dim rounded-lg p-5">
          <h2 className="mb-5 text-xs font-medium text-lo uppercase tracking-wider">
            Top Templates
          </h2>
          <div className="flex flex-col gap-4">
            {TOP_TEMPLATES.map((t, i) => (
              <div key={t.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-lo w-4">
                      #{i + 1}
                    </span>
                    <span className="font-medium text-xs text-hi truncate max-w-[120px]">
                      {t.name}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-lo">
                    {t.sessions}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-surface-hover rounded-full">
                  <div
                    className="h-full rounded-full bg-accent/50 transition-all"
                    style={{ width: `${t.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENT SESSIONS TABLE ── */}
      <section className="bg-surface border border-dim rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-dim">
          <h2 className="flex items-center gap-2 text-xs font-medium text-lo uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" strokeWidth={1.5} /> Recent Sessions
          </h2>
          <span className="font-mono text-[10px] text-lo bg-surface-raised border border-dim px-2 py-1 rounded">
            Today · Live
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-dim bg-surface-raised">
                <th className="px-5 py-3 font-medium text-left text-lo uppercase tracking-wider">
                  Kiosk
                </th>
                <th className="px-4 py-3 font-medium text-left text-lo uppercase tracking-wider">
                  Template
                </th>
                <th className="px-4 py-3 font-medium text-left text-lo uppercase tracking-wider">
                  Time
                </th>
                <th className="px-4 py-3 font-medium text-left text-lo uppercase tracking-wider">
                  Prints
                </th>
                <th className="px-5 py-3 font-medium text-right text-lo uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {RECENT_SESSIONS.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-b border-dim hover:bg-surface-hover transition-colors ${
                    i === 0 ? "bg-ok/5" : ""
                  }`}
                >
                  <td className="px-5 py-3 font-medium text-hi">{s.kiosk}</td>
                  <td className="px-4 py-3 text-lo">{s.template}</td>
                  <td className="px-4 py-3 text-lo">{s.time}</td>
                  <td className="px-4 py-3">
                    <span className="bg-surface-hover text-lo px-2 py-0.5 text-[10px] rounded">
                      ×{s.prints}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-right text-ok">
                    {s.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
