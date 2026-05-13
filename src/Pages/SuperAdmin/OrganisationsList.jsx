import React, { useEffect, useState } from 'react';
import PageContainer from './PageContainer';
// import { getAllOrganisations } from '../../Services/superAdminService';

const OrganisationsList = () => {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetchOrgs();
  }, []);

  // const fetchOrgs = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await getAllOrganisations();
  //     setOrgs(response.data);
  //   } catch (error) {
  //     console.error('Error fetching orgs:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <PageContainer title="Organisations" sub="Manage all registered organisations">
      <div className="toolbar" style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <input className="input-field" placeholder="Search by name or email…" style={{ width: '220px' }} />
        <select className="input-field"><option>All Plans</option></select>
        <select className="input-field"><option>All Statuses</option></select>
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }}>+ Add Organisation</button>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Organisation</th>
                <th>Owner Email</th>
                <th>Plan</th>
                <th>Users</th>
                <th>Tests</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map(org => (
                <tr key={org._id}>
                  <td>
                    <div className="org-logo" style={{ background: '#7C3AED', display: 'inline-flex', marginRight: '8px' }}>
                      {org.name.charAt(0)}
                    </div>
                    {org.name}
                  </td>
                  <td>{org.ownerEmail || 'N/A'}</td>
                  <td><span className="badge badge-purple">{org.subscriptionPlan}</span></td>
                  <td>{org.noOfUsers}</td>
                  <td>{org.availableTests}</td>
                  <td><span className="badge badge-green">Active</span></td>
                  <td><button className="btn btn-secondary">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageContainer>
  );
};

export default OrganisationsList;
