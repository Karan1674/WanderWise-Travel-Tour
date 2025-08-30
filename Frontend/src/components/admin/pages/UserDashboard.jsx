import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';


function UserDashboard() {
  const { userType } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!['admin'].includes(userType)) {
      navigate('/');
    }
  }, [userType, navigate]);

  return (
    <div className="db-info-wrap" style={{ minHeight: '100vh', padding: '2rem' }}>
      <div className="row row-cols-xxl-4 row-cols-lg-3 row-cols-md-2 row-cols-1 g-4" style={{ marginTop: '60px' }}>
        <div className="col mb-4">
          <Link to="/db-admin-created-agents" className="text-decoration-none">
            <div
              className="card h-100"
              style={{
                transition: 'all 0.3s ease',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#fff',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="d-flex">
                <div
                  style={{
                    width: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#10b981',
                  }}
                >
                  <i className="fa fa-user-plus fa-2x text-white" aria-hidden="true"></i>
                </div>
                <div style={{ padding: '1.5rem', flex: 1 }}>
                  <h4
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: '#1f2937',
                      margin: '0 0 0.5rem',
                    }}
                  >
                    Admin Agents
                  </h4>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    List of agents created by admin
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
        <div className="col mb-4">
          <Link to="/db-signed-in-users" className="text-decoration-none">
            <div
              className="card h-100"
              style={{
                transition: 'all 0.3s ease',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#fff',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="d-flex">
                <div
                  style={{
                    width: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#6b7280',
                  }}
                >
                  <i className="fa fa-users fa-2x text-white" aria-hidden="true"></i>
                </div>
                <div style={{ padding: '1.5rem', flex: 1 }}>
                  <h4
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: '#1f2937',
                      margin: '0 0 0.5rem',
                    }}
                  >
                    Signed Up Users
                  </h4>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    List of users who signed up
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
