import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function EnquiryDashboard() {
  const { user, userType } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if (!['admin', 'agent'].includes(userType)) {
    toast.error('Unauthorized access');
    navigate('/');
    return null;
  }

  if (!user) {
    toast.error('User not found');
    navigate('/login');
    return null;
  }

  return (

        <div className="db-info-wrap" style={{ minHeight: '100vh', padding: '2rem' }}>
          <div style={{ marginTop: '60px' }} className="row row-cols-xxl-4 row-cols-lg-3 row-cols-md-2 row-cols-1 g-4">
            <div className="col mb-4">
              <Link to="/faq-enquiry" className="text-decoration-none">
                <div className="card-wrapper d-flex" style={{ transition: 'all 0.3s ease', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: '#fff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                  <div className="card-icon green" style={{ width: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10b981' }}>
                    <i className="fa fa-question-circle" aria-hidden="true" style={{ fontSize: '2.5rem', color: '#fff' }}></i>
                  </div>
                  <div className="card-content" style={{ padding: '1.5rem', flex: 1 }}>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', margin: '0 0 0.5rem' }}>FAQ Enquiries</h4>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>List of FAQ-related enquiries</span>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col mb-4">
              <Link to="/contact-enquiry" className="text-decoration-none">
                <div className="card-wrapper d-flex" style={{ transition: 'all 0.3s ease', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: '#fff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                  <div className="card-icon" style={{ width: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#6b7280' }}>
                    <i className="fa fa-envelope" aria-hidden="true" style={{ fontSize: '2.5rem', color: '#fff' }}></i>
                  </div>
                  <div className="card-content" style={{ padding: '1.5rem', flex: 1 }}>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', margin: '0 0 0.5rem' }}>Contact Enquiries</h4>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>List of contact-related enquiries</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
 
  );
}

export default EnquiryDashboard;