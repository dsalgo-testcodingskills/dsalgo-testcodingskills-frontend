import { useEffect, useState } from "react";
import PageContainer from "./PageContainer";
import {
  organizationById,
  organizationByUser,
  organizationQuestions,
  organizationTests,
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

  const getPlanClass = (plan) => {
    const map = { Free: "free", paid: "paid" };
    return map[plan] || "free";
  };

  const [selectedOrg, setSelectedOrg] = useState(null);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [tests, setTests] = useState([]);
  const [testsCount, setTestsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        await Promise.all([
          organizationById(orgId).then((r) => setSelectedOrg(r.data)),
          organizationByUser(orgId, 1, 10, {}).then((r) =>
            setUsers(r.data?.data || []),
          ),
          organizationQuestions(orgId, 1, 10, {}).then((r) => {
            setQuestions(r.data?.data || []);
            setQuestionsCount(r.data?.count || 0);
          }),
          organizationTests(orgId, 1, 10, {}).then((r) => {
            setTests(r.data?.data || []);
            setTestsCount(r.data?.count || 0);
          }),
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [orgId]);

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
              <div className="stat-value">{users.length}</div>
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
      </div>

      {/* Users */}
      {activeTab === "users" && (
        <div className="table-wrap">
          <div className="table-header">
            <span style={{ fontSize: "12px", fontWeight: 500 }}>
              {users.length} Users
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
                <th>Question (Preview)</th>
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
                      }}
                    >
                      {q.title || q.question || "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={{ textAlign: "center", color: "#9ca3af" }}>
                    No questions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                <th>Test Name / Student</th>
              </tr>
            </thead>
            <tbody>
              {tests.length > 0 ? (
                tests.map((t) => (
                  <tr key={t._id}>
                    <td style={{ fontWeight: 500 }}>
                      {t?.studentName || "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={{ textAlign: "center", color: "#9ca3af" }}>
                    No tests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
};

export default ViewOrganisationDetail;
