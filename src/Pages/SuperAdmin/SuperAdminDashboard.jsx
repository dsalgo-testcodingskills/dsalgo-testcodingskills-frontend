import React, { useMemo, useState } from "react";
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Building2, Users, IndianRupee, FileText, Activity, TrendingUp,
  ShieldAlert, CheckCircle2, Search, ChevronRight,
} from "lucide-react";
import "./SuperAdminDash.scss";

/* ============================================================
   MOCK DATA — replace each block with your real API responses.
   ============================================================ */

const kpis = {
  totalOrganizations: 248,
  totalUsers: 18420,
  totalRevenue: 8245000,
  testsCreated: 5310,
};

const systemHealth = {
  operationalPercent: 99.97,
  status: "All systems operational",
};

const newOrgsByDay = [
  { date: "Jul 28", count: 4 },
  { date: "Jul 29", count: 7 },
  { date: "Jul 30", count: 3 },
  { date: "Jul 31", count: 9 },
  { date: "Aug 01", count: 6 },
  { date: "Aug 02", count: 11 },
  { date: "Aug 03", count: 8 },
];

const subscriptionTiers = [
  { tier: "Free", usage: 142, max: 200, color: "#94A3B8" },
  { tier: "Starter", usage: 61, max: 80, color: "#38BDF8" },
  { tier: "Growth", usage: 33, max: 50, color: "#6366F1" },
  { tier: "Enterprise", usage: 12, max: 20, color: "#F59E0B" },
];

const topOrganizations = [
  { name: "Bright Path Academy", score: 4820 },
  { name: "NexGen Institute", score: 4310 },
  { name: "Summit Learning Co.", score: 3990 },
  { name: "Vertex Skills Hub", score: 3540 },
  { name: "Northfield College", score: 3105 },
];

const questionBank = {
  total: 24680,
  categories: [
    { category: "Aptitude", count: 8120, percentage: 33, color: "#6366F1" },
    { category: "Technical", count: 6910, percentage: 28, color: "#38BDF8" },
    { category: "Verbal", count: 4560, percentage: 18, color: "#22C55E" },
    { category: "Logical Reasoning", count: 3210, percentage: 13, color: "#F59E0B" },
    { category: "Domain Specific", count: 1880, percentage: 8, color: "#EC4899" },
  ],
};

const testStatus = [
  { name: "Active", value: 142, color: "#22C55E" },
  { name: "Ongoing", value: 58, color: "#38BDF8" },
  { name: "Completed", value: 310, color: "#6366F1" },
  { name: "Expired", value: 24, color: "#94A3B8" },
];

const studentParticipation = {
  activeNow: 1284,
  peakToday: 2960,
  series: [
    { slot: "6am", value: 120 },
    { slot: "9am", value: 860 },
    { slot: "12pm", value: 1740 },
    { slot: "3pm", value: 2960 },
    { slot: "6pm", value: 2100 },
    { slot: "9pm", value: 940 },
  ],
};

const completionRate = { percentage: 87.4, delta: 2.1 };

const proctoringFlags = { total: 63, summary: "Mostly tab-switch and multi-face detections" };

const organizations = [
  { name: "Bright Path Academy", plan: "Enterprise", users: 1240, testsRemaining: 480, questionsRemaining: 2100, status: "Active" },
  { name: "NexGen Institute", plan: "Growth", users: 860, testsRemaining: 120, questionsRemaining: 640, status: "Active" },
  { name: "Summit Learning Co.", plan: "Starter", users: 340, testsRemaining: 40, questionsRemaining: 210, status: "Trial" },
  { name: "Vertex Skills Hub", plan: "Free", users: 65, testsRemaining: 5, questionsRemaining: 30, status: "Active" },
  { name: "Northfield College", plan: "Enterprise", users: 990, testsRemaining: 300, questionsRemaining: 1500, status: "Suspended" },
  { name: "Careerwise Labs", plan: "Growth", users: 410, testsRemaining: 88, questionsRemaining: 520, status: "Active" },
];

/* ============================================================ */

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const formatNum = (n) => new Intl.NumberFormat("en-IN").format(n);

function StatusPill({ status }) {
  const map = {
    Active: "sa-pill--active",
    Trial: "sa-pill--trial",
    Suspended: "sa-pill--suspended",
  };
  return <span className={`sa-pill ${map[status] || "sa-pill--default"}`}>{status}</span>;
}

export default function SuperAdminDashboard() {
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filteredOrgs = useMemo(() => {
    return organizations.filter((o) => {
      const planOk =
        planFilter === "all" ||
        (planFilter === "free" && o.plan === "Free") ||
        (planFilter === "paid" && o.plan !== "Free");
      const statusOk = statusFilter === "all" || o.status === statusFilter;
      const queryOk = o.name.toLowerCase().includes(query.toLowerCase());
      return planOk && statusOk && queryOk;
    });
  }, [planFilter, statusFilter, query]);

  const maxTopScore = Math.max(...topOrganizations.map((o) => o.score));

  return (
    <div className="sa-dashboard">
      {/* Header */}
      <div className="sa-header">
        <div>
          <h1 className="sa-header__title">Super Admin Dashboard</h1>
          <p className="sa-header__subtitle">Platform-wide overview across all organizations</p>
        </div>
        <div className="sa-status-pill">
          <span className="sa-status-pill__dot" />
          {systemHealth.status} · {systemHealth.operationalPercent}%
        </div>
      </div>

      {/* 1. KPI cards */}
      <div className="sa-grid sa-grid--kpi">
        <div className="sa-kpi">
          <div>
            <p className="sa-kpi__label">Total Organizations</p>
            <p className="sa-kpi__value">{formatNum(kpis.totalOrganizations)}</p>
          </div>
          <div className="sa-kpi__icon sa-kpi__icon--indigo"><Building2 size={18} /></div>
        </div>
        <div className="sa-kpi">
          <div>
            <p className="sa-kpi__label">Total Platform Users</p>
            <p className="sa-kpi__value">{formatNum(kpis.totalUsers)}</p>
          </div>
          <div className="sa-kpi__icon sa-kpi__icon--sky"><Users size={18} /></div>
        </div>
        <div className="sa-kpi">
          <div>
            <p className="sa-kpi__label">Total Revenue</p>
            <p className="sa-kpi__value">{formatINR(kpis.totalRevenue)}</p>
          </div>
          <div className="sa-kpi__icon sa-kpi__icon--emerald"><IndianRupee size={18} /></div>
        </div>
        <div className="sa-kpi">
          <div>
            <p className="sa-kpi__label">Tests Created</p>
            <p className="sa-kpi__value">{formatNum(kpis.testsCreated)}</p>
          </div>
          <div className="sa-kpi__icon sa-kpi__icon--amber"><FileText size={18} /></div>
        </div>
      </div>

      <div className="sa-grid sa-grid--3col-wide-first">
        {/* 3. New organizations chart */}
        <div className="sa-card">
          <div className="sa-card__title-row"><h3 className="sa-card__title">New Organizations (Last 7 Days)</h3></div>
          <div className="sa-card__body--chart" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={newOrgsByDay} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748B" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. System health */}
        <div className="sa-card">
          <div className="sa-card__title-row"><h3 className="sa-card__title">System Health</h3></div>
          <div className="sa-card__center">
            <div className="sa-gauge">
              <svg viewBox="0 0 36 36">
                <path d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                <path
                  d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="3"
                  strokeDasharray={`${systemHealth.operationalPercent}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="sa-gauge__value">{systemHealth.operationalPercent}%</div>
            </div>
            <p className="sa-health-status"><CheckCircle2 size={14} /> {systemHealth.status}</p>
          </div>
        </div>
      </div>

      <div className="sa-grid sa-grid--3col">
        {/* 4. Subscription tiers */}
        <div className="sa-card">
          <div className="sa-card__title-row"><h3 className="sa-card__title">Subscription Tiers</h3></div>
          <div className="sa-card__body">
            {subscriptionTiers.map((t) => (
              <div className="sa-bar-row" key={t.tier}>
                <div className="sa-bar-row__labels">
                  <strong>{t.tier}</strong>
                  <span>{t.usage} / {t.max}</span>
                </div>
                <div className="sa-bar-row__track">
                  <div className="sa-bar-row__fill" style={{ width: `${Math.min((t.usage / t.max) * 100, 100)}%`, backgroundColor: t.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Top organizations */}
        <div className="sa-card">
          <div className="sa-card__title-row"><h3 className="sa-card__title">Top Organizations</h3></div>
          <div className="sa-card__body">
            <div className="sa-rank-list">
              {topOrganizations.map((o, i) => (
                <div className="sa-rank-row" key={o.name}>
                  <span className="sa-rank-row__index">{i + 1}</span>
                  <div className="sa-rank-row__main">
                    <div className="sa-rank-row__top-line">
                      <span>{o.name}</span>
                      <span>{formatNum(o.score)}</span>
                    </div>
                    <div className="sa-rank-row__track">
                      <div className="sa-rank-row__fill" style={{ width: `${(o.score / maxTopScore) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 7. Test status distribution */}
        <div className="sa-card">
          <div className="sa-card__title-row"><h3 className="sa-card__title">Test Status Distribution</h3></div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={testStatus} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {testStatus.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="sa-legend">
            {testStatus.map((s) => (
              <div className="sa-legend__item" key={s.name}>
                <span className="sa-legend__dot" style={{ backgroundColor: s.color }} />
                {s.name}: {s.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sa-grid sa-grid--3col-wide-first">
        {/* 6. Question bank inventory */}
        <div className="sa-card">
          <div className="sa-card__title-row"><h3 className="sa-card__title">Question Bank Inventory ({formatNum(questionBank.total)} items)</h3></div>
          <div className="sa-card__body">
            {questionBank.categories.map((c) => (
              <div className="sa-bar-row" key={c.category}>
                <div className="sa-bar-row__labels">
                  <strong>{c.category}</strong>
                  <span>{formatNum(c.count)} · {c.percentage}%</span>
                </div>
                <div className="sa-bar-row__track">
                  <div className="sa-bar-row__fill" style={{ width: `${c.percentage}%`, backgroundColor: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 10. Proctoring flags */}
        <div className="sa-card">
          <div className="sa-card__title-row"><h3 className="sa-card__title">Proctoring Flags</h3></div>
          <div className="sa-card__center">
            <div className="sa-flag-icon"><ShieldAlert size={22} /></div>
            <p className="sa-flag-count">{proctoringFlags.total}</p>
            <p className="sa-flag-summary">{proctoringFlags.summary}</p>
          </div>
        </div>
      </div>

      <div className="sa-grid sa-grid--3col-wide-first">
        {/* 8. Student participation */}
        <div className="sa-card">
          <div className="sa-card__title-row">
            <h3 className="sa-card__title">Student Participation</h3>
            <div className="sa-inline-stats">
              <span><Activity size={12} className="sa-icon--emerald" />Active now: <strong>{formatNum(studentParticipation.activeNow)}</strong></span>
              <span><TrendingUp size={12} className="sa-icon--indigo" />Peak today: <strong>{formatNum(studentParticipation.peakToday)}</strong></span>
            </div>
          </div>
          <div className="sa-card__body--chart" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studentParticipation.series} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="participationFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="slot" tick={{ fontSize: 12, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748B" }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2.5} fill="url(#participationFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 9. Completion rate */}
        <div className="sa-card">
          <div className="sa-card__title-row"><h3 className="sa-card__title">Completion Rate</h3></div>
          <div className="sa-card__center sa-completion">
            <p className="sa-completion__value">{completionRate.percentage}%</p>
            <p className={`sa-completion__delta ${completionRate.delta >= 0 ? "sa-completion__delta--up" : "sa-completion__delta--down"}`}>
              {completionRate.delta >= 0 ? "▲" : "▼"} {Math.abs(completionRate.delta)}% vs last period
            </p>
          </div>
        </div>
      </div>

      {/* Organization management table */}
      <div className="sa-card">
        <div className="sa-table-toolbar">
          <h3 className="sa-card__title">Organizations</h3>
          <div className="sa-table-controls">
            <div className="sa-search">
              <Search size={14} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search organizations"
              />
            </div>
            <select className="sa-select" value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
              <option value="all">All plans</option>
              <option value="paid">Paid</option>
              <option value="free">Free</option>
            </select>
            <select className="sa-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="Active">Active</option>
              <option value="Trial">Trial</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Plan</th>
                <th>Users</th>
                <th>Tests Left</th>
                <th>Custom Qs Left</th>
                <th>Status</th>
                <th className="sa-table__action-cell">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrgs.map((o) => (
                <tr key={o.name}>
                  <td>{o.name}</td>
                  <td>{o.plan}</td>
                  <td>{formatNum(o.users)}</td>
                  <td>{o.testsRemaining}</td>
                  <td>{o.questionsRemaining}</td>
                  <td><StatusPill status={o.status} /></td>
                  <td className="sa-table__action-cell">
                    <button className="sa-table__action-btn">View <ChevronRight size={14} /></button>
                  </td>
                </tr>
              ))}
              {filteredOrgs.length === 0 && (
                <tr>
                  <td colSpan={7} className="sa-table__empty">No organizations match this filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
