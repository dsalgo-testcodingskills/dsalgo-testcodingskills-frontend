import React, { useEffect, useState } from "react";
import PageContainer from "./PageContainer";
import { getAllPayments } from "../../Services/api";
import ReactPaginate from "react-paginate";
import "./OrganizationList.scss";

const avatarColors = [
  "#7c3aed",
  "#2563eb",
  "#059669",
  "#d97706",
  "#dc2626",
  "#0891b2",
];
const getColor = (name) =>
  avatarColors[name?.charCodeAt(0) % avatarColors.length] || "#7c3aed";
const getInitials = (name) =>
  name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

const fmt = {
  date: (v) => {
    if (!v) return "N/A";
    const d = new Date(v);
    return `${d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}, ${d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  },
  cap: (v) => (v ? v.charAt(0).toUpperCase() + v.slice(1) : "N/A"),
};

const GlobalOrders = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const limit = 10;
  const totalPages = Math.ceil(count / limit) || 1;

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // getAllPayments expects (page, limit, filter)
      const response = await getAllPayments(page, limit, { name: search, fromDate, toDate });
      const { data, count } = response.data;
      setPayments(data || []);
      setCount(count || 0);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPayments();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [page, search, fromDate, toDate]);

  const handlePageClick = (event) => {
    setPage(event.selected + 1);
  };

  return (
    <PageContainer
      title="Orders & Transactions"
      sub="All payments across the platform"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "12px",
        }}
      >
        <button className="btn btn-primary" style={{ height: "34px" }}>
          <i className="ti ti-download" style={{ fontSize: "13px" }}></i>Export
          Report
        </button>
      </div>

      <div className="card-grid-4">
        <div className="stat-card">
          <div className="stat-label">TOTAL REVENUE</div>
          <div className="stat-value">₹94.2L</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">SUCCESSFUL</div>
          <div className="stat-value" style={{ color: "#16A34A" }}>
            8,412
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">FAILED</div>
          <div className="stat-value" style={{ color: "#DC2626" }}>
            142
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">IN-PROGRESS</div>
          <div className="stat-value" style={{ color: "#3B82F6" }}>
            38
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div
          className="search-box"
          style={{
            width: "220px",
            background: "#fff",
            border: "0.5px solid var(--gray-200)",
          }}
        >
          <i
            className="ti ti-search"
            style={{ color: "var(--gray-400)", fontSize: "14px" }}
            aria-hidden="true"
          ></i>
          <input
            placeholder="Search order"
            style={{ fontSize: "12px" }}
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
        <input
          type="date"
          className="input-field"
          style={{ fontSize: "12px" }}
          value={fromDate}
          onChange={(e) => {
            setPage(1);
            setFromDate(e.target.value);
          }}
        />
        <span style={{ fontSize: "12px", color: "var(--gray-400)" }}>to</span>
        <input
          type="date"
          className="input-field"
          style={{ fontSize: "12px" }}
          value={toDate}
          onChange={(e) => {
            setPage(1);
            setToDate(e.target.value);
          }}
        />
      </div>

      <div className="table-wrap">
        <div className="table-header">
          <span style={{ fontSize: "12px", color: "var(--gray-400)" }}>
            Showing {count > 0 ? (page - 1) * limit + 1 : 0}–
            {Math.min(page * limit, count)} of {count.toLocaleString()}{" "}
            transactions
          </span>
        </div>

        {loading ? (
          <div className="org-loading">Loading...</div>
        ) : (
          <table className="org-table">
            <thead>
              <tr>
                <th>Organisation</th>
                <th>Razorpay Order ID</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((p) => {
                  const orgName = p.notes?.organizationId?.name || "Unknown";
                  let desc = [];
                  if (p.notes?.type) desc.push(fmt.cap(p.notes.type));
                  if (p.notes?.itemType) desc.push(fmt.cap(p.notes.itemType));
                  if (desc.length === 0) desc.push("Payment");

                  return (
                    <tr key={p._id}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <div
                            className="org-logo"
                            style={{
                              background: getColor(orgName),
                              width: "20px",
                              height: "20px",
                              fontSize: "8px",
                            }}
                          >
                            {getInitials(orgName)}
                          </div>
                          <div
                            style={{
                              fontWeight: 500,
                              color: "var(--gray-900)",
                              fontSize: "13px",
                            }}
                          >
                            {orgName}
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          fontFamily: "monospace",
                          fontSize: "11px",
                          color: "var(--gray-500)",
                        }}
                      >
                        {p.order_id || p.id || "N/A"}
                      </td>
                      <td style={{ color: "var(--gray-600)" }}>
                        {desc.join(" ")}
                      </td>
                      <td style={{ fontWeight: 500 }}>
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
                              : "badge-blue"
                          }`}
                        >
                          {fmt.cap(p.status)}
                        </span>
                      </td>
                      <td
                        style={{ color: "var(--gray-400)", fontSize: "11px" }}
                      >
                        {fmt.date(p.createdAt)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", color: "#9ca3af" }}
                  >
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {count > 0 && (
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
        )}
      </div>
    </PageContainer>
  );
};

export default GlobalOrders;
