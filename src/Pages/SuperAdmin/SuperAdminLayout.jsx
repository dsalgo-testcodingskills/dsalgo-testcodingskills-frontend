import React from "react";
import { NavLink, useHistory } from "react-router-dom";
import "../../assets/styles/super-admin.scss";

const SuperAdminLayout = ({ children }) => {
  const history = useHistory();

  return (
    <div className="super-admin-layout">
      <div className="sa-sidebar">
        <div className="sa-logo">AssessHub Admin</div>
        <ul className="sa-nav">
          <NavLink to="/super-admin/dashboard" activeClassName="active">
            <li>
              <i className="fas fa-tachometer-alt"></i> Dashboard
            </li>
          </NavLink>
          <NavLink to="/super-admin/organisations" activeClassName="active">
            <li>
              <i className="fas fa-building"></i> Organisations
            </li>
          </NavLink>
          <NavLink to="/super-admin/orders" activeClassName="active">
            <li>
              <i className="fas fa-receipt"></i> Global Orders
            </li>
          </NavLink>
          <li onClick={() => history.push("/")}>
            <i className="fas fa-arrow-left"></i> Back to Platform
          </li>
        </ul>
      </div>
      <div className="sa-content">{children}</div>
    </div>
  );
};

export default SuperAdminLayout;
