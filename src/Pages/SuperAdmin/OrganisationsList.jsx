import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PageContainer from "./PageContainer";
import { getAllOrganizations } from "../../Services/api";
import ReactPaginate from "react-paginate";
import "./OrganizationList.scss";
import ViewOrganisationDetail from "./ViewOrganisationDetail";
import { subscriptionPlan, subscriptionStatus } from "../../utils/constants";

//  Helpers
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

const OrganisationsList = () => {
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const location = useLocation();
  const [planFilter, setPlanFilter] = useState("All Plans");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  useEffect(() => {
    setSelectedOrgId(null);
  }, [location.key]);

  const limit = 10;
  const totalPages = Math.ceil(count / limit);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await getAllOrganizations(page, limit, {
        name: search,
        subscriptionPlan: planFilter === "All Plans" ? undefined : planFilter,
        subscriptionStatus:
          statusFilter === "All Statuses" ? undefined : statusFilter,
      });
      const { data, count } = response.data;
      setOrganizations(data);
      setCount(count);
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      2;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchOrganizations();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [page, search, planFilter]);

  if (selectedOrgId) {
    return (
      <ViewOrganisationDetail
        orgId={selectedOrgId}
        onBack={() => setSelectedOrgId(null)}
      />
    );
  }

  const handlePageClick = (event) => {
    setPage(event.selected + 1);
  };

  const filteredOrganizations = organizations.filter((org) => {
    const planMatch =
      planFilter === "All Plans" || org.subscriptionPlan === planFilter;

    const statusMatch =
      statusFilter === "All Statuses" ||
      org.subscriptionStatus === statusFilter;

    return planMatch && statusMatch;
  });

  return (
    <PageContainer
      title="Organisations"
      sub="Manage all registered organisations">
      <div className="toolbar">
        <div className="search-box">
          <input
            placeholder="Search by Organization Name"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
        <select
          className="input-field"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}>
          <option>All Plans</option>
          <option value="paid">Paid</option>
          <option value="free">Free</option>
        </select>

        <div style={{ flex: 1 }}></div>
        {/* <button className="btn btn-primary">Add Organisation</button> */}
      </div>

      <div className="table-wrap">
        <div className="table-header">
          <span style={{ fontSize: "12px", color: "var(--gray-400)" }}>
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, count)} of{" "}
            {count.toLocaleString()} results
          </span>
          {/* <button
            className="btn btn-secondary"
            style={{ fontSize: "11px", height: "28px" }}
          >
            Export
          </button> */}
        </div>

        {loading ? (
          <div className="org-loading">Loading...</div>
        ) : (
          <table className="org-table">
            <thead>
              <tr>
                <th>Organisation</th>
                <th>Plan</th>
                <th>Users</th>
                <th>Remaining Tests</th>
                <th>Remaining Questions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrganizations.map((org) => {
                const maxTests = org.subscriptionPlan?.toLowerCase() === "paid" ? 100 : 20;
                const testPercent = Math.min(((org.availableTests || 0) / maxTests) * 100, 100);
                const maxQuestions = org.subscriptionPlan?.toLowerCase() === "paid" ? 20 : 0;
                const questionPercent = maxQuestions > 0 ? Math.min(((org.availableCustomQuestions || 0) / maxQuestions) * 100, 100) : 0;
                return (
                  <tr key={org._id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}>
                        <div
                          className="org-logo"
                          style={{ background: getColor(org.name) }}>
                          {getInitials(org.name)}
                        </div>
                        <div>
                          <div
                            style={{
                              color: "var(--gray-900)",
                              fontSize: "13px",
                            }}>
                            {org.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          org.subscriptionPlan?.toLowerCase() === "paid"
                            ? "badge-blue"
                            : "badge-amber"
                        }`}>
                        {
                          subscriptionPlan[
                            org.subscriptionPlan?.toUpperCase() || "N/A"
                          ]
                        }
                      </span>
                    </td>
                    <td>{org.noOfUsers ?? "—"}</td>
                    <td>
                      <div>{org.availableTests ?? "—"}</div>
                      <div className="progress-bar" style={{ width: "80px" }}>
                        <div
                          className="progress-fill"
                          style={{ width: `${testPercent}%` }}
                        />
                      </div>
                    </td>
                    <td>
                      <div>{org.availableCustomQuestions ?? "—"}</div>
                      <div className="progress-bar" style={{ width: "80px" }}>
                        <div
                          className="progress-fill"
                          style={{
                            width: `${questionPercent}%`,
                            background: "var(--purple-600)",
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{
                          height: "26px",
                          fontSize: "11px",
                          padding: "4px 10px",
                        }}
                        onClick={() => setSelectedOrgId(org._id)}>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="org-pagination-container">
          <span className="org-page-info">
            Page {page} of {totalPages}
          </span>
          <ReactPaginate
            breakLabel="..."
            nextLabel=">"
            onPageChange={handlePageClick}
            pageRangeDisplayed={3}
            marginPagesDisplayed={1}
            pageCount={totalPages || 1}
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
      </div>
    </PageContainer>
  );
};

export default OrganisationsList;
