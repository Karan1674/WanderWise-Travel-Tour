import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation, Link,useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function CareerDetail() {
  const { user, userType } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const {careerId} = useParams();
  const [career, setCareer] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCareerDetail = async () => {
      if (!careerId) {
        toast.error('No career ID provided');
        navigate('/career-list');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/career-detail/${careerId}`, {
          withCredentials: true,
        });
        const data = response.data;
        if (data.success) {
          setCareer(data.career);
          setApplications(data.applications);
        } else {
          toast.error(data.message || 'Career not found');
          navigate(-1);
        }
      } catch (error) {
        console.error('Error fetching career details:', error);
        toast.error('Server error fetching career details');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (['admin', 'agent'].includes(userType)) {
      fetchCareerDetail();
    } else {
      toast.error('Unauthorized access');
      navigate('/');
    }
  }, [careerId, userType, navigate]);

  if (loading) {
    return (
      <div className="db-info-wrap">
        <div
          className="d-flex justify-content-center align-items-center flex-column"
          style={{ height: '100vh', backgroundColor: '#f9f9f9' }}
        >
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
          <p className="mt-3 fw-semibold text-dark fs-5">Loading, please wait...</p>
        </div>
      </div>
    );
  }

  if (!career) {
    return null;
  }

  return (
    <div className="db-info-wrap">
      <div className="row">
        <div className="col-lg-12">
          <div className="dashboard-box" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', padding: '20px' }}>
            <div className="header-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h4 style={{ margin: 0, color: '#333', fontSize: '24px', fontWeight: 600 }}>Career Detail</h4>
              <div>
                <Link to={`/edit-career?editCareerId=${career._id}`} className="btn btn-primary" style={{ marginRight: '10px', padding: '8px 16px' }} aria-label="Edit career">
                  Edit
                </Link>
                <Link to="/career-list" className="btn btn-secondary" style={{ padding: '8px 16px' }} aria-label="Back to career list">
                  Back to Career List
                </Link>
              </div>
            </div>
            <div className="card" style={{ border: '1px solid #e0e0e0', borderRadius: '10px', padding: '25px', background: '#fafafa' }}>
              <div className="row">
                <div className="col-md-6">
                  <p style={{ marginBottom: '12px' }}><strong style={{ color: '#333' }}>Title:</strong> {career.title}</p>
                  <p style={{ marginBottom: '12px' }}><strong style={{ color: '#333' }}>Employment Type:</strong> {career.employmentType}</p>
                  <p style={{ marginBottom: '12px' }}><strong style={{ color: '#333' }}>Vacancies:</strong> {career.vacancies}</p>
                  <p style={{ marginBottom: '12px' }}><strong style={{ color: '#333' }}>Salary:</strong> {career.salary}</p>
                  <p style={{ marginBottom: '12px' }}><strong style={{ color: '#333' }}>Active:</strong> {career.isActive ? 'Yes' : 'No'}</p>
                  <p style={{ marginBottom: '12px' }}><strong style={{ color: '#333' }}>Created By:</strong> {career.createdBy ? `${career.createdBy.firstName} ${career.createdBy.lastName} (${career.createdBy.email})` : 'Unknown'}</p>
                  {career.updatedBy && (
                    <p style={{ marginBottom: '12px' }}><strong style={{ color: '#333' }}>Updated By:</strong> {career.updatedBy ? `${career.updatedBy.firstName} ${career.updatedBy.lastName} (${career.updatedBy.email})` : ''}</p>
                  )}
                  {career.updatedAt && (
                    <p style={{ marginBottom: '12px' }}><strong style={{ color: '#333' }}>Updated At:</strong> {new Date(career.updatedAt).toLocaleString()}</p>
                  )}
                </div>
                <div className="col-md-6 text-center">
                  <img
                    src={`${import.meta.env.VITE_API_URL}/Uploads/career/${career.image}`}
                    alt={career.title}
                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  />
                </div>
              </div>
              <div className="mt-4">
                <h5 style={{ color: '#333', fontWeight: 600, marginBottom: '15px' }}>Short Description</h5>
                <p style={{ color: '#555' }}>{career.shortDescription}</p>
              </div>
              <div className="mt-4">
                <h5 style={{ color: '#333', fontWeight: 600, marginBottom: '15px' }}>Description</h5>
                <div style={{ color: '#555' }} dangerouslySetInnerHTML={{ __html: career.description }} />
              </div>
              <div className="mt-4">
                <h5 style={{ color: '#333', fontWeight: 600, marginBottom: '15px' }}>Overview</h5>
                <div style={{ color: '#555' }} dangerouslySetInnerHTML={{ __html: career.overview }} />
              </div>
              <div className="mt-4">
                <h5 style={{ color: '#333', fontWeight: 600, marginBottom: '15px' }}>Experience</h5>
                <div style={{ color: '#555', padding: '10px' }} dangerouslySetInnerHTML={{ __html: career.experience }} />
              </div>
              <div className="mt-4">
                <h5 style={{ color: '#333', fontWeight: 600, marginBottom: '15px' }}>Requirements</h5>
                <div style={{ color: '#555' }} dangerouslySetInnerHTML={{ __html: career.requirements }} />
              </div>
            </div>
            <div className="mt-5">
              <h4 style={{ color: '#333', fontWeight: 600, marginBottom: '20px' }}>Applicants</h4>
              <div className="table-responsive">
                <table className="table table-bordered table-hover" style={{ background: '#fff', borderRadius: '8px' }}>
                  <thead style={{ background: '#f1f1f1' }}>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>CV</th>
                      <th>Status</th>
                      <th>Applied At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications && applications.length > 0 ? (
                      applications.map((application) => (
                        <tr key={application._id}>
                          <td>{application.userId ? `${application.userId.firstName} ${application.userId.lastName}` : 'Unknown'}</td>
                          <td>{application.userId?.email || 'N/A'}</td>
                          <td>
                            {application.cvFileName ? (
                              <a href={`${import.meta.env.VITE_API_URL}/Uploads/careerCV/${application.cvFileName}`} target="_blank" rel="noopener noreferrer" className="text-primary">
                                View CV
                              </a>
                            ) : (
                              'No CV'
                            )}
                          </td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                padding: '6px 12px',
                                borderRadius: '12px',
                                background: application.status === 'accepted' ? '#28a745' : application.status === 'rejected' ? '#dc3545' : '#ffc107',
                                color: application.status === 'pending' ? '#333' : '#fff',
                              }}
                            >
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </td>
                          <td>{new Date(application.appliedAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                          <td>
                            <Link to={`/application-detail/${application._id}`} className="btn btn-sm text-white btn-info">
                              View & Edit
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No applicants found for this career.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CareerDetail;