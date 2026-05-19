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
      <button className="org-back-btn" onClick={onBack}>
        ← Back to Organisations
      </button>

      {selectedOrg && (
        <div className="org-detail-card">
          <div className="org-detail-header">
            <div
              className="org-avatar large"
              style={{ background: getColor(selectedOrg.name) }}
            >
              {getInitials(selectedOrg.name)}
            </div>
            <div>
              <div className="org-detail-name">{selectedOrg.name}</div>
            </div>
          </div>
          <div className="org-detail-stats">
            <div>
              <div className="org-detail-stat-label">Plan</div>
              <div className="org-detail-stat-value">
                {selectedOrg.subscriptionPlan || "N/A"}
              </div>
            </div>
            <div
              style={{ cursor: "pointer" }}
              onClick={() => setActiveTab("users")}
            >
              <div className="org-detail-stat-label">Users</div>
              <div
                className="org-detail-stat-value"
                style={{ color: activeTab === "users" ? "#2563eb" : "#111827" }}
              >
                {users.length}
              </div>
            </div>
            <div
              style={{ cursor: "pointer" }}
              onClick={() => setActiveTab("questions")}
            >
              <div className="org-detail-stat-label">Questions</div>
              <div
                className="org-detail-stat-value"
                style={{
                  color: activeTab === "questions" ? "#2563eb" : "#111827",
                }}
              >
                {questionsCount}
              </div>
            </div>
            <div
              style={{ cursor: "pointer" }}
              onClick={() => setActiveTab("tests")}
            >
              <div className="org-detail-stat-label">Tests</div>
              <div
                className="org-detail-stat-value"
                style={{ color: activeTab === "tests" ? "#2563eb" : "#111827" }}
              >
                {testsCount}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {activeTab === "users" && (
        <div className="org-table-card" style={{ marginBottom: 20 }}>
          <div className="org-table-meta">
            <span>Users ({users.length})</span>
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
                    <td>{u.name || "N/A"}</td>
                    <td>{u.emailId || u.email || "N/A"}</td>
                    <td>
                      <span className={`plan-badge ${getPlanClass(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          u.status === 1 ? "status-active" : "status-suspended"
                        }
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
        <div className="org-table-card" style={{ marginBottom: 20 }}>
          <div className="org-table-meta">
            <span>Questions ({questionsCount})</span>
          </div>
          <table className="org-table">
            <thead>
              <tr>
                <th>Title</th>
              </tr>
            </thead>
            <tbody>
              {questions.length > 0 ? (
                questions.map((q) => (
                  <tr key={q._id}>
                    <td>{q.title || q.question || "N/A"}</td>
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
        <div className="org-table-card">
          <div className="org-table-meta">
            <span>Tests ({testsCount})</span>
          </div>
          <table className="org-table">
            <thead>
              <tr>
                <th>Title</th>
              </tr>
            </thead>
            <tbody>
              {tests.length > 0 ? (
                tests.map((t) => (
                  <tr key={t._id}>
                    <td>{t.title || t.name || "N/A"}</td>
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

      {!activeTab && (
        <div
          style={{
            textAlign: "center",
            color: "#9ca3af",
            padding: "30px",
            background: "#fff",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
          }}
        >
          Click on Users, Questions, or Tests above to view details
        </div>
      )}
    </PageContainer>
  );
};

export default ViewOrganisationDetail;
