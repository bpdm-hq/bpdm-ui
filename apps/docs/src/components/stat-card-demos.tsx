'use client';

import { StatCard } from '@bpdm/ui/stat-card';

// ── small inline icons (any SVG / icon library works) ─────────────────────────
const cls = 'size-5';
const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const Users = () => (
  <svg viewBox="0 0 24 24" className={cls} {...s}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const UserPlus = () => (
  <svg viewBox="0 0 24 24" className={cls} {...s}>
    <path d="M14 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M20 8v6M23 11h-6" />
  </svg>
);
const Activity = () => (
  <svg viewBox="0 0 24 24" className={cls} {...s}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
const Eye = () => (
  <svg viewBox="0 0 24 24" className={cls} {...s}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const TrendDown = () => (
  <svg viewBox="0 0 24 24" className={cls} {...s}>
    <path d="M22 17 13.5 8.5l-5 5L2 7" />
    <path d="M16 17h6v-6" />
  </svg>
);
const Clock = () => (
  <svg viewBox="0 0 24 24" className={cls} {...s}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

function Box({ children }: { children: React.ReactNode }) {
  return <div className="w-72">{children}</div>;
}

// ── demos ─────────────────────────────────────────────────────────────────────
export function StatCardUsageDemo() {
  return (
    <Box>
      <StatCard label="Active users" value="8,420" delta={3.1} deltaLabel="vs last week" icon={<Users />} />
    </Box>
  );
}

export function StatCardDeltaDemo() {
  return (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
      {/* up + good → green */}
      <StatCard label="New signups" value="1,294" delta={12.5} deltaLabel="vs last month" icon={<UserPlus />} />
      {/* down + good → red */}
      <StatCard label="Avg. session" value="4m 12s" delta={-1.8} deltaLabel="vs last month" icon={<Clock />} />
      {/* up but bad (positiveIsGood=false) → red */}
      <StatCard label="Bounce rate" value="2.4%" delta={0.6} positiveIsGood={false} deltaLabel="vs last month" icon={<TrendDown />} />
    </div>
  );
}

export function StatCardAccentDemo() {
  return (
    <div className="grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Page views" value="1.24M" accent="#2563eb" icon={<Eye />} />
      <StatCard label="Sessions" value="84.3K" accent="#0d9488" icon={<Activity />} />
      <StatCard label="Bounce rate" value="1.8%" accent="#e11d48" icon={<TrendDown />} />
      <StatCard label="New signups" value="1,294" accent="#7c3aed" icon={<UserPlus />} />
    </div>
  );
}

export function StatCardNoDeltaDemo() {
  return (
    <Box>
      <StatCard label="Open tickets" value="37" />
    </Box>
  );
}

export function StatCardLoadingDemo() {
  return (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
      <StatCard label="Active users" value="—" loading />
      <StatCard label="New signups" value="—" loading />
    </div>
  );
}

export function StatCardDashboardDemo() {
  return (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
      <StatCard label="Active users" value="8,420" delta={3.1} deltaLabel="vs last week" icon={<Users />} />
      <StatCard label="New signups" value="1,294" delta={12.5} deltaLabel="vs last month" icon={<UserPlus />} />
      <StatCard label="Bounce rate" value="2.4%" delta={0.6} positiveIsGood={false} deltaLabel="vs last month" icon={<TrendDown />} />
      <StatCard label="Avg. session" value="4m 12s" delta={-1.8} deltaLabel="vs last month" icon={<Clock />} />
    </div>
  );
}
