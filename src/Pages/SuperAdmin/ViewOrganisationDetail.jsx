import { useEffect, useState } from "react";
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

const ViewOrganisationDetail = ({ orgId, onBack }) => {
  const avatarColors = [
    "#7c3aed",
    "#2563eb",
    "#059669",
    "#d97706",
    "#dc2626",
    "#0891b2",
  ];
  const getColor = (name) =>
    avatarColors[name?.charCodeAt(0) % avatarColors.length];
  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const [selectedOrg, setSelectedOrg] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [questionsPage, setQuestionsPage] = useState(1);
  const [tests, setTests] = useState([]);
  const [testsCount, setTestsCount] = useState(0);
  const [testsPage, setTestsPage] = useState(1);
  const [subscription, setSubscription] = useState([]);
  const [subscriptionCount, setSubscriptionCount] = useState(0);
  const [subscriptionPage, setSubscriptionPage] = useState(1);
  const [payment, setPayment] = useState([]);
  const [paymentCount, setPaymentCount] = useState(0);
  const [paymentPage, setPaymentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  const limit = 10;

  useEffect(() => {
    organizationById(orgId)
      .then((r) => setSelectedOrg(r.data))
      .finally(() => setLoading(false));
  }, [orgId]);

  useEffect(() => {
    organizationByUser(orgId, usersPage, limit, {}).then((r) => {
      setUsers(r.data?.data || []);
      setUsersCount(r.data?.count || 0);
    });
  }, [orgId, usersPage]);

  useEffect(() => {
    organizationQuestions(orgId, questionsPage, limit, {}).then((r) => {
      setQuestions(r.data?.data || []);
      setQuestionsCount(r.data?.count || 0);
    });
  }, [orgId, questionsPage]);

  useEffect(() => {
    organizationTests(orgId, testsPage, limit, {}).then((r) => {
      setTests(r.data?.data || []);
      setTestsCount(r.data?.count || 0);
    });
  }, [orgId, testsPage]);

  useEffect(() => {
    organisationSubscription(orgId, subscriptionPage, limit, {}).then((r) => {
      setSubscription(r.data?.data || []);
      setSubscriptionCount(r.data?.count || 0);
    });
  }, [orgId, subscriptionPage]);

  useEffect(() => {
    organizationPayment(orgId, paymentPage, limit, {}).then((r) => {
      setPayment(r.data?.data || []);
      setPaymentCount(r.data?.count || 0);
    });
  }, [orgId, paymentPage]);

  const Pagination = ({ page, count, onPageChange }) => {
    const totalPages = Math.ceil(count / limit) || 1;
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

  if (loading)
    return <div className="org-loading">Loading organisation details...</div>;

  return (
    <PageContainer
      title="Organisation Details"
      sub="View organisation information"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <button
          className="btn btn-secondary"
          style={{ height: "28px", fontSize: "11px", padding: "4px 10px" }}
          onClick={onBack}
        >
          ← Back
        </button>
        <span style={{ fontSize: "11px", color: "var(--gray-400)" }}>
          Organisations / {selectedOrg?.name || "Loading..."}
        </span>
      </div>

      {selectedOrg && (
        <>
          <div className="org-header">
            <div
              className="org-logo-lg"
              style={{ background: getColor(selectedOrg.name) }}
            >
              {getInitials(selectedOrg.name)}
            </div>
            <div className="meta">
              <h2>{selectedOrg.name}</h2>
              <p>{selectedOrg.email || "N/A"}</p>
              <div style={{ marginTop: "6px" }}>
                <span
                  className="badge badge-green"
                  style={{ marginRight: "6px" }}
                >
                  Active
                </span>
                <span
                  className={`badge ${
                    selectedOrg.subscriptionPlan?.toLowerCase() === "paid"
                      ? "badge-blue"
                      : "badge-amber"
                  }`}
                >
                  {selectedOrg.subscriptionPlan?.toUpperCase() || "N/A"}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="actions-btn">Edit</button>
              <button className="actions-btn" style={{ color: "#DC2626" }}>
                Suspend
              </button>
            </div>
          </div>

          <div className="card-grid">
            <div className="stat-card">
              <div className="stat-label">REMAINING TEST QUOTA</div>
              <div className="stat-value">
                {selectedOrg.availableTests ?? "—"}
              </div>
              <div className="progress-bar" style={{ marginTop: "8px" }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(
                      ((selectedOrg.availableTests || 0) / 1500) * 100,
                      100,
                    )}%`,
                  }}
                ></div>
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "var(--gray-400)",
                  marginTop: "4px",
                }}
              >
                {Math.round(((selectedOrg.availableTests || 0) / 1500) * 100)}%
                of 1500 used
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">TOTAL ACTIVE USERS</div>
              <div className="stat-value">{usersCount}</div>
              <div className="stat-sub">Users in organisation</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">SUBSCRIPTION TIER</div>
              <div
                className="stat-value"
                style={{ fontSize: "17px", marginTop: "4px" }}
              >
                <span
                  className={`badge ${
                    selectedOrg.subscriptionPlan?.toLowerCase() === "paid"
                      ? "badge-blue"
                      : "badge-amber"
                  }`}
                  style={{ fontSize: "13px", padding: "4px 12px" }}
                >
                  {selectedOrg.subscriptionPlan?.toUpperCase() || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="tab-bar">
        <div
          className={`tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </div>
        <div
          className={`tab ${activeTab === "questions" ? "active" : ""}`}
          onClick={() => setActiveTab("questions")}
        >
          Questions
        </div>
        <div
          className={`tab ${activeTab === "tests" ? "active" : ""}`}
          onClick={() => setActiveTab("tests")}
        >
          Tests
        </div>
        <div
          className={`tab ${activeTab === "subscription" ? "active" : ""}`}
          onClick={() => setActiveTab("subscription")}
        >
          subscription
        </div>
        <div
          className={`tab ${activeTab === "payment" ? "active" : ""}`}
          onClick={() => setActiveTab("payment")}
        >
          Payments
        </div>
      </div>

      {/* Users */}
      {activeTab === "users" && (
        <div className="table-wrap">
          <div className="table-header">
            <span style={{ fontSize: "12px", fontWeight: 500 }}>
              {usersCount} Users
            </span>
          </div>
          <table className="org-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 500 }}>{u.name || "N/A"}</td>
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
                        className={`badge ${
                          u.status === 1 ? "badge-green" : "badge-red"
                        }`}
                      >
                        {u.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    style={{ textAlign: "center", color: "#9ca3af" }}
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            page={usersPage}
            count={usersCount}
            onPageChange={setUsersPage}
          />
        </div>
      )}

      {/* Questions */}
      {activeTab === "questions" && (
        <div className="table-wrap">
          <div className="table-header">
            <span style={{ fontSize: "12px", fontWeight: 500 }}>
              {questionsCount} Questions
            </span>
          </div>
          <table className="org-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Level</th>
                <th>Sample</th>
                <th>Public</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {questions.length > 0 ? (
                questions.map((q) => (
                  <tr key={q._id}>
                    <td
                      style={{
                        maxWidth: "300px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: "var(--gray-700)",
                        fontWeight: 500,
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
                        {q.level
                          ? q.level.charAt(0).toUpperCase() + q.level.slice(1)
                          : "N/A"}
                      </span>
                    </td>
                    <td>{q.sampleQuestion ? "Yes" : "No"}</td>
                    <td>{q.public ? "Yes" : "No"}</td>
                    <td style={{ color: "var(--gray-600)" }}>
                      {q.createdAt
                        ? new Date(q.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: "center", color: "#9ca3af" }}
                  >
                    No questions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            page={questionsPage}
            count={questionsCount}
            onPageChange={setQuestionsPage}
          />
        </div>
      )}

      {/* Tests */}
      {activeTab === "tests" && (
        <div className="table-wrap">
          <div className="table-header">
            <span style={{ fontSize: "12px", fontWeight: 500 }}>
              {testsCount} Tests Created
            </span>
          </div>
          <table className="org-table">
            <thead>
              <tr>
                <th>Student Details</th>
                <th>Status</th>
                <th>Test Type</th>
                <th>Duration</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {tests.length > 0 ? (
                tests.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div
                        style={{ fontWeight: 500, color: "var(--gray-800)" }}
                      >
                        {t.studentName || "N/A"}
                      </div>
                      <div
                        style={{ fontSize: "11px", color: "var(--gray-500)" }}
                      >
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
                        {t.status
                          ? t.status.charAt(0).toUpperCase() + t.status.slice(1)
                          : "N/A"}
                      </span>
                    </td>
                    <td style={{ color: "var(--gray-600)" }}>
                      {t.TestType || "N/A"}
                    </td>
                    <td style={{ color: "var(--gray-600)" }}>
                      {t.testDuration ? `${t.testDuration} mins` : "N/A"}
                    </td>
                    <td style={{ color: "var(--gray-600)", fontSize: "12px" }}>
                      {t.startDate
                        ? new Date(t.startDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: "center", color: "#9ca3af" }}
                  >
                    No tests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            page={testsPage}
            count={testsCount}
            onPageChange={setTestsPage}
          />
        </div>
      )}

      {activeTab === "subscription" && (
        <div className="table-wrap">
          <div className="table-header">
            <span style={{ fontSize: "12px", fontWeight: 500 }}>
              {subscriptionCount} Subscription
            </span>
          </div>
          <table className="org-table">
            <thead>
              <tr>
                <th>Subscription ID</th>
                <th>Plan ID</th>
                <th>Status</th>
                <th>Payment Method</th>
                <th>Counts (Total/Paid/Rem)</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {subscription.length > 0 ? (
                subscription.map((s) => (
                  <tr key={s._id}>
                    <td style={{ color: "var(--gray-700)", fontWeight: 500 }}>
                      {s.id || "N/A"}
                    </td>
                    <td style={{ color: "var(--gray-600)" }}>
                      {s.plan_id || "N/A"}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          s.status === "active" ? "badge-green" : "badge-amber"
                        }`}
                      >
                        {s.status ? s.status.toUpperCase() : "N/A"}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          textTransform: "uppercase",
                          color: "var(--gray-600)",
                          fontSize: "11px",
                          fontWeight: 500,
                        }}
                      >
                        {s.payment_method || "N/A"}
                      </span>
                    </td>
                    <td style={{ color: "var(--gray-600)" }}>
                      {s.total_count ?? 0} / {s.paid_count ?? 0} /{" "}
                      {s.remaining_count ?? 0}
                    </td>
                    <td style={{ color: "var(--gray-600)" }}>
                      {s.createdAt
                        ? new Date(s.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", color: "#9ca3af" }}
                  >
                    No subscription found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            page={subscriptionPage}
            count={subscriptionCount}
            onPageChange={setSubscriptionPage}
          />
        </div>
      )}

      {/* Payment Tab */}
      {activeTab === "payment" && (
        <div className="table-wrap">
          <div className="table-header">
            <span style={{ fontSize: "12px", fontWeight: 500 }}>
              {paymentCount} Payments
            </span>
          </div>
          <div className="table-responsive">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Payment ID / Order ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Contact</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payment.length > 0 ? (
                  payment.map((p) => (
                    <tr key={p._id}>
                      <td
                        style={{
                          color: "var(--gray-700)",
                          fontWeight: 500,
                          fontSize: "11px",
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
                            p.status === "captured"
                              ? "badge-green"
                              : p.status === "failed"
                              ? "badge-red"
                              : "badge-amber"
                          }`}
                        >
                          {p.status
                            ? p.status.charAt(0).toUpperCase() +
                              p.status.slice(1)
                            : "N/A"}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            textTransform: "uppercase",
                            color: "var(--gray-600)",
                            fontSize: "11px",
                            fontWeight: 500,
                          }}
                        >
                          {p.method || "N/A"}
                        </span>
                      </td>
                      <td>
                        <div style={{ color: "var(--gray-800)" }}>
                          {p.email || "N/A"}
                        </div>
                        <div
                          style={{ fontSize: "11px", color: "var(--gray-500)" }}
                        >
                          {p.contact || "N/A"}
                        </div>
                      </td>
                      <td style={{ color: "var(--gray-600)" }}>
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ textAlign: "center", color: "#9ca3af" }}
                    >
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={paymentPage}
            count={paymentCount}
            onPageChange={setPaymentPage}
          />
        </div>
      )}
    </PageContainer>
  );
};

export default ViewOrganisationDetail;
