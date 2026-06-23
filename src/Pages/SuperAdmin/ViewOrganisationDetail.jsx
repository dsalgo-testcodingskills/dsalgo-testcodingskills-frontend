import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import ReactPaginate from "react-paginate";
import PageContainer from "./PageContainer";
import {
  organizationById,
  organizationByUser,
  organizationQuestions,
  organizationTests,
  organisationSubscription,
  organizationPayment,
} from "../../Services/api";
import "./OrganizationList.scss";
import { subscriptionPlan} from "../../utils/constants";

const AVATAR_COLORS = [
  "#7c3aed",
  "#2563eb",
  "#059669",
  "#d97706",
  "#dc2626",
  "#0891b2",
];
const LIMIT = 10;

const getColor = (name) =>
  AVATAR_COLORS[name?.charCodeAt(0) % AVATAR_COLORS.length];

const getInitials = (name) =>
  name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

const fmt = {
  date: (v) => (v ? new Date(v).toLocaleDateString() : "N/A"),
  cap: (v) => (v ? v.charAt(0).toUpperCase() + v.slice(1) : "N/A"),
};

const TABS = [
  { key: "users", label: "Users", fetchFn: organizationByUser },
  { key: "questions", label: "Questions", fetchFn: organizationQuestions },
  { key: "tests", label: "Tests", fetchFn: organizationTests },
  {
    key: "subscription",
    label: "Subscription",
    fetchFn: organisationSubscription,
  },
  { key: "payment", label: "Payments", fetchFn: organizationPayment },
];

const TAB_TABLE = {
  users: {
    columns: ["Name", "Email", "Role", "Status"],
    renderRow: (u) => (
      <tr key={u._id}>
        <td style={{ fontWeight: 100, color: "var(--gray-700)" }}>{u.name || "N/A"}</td>
        <td style={{ color: "var(--gray-600)" }}>
          {u.emailId || u.email || "N/A"}
        </td>
        <td>
          <span
            className={`badge ${
              u.role === "admin" ? "badge-purple" : "badge-blue"
            }`}
          >
            {u.role}
          </span>
        </td>
        <td>
          <span
            className={`badge ${u.status === 1 ? "badge-green" : "badge-red"}`}
          >
            {u.status === 1 ? "Active" : "Inactive"}
          </span>
        </td>
      </tr>
    ),
  },

  questions: {
    columns: ["Question", "Level", "Sample", "Public", "Created At"],
    renderRow: (q) => (
      <tr key={q._id}>
        <td
          style={{
            maxWidth: 300,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: "var(--gray-700)",
            fontWeight: 100,
          }}
        >
          {q.title || q.question || "N/A"}
        </td>
        <td>
          <span
            className={`badge ${
              q.level === "easy"
                ? "badge-green"
                : q.level === "medium"
                ? "badge-amber"
                : "badge-red"
            }`}
          >
            {fmt.cap(q.level)}
          </span>
        </td>
        <td>{q.sampleQuestion ? "Yes" : "No"}</td>
        <td>{q.public ? "Yes" : "No"}</td>
        <td style={{ color: "var(--gray-600)" }}>{fmt.date(q.createdAt)}</td>
      </tr>
    ),
  },

  tests: {
    columns: ["Student Details", "Status", "Test Type", "Duration", "Date"],
    renderRow: (t) => (
      <tr key={t._id}>
        <td>
          <div style={{fontSize: "15px", fontWeight: 100, color: "var(--gray-800)" }}>
            {t.studentName || "N/A"}
          </div>
          <div style={{ fontSize: "13px", color: "var(--gray-600)" }}>
            {t.emailId || "N/A"}
          </div>
        </td>
        <td>
          <span
            className={`badge ${
              t.status === "completed"
                ? "badge-green"
                : t.status === "ongoing"
                ? "badge-blue"
                : "badge-amber"
            }`}
          >
            {fmt.cap(t.status)}
          </span>
        </td>
        <td style={{ color: "var(--gray-600)" }}>{t.TestType || "N/A"}</td>
        <td style={{ color: "var(--gray-600)" }}>
          {t.testDuration ? `${t.testDuration} mins` : "N/A"}
        </td>
        <td style={{ color: "var(--gray-600)", fontSize: "12px" }}>
          {fmt.date(t.startDate)}
        </td>
      </tr>
    ),
  },

  subscription: {
    columns: [
      "Subscription ID",
      "Plan ID",
      "Status",
      "Payment Method",
      "Counts (Total/Paid/Rem)",
      "Created At",
    ],
     renderRow: (s) => {
      const cyclePaid = s.paid_count ?? 0;
      const cycleTotal = s.total_count ?? 0;
      const cycleRem = s.remaining_count ?? 0;
      const billingCycle = `${cyclePaid} Paid / ${cycleRem} Rem (Total ${cycleTotal})`;
      const start = s.current_start ? fmt.date(s.current_start) : "";
      const end = s.current_end ? fmt.date(s.current_end) : "";
      const billingPeriod = start && end ? `${start} - ${end}` : "N/A";
      return (
        <tr key={s._id}>
          <td style={{ color: "var(--gray-700)", fontFamily: "monospace", fontSize: "12px" }}>
            {s.id || "N/A"}
          </td>
          <td style={{ color: "var(--gray-600)" }}>{s.plan_id || "N/A"}</td>
          <td>
            <span
              className={`badge ${
                s.status === "active" ? "badge-green" : "badge-amber"
              }`}
            >
              {s.status?.toUpperCase() || "N/A"}
            </span>
          </td>
          <td style={{ color: "var(--gray-600)" }}>
            {billingCycle}
          </td>
          <td style={{ color: "var(--gray-600)" }}>
            {billingPeriod}
          </td>
          <td style={{ color: "var(--gray-600)" }}>{fmt.date(s.createdAt)}</td>
        </tr>
      );
    },
  },

  payment: {
    columns: [
      "Payment ID / Order ID",
      "Amount",
      "Status",
      "Method",
      "Contact",
      "Date",
    ],
    renderRow: (p) => (
      <tr key={p._id}>
        <td
          style={{
            color: "var(--gray-700)",
             fontSize: "12px",
            fontFamily: "monospace",
          }}
        >
          <div>{p.id || "N/A"}</div>
          {p.order_id && (
            <div
              style={{
                fontSize: "10px",
                color: "var(--gray-400)",
                marginTop: "2px",
              }}
            >
              {p.order_id}
            </div>
          )}
        </td>
        <td style={{ fontWeight: 600 }}>
          {p.currency === "INR" ? "₹" : p.currency}{" "}
          {p.amount ? (p.amount / 100).toFixed(2) : "0.00"}
        </td>
        <td>
          <span
            className={`badge ${
              p.status === "Successful"
                ? "badge-green"
                : p.status === "failed"
                ? "badge-red"
                : "badge-amber"
            }`}
          >
            {fmt.cap(p.status)}
          </span>
        </td>
        <td
          style={{
            textTransform: "uppercase",
            color: "var(--gray-600)",
            fontSize: "11px",
            fontWeight: 500,
          }}
        >
          {p.method || "N/A"}
        </td>
        <td>
          <div style={{ color: "var(--gray-800)" }}>{p.email || "N/A"}</div>
          <div style={{ fontSize: "11px", color: "var(--gray-500)" }}>
            {p.contact || "N/A"}
          </div>
        </td>
        <td style={{ color: "var(--gray-600)" }}>{fmt.date(p.createdAt)}</td>
      </tr>
    ),
  },
};

const Pagination = ({ page, count, onPageChange }) => {
  const totalPages = Math.ceil(count / LIMIT) || 1;
  return (
    <div
      className="org-pagination-container"
      style={{
        padding: "16px",
        borderTop: "1px solid var(--gray-200)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span className="org-page-info">
        Page {page} of {totalPages}
      </span>
      <ReactPaginate
        breakLabel="..."
        nextLabel=">"
        onPageChange={(e) => onPageChange(e.selected + 1)}
        pageRangeDisplayed={3}
        marginPagesDisplayed={1}
        pageCount={totalPages}
        previousLabel="<"
        renderOnZeroPageCount={null}
        containerClassName="org-pagination"
        pageClassName="org-page-item"
        pageLinkClassName="org-page-btn"
        previousClassName="org-page-item"
        previousLinkClassName="org-page-btn"
        nextClassName="org-page-item"
        nextLinkClassName="org-page-btn"
        activeLinkClassName="active"
        breakClassName="org-page-item"
        breakLinkClassName="org-page-dots"
        disabledClassName="disabled"
        forcePage={page - 1}
      />
    </div>
  );
};

const TabTable = ({ tabKey, tabState, onPageChange }) => {
  const { data, count, page, loading } = tabState;
  const { columns, renderRow } = TAB_TABLE[tabKey];

  return (
    <div className="table-wrap">
      <div className="table-header">
        <span style={{ fontSize: "12px", fontWeight: 70 }}>
          {count} {TABS.find((t) => t.key === tabKey)?.label}
        </span>
      </div>

      {loading ? (
        <div
          style={{
            padding: "32px",
            textAlign: "center",
            color: "var(--gray-400)",
          }}
        >
          Loading...
        </div>
      ) : (
        <div className="table-responsive">
          <table className="org-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map(renderRow)
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{ textAlign: "center", color: "#9ca3af" }}
                  >
                    No {tabKey} found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} count={count} onPageChange={onPageChange} />
    </div>
  );
};

const initialTabState = TABS.reduce(
  (acc, { key }) => ({
    ...acc,
    [key]: { data: [], count: 0, page: 1, loading: false, fetched: false },
  }),
  {},
);

function tabReducer(state, { type, tab, payload }) {
  switch (type) {
    case "FETCH_START":
      return { ...state, [tab]: { ...state[tab], loading: true } };
    case "FETCH_SUCCESS":
      return {
        ...state,
        [tab]: {
          ...state[tab],
          data: payload.data,
          count: payload.count,
          loading: false,
          fetched: true,
        },
      };
    case "SET_PAGE":
      return { ...state, [tab]: { ...state[tab], page: payload } };
    default:
      return state;
  }
}

const ViewOrganisationDetail = ({ orgId, onBack }) => {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [tabs, dispatch] = useReducer(tabReducer, initialTabState);

  // Track in-flight requests so page changes don't stack
  const abortRefs = useRef({});

  // Fetch org details once on mount
  useEffect(() => {
    organizationById(orgId)
      .then((r) => setSelectedOrg(r.data))
      .finally(() => setOrgLoading(false));
  }, [orgId]);

  // Fetch a tab's data — memoized, abort-safe
  const fetchTab = useCallback(
    (tabKey, page) => {
      // Abort any prior in-flight call for this tab
      abortRefs.current[tabKey]?.abort();
      const controller = new AbortController();
      abortRefs.current[tabKey] = controller;

      const { fetchFn } = TABS.find((t) => t.key === tabKey);
      dispatch({ type: "FETCH_START", tab: tabKey });

      fetchFn(orgId, page, LIMIT, {}, { signal: controller.signal })
        .then((r) => {
          dispatch({
            type: "FETCH_SUCCESS",
            tab: tabKey,
            payload: { data: r.data?.data || [], count: r.data?.count || 0 },
          });
        })
        .catch((err) => {
          if (err?.name !== "AbortError") {
            dispatch({
              type: "FETCH_SUCCESS",
              tab: tabKey,
              payload: { data: [], count: 0 },
            });
          }
        });
    },
    [orgId],
  );

  useEffect(() => {
    const { page } = tabs[activeTab];
    fetchTab(activeTab, page);
  }, [activeTab, tabs[activeTab].page]);

  const handlePageChange = useCallback(
    (page) => {
      dispatch({ type: "SET_PAGE", tab: activeTab, payload: page });
    },
    [activeTab],
  );

  if (orgLoading) {
    return <div className="org-loading">Loading organisation details...</div>;
  }

  const isPaid = selectedOrg?.subscriptionPlan?.toLowerCase() === "paid";

  return (
    <PageContainer
      title="Organisation Details"
      sub="View organisation information"
    >
      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
          fontSize: "20px",
          color: "var(--gray-700)",
        }}
      >
        <button
          className="btn btn-secondary"
          style={{ height: "28px", fontSize: "11px", padding: "4px 10px" }}
          onClick={onBack}
        >
          ← Back
        </button>
        <span style={{ fontSize: "14px", color: "var(--gray-500)" }}>
          Organisations / {selectedOrg?.name || "Loading..."}
        </span>
      </div>

      {selectedOrg && (
        <>
          {/* Org header */}
          <div className="org-header">
            <div
              className="org-logo-lg"
              style={{ background: getColor(selectedOrg.name) }}
            >
              {getInitials(selectedOrg.name)}
            </div>
            <div className="meta">
              <h2>{selectedOrg.name}</h2>
              <div style={{ marginTop: "6px" }}>
                <span
                  className="badge badge-green"
                  style={{ marginRight: "6px" }}
                >
                  Active
                </span>
                <span
                  className={`badge ${isPaid ? "badge-blue" : "badge-amber"}`}
                >
                  {subscriptionPlan[selectedOrg.subscriptionPlan?.toUpperCase() || "N/A"]}
                </span>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="card-grid">
            <div className="stat-card">
              <div className="stat-label">Remaining Test Quota</div>
              <div className="stat-value">
                {selectedOrg.availableTests ?? "—"}
              </div>
              <div className="progress-bar" style={{ marginTop: "8px" }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(
                      ((selectedOrg.availableTests || 0) / (isPaid ? 100 : 20)) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Remaining Question Quota</div>
              <div className="stat-value">
                {selectedOrg.availableCustomQuestions ?? "—"}
              </div>
              <div className="progress-bar" style={{ marginTop: "8px" }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${isPaid ? Math.min(((selectedOrg.availableCustomQuestions || 0) / 20) * 100, 100) : 0}%`,
                    background: "var(--purple-600)",
                  }}
                />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Active Users</div>
              <div className="stat-value">{selectedOrg.noOfUsers ?? tabs.users.count}</div>
            </div>
          </div>
        </>
      )}

      {/* Tab bar — driven by TABS config */}
      <div className="tab-bar">
        {TABS.map(({ key, label }) => (
          <div
            key={key}
            className={`tab ${activeTab === key ? "active" : ""}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Single generic table for all tabs */}
      <TabTable
        tabKey={activeTab}
        tabState={tabs[activeTab]}
        onPageChange={handlePageChange}
      />
    </PageContainer>
  );
};

export default ViewOrganisationDetail;
