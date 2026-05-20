import React, { useEffect, useState } from "react";
import PageContainer from "./PageContainer";
import { getAllOrganizations } from "../../Services/api";
import ReactPaginate from "react-paginate";
import "./OrganizationList.scss";
import ViewOrganisationDetail from "./ViewOrganisationDetail";

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

const getPlanClass = (plan) => {
  const map = { Free: "free", paid: "paid" };
  return map[plan] || "free";
};

const OrganisationsList = () => {
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedOrgId, setSelectedOrgId] = useState(null);

  const limit = 10;
  const totalPages = Math.ceil(count / limit);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await getAllOrganizations(page, limit, {});
      const { data, count } = response.data;
      setOrganizations(data);
      setCount(count);
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [page]);

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

  return (
    <PageContainer
      title="Organisations"
      sub="Manage all registered organisations"
    >
      <div className="toolbar">
        <div className="search-box">
          <input placeholder="Search by name or email..." />
        </div>
        <select className="input-field">
          <option>All Plans</option>
          <option>Paid</option>
          <option>Free</option>
        </select>
        <select className="input-field">
          <option>All Statuses</option>
          <option>Active</option>
          <option>Suspended</option>
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
                <th>Tests Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org._id}>
                  {" "}
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        className="org-logo"
                        style={{ background: getColor(org.name) }}
                      >
                        {getInitials(org.name)}
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 500,
                            color: "var(--gray-900)",
                            fontSize: "13px",
                          }}
                        >
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
                      }`}
                    >
                      {org.subscriptionPlan?.toUpperCase() || "N/A"}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{org.noOfUsers ?? "—"}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>
                      {org.availableTests ?? "—"}
                    </div>
                    <div className="progress-bar" style={{ width: "80px" }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(
                            ((org.availableTests || 0) / 1500) * 100,
                            100,
                          )}%`,
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
                      onClick={() => setSelectedOrgId(org._id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
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
