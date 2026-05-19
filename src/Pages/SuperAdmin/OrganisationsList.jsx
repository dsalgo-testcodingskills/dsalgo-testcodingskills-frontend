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
      <div className="org-toolbar">
        <input
          className="org-search"
          placeholder="Search by name or email..."
        />
        <select className="org-select">
          <option>All Plans</option>
          <option>Paid</option>
          <option>Free</option>
        </select>

        <button className="org-btn-add">+ Add Organisation</button>
      </div>

      <div className="org-table-card">
        <div className="org-table-meta">
          <span>
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, count)} of{" "}
            {count.toLocaleString()} results
          </span>
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
                  <td>
                    <div className="org-name-cell">
                      <div
                        className="org-avatar"
                        style={{ background: getColor(org.name) }}
                      >
                        {getInitials(org.name)}
                      </div>
                      <div className="org-name-info">
                        <span className="org-name-text">{org.name}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`plan-badge ${getPlanClass(
                        org.subscriptionPlan,
                      )}`}
                    >
                      {org.subscriptionPlan || "N/A"}
                    </span>
                  </td>
                  <td>{org.noOfUsers ?? "—"}</td>
                  <td>
                    <div className="progress-wrap">
                      <span className="progress-num">
                        {org.availableTests ?? "—"}
                      </span>
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${Math.min(
                              (org.availableTests / 1500) * 100,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  <td>
                    <button
                      className="org-view-btn"
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
