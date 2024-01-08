import React from 'react';
import { useHistory } from 'react-router-dom';

function Dashboard() {
  const history = useHistory();

  return (
    <div className="container d-flex justify-content-evenly flex-wrap mt-5">
      <div className="card my-3" style={{ width: '18rem' }}>
        <img src="/images/createtest.png" className="card-img-top" alt="..." />
        <div className="card-body">
          <h5 className="card-title">Create Test</h5>
          <p className="card-text mb-3">
            Create Test invites and send to the students.Here you have to just
            write the students email and number of questions
          </p>
          <div className="container d-flex justify-content-center">
            <button
              className="btn btn-secondary"
              onClick={() => {
                history.push('/admin/createTest');
              }}
            >
              Create Test
            </button>
          </div>
        </div>
      </div>

      <div className="card my-3" style={{ width: '18rem' }}>
        <img
          src="/images/testStatus.png"
          className="card-img-top"
          alt="Test status"
        />
        <div className="card-body">
          <h5 className="card-title">Test Status</h5>
          <p className="card-text mb-3">
            All the test invites sent by you will display here.you can review it
          </p>
          <div className="container d-flex justify-content-center">
            <button
              className="btn btn-secondary"
              onClick={() => {
                history.push('/admin/testStatus');
              }}
            >
              Check Test Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
