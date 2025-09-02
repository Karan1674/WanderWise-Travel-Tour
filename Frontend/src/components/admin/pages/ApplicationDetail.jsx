import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';


function ApplicationDetail() {
  const { user, userType } = useSelector((state) => state.auth);
  const { allApplications } = useSelector((state) => state.applications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchApplication = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/application-detail/${id}`, {
        withCredentials: true,
      });
      const { application } = response.data;
      setApplication(application);
      setStatus(application.status);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching application detail:', error);
      toast.error('Server error fetching application detail');
      navigate('/application-list');
    }
  }, [id, dispatch, allApplications, navigate]);

  useEffect(() => {
    if (!['admin', 'agent'].includes(userType)) {
      toast.error('Unauthorized access');
      navigate('/');
      return;
    }

    // Check if application exists in Redux store
    const storedApplication = allApplications.find(app => app._id === id);
    if (storedApplication) {
      setApplication(storedApplication);
      setStatus(storedApplication.status);
      setLoading(false);
    } else {
      fetchApplication();
    }
  }, [id, userType, navigate, allApplications, fetchApplication]);

  const handleStatusUpdate = useCallback(async (e) => {
    e.preventDefault();
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      toast.error('Invalid status');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/application-detail/${id}/update`,
        { status },
        { withCredentials: true }
      );
      const { application } = response.data;
      setApplication(application);
      toast.success('Application status updated successfully');
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Server error updating application status');
    } finally {
      setLoading(false);
    }
  }, [id, status, dispatch, allApplications]);

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

  if (!application) {
    toast.error('Application not found');
    navigate('/application-list');
    return null;
  }

  return (
    <div className="db-info-wrap">
      <div className="row">
        <div className="col-lg-12">
          <div className="dashboard-box" style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '24px' }}>
            <div className="header-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h4 style={{ margin: 0, color: '#1f2937', fontSize: '28px', fontWeight: 700, lineHeight: 1.2 }}>Application Details</h4>
              <Link to="/application-list" className="btn btn-secondary" style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 500, transition: 'all 0.3s ease' }} aria-label="Back to Application List">
                Back to Application List
              </Link>
            </div>
            <div className="card" style={{ border: 'none', borderRadius: '12px', background: '#f9fafb', padding: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
              <div className="row" style={{ rowGap: '16px' }}>
                <div className="col-md-6">
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <i className="fas fa-user" style={{ color: '#6b7280', marginRight: '8px' }}></i>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: '#1f2937', fontWeight: 600 }}>Applicant Name:</strong> {application.userId ? `${application.userId.firstName} ${application.userId.lastName}` : 'Unknown'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <i className="fas fa-envelope" style={{ color: '#6b7280', marginRight: '8px' }}></i>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: '#1f2937', fontWeight: 600 }}>Email:</strong> {application.userId?.email || 'N/A'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <i className="fas fa-briefcase" style={{ color: '#6b7280', marginRight: '8px' }}></i>
                    <p
                      style={{ margin: 0, cursor: 'pointer', color: 'rgba(0, 132, 255, 0.849)' }}
                      onClick={() => navigate(`/career-detail/${application.careerId._id}`)}
                    >
                      <strong style={{ color: '#1f2937', fontWeight: 600 }}>Job Title:</strong> {application.careerId?.title || 'N/A'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <i className="fas fa-calendar-alt" style={{ color: '#6b7280', marginRight: '8px' }}></i>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: '#1f2937', fontWeight: 600 }}>Applied At:</strong>{' '}
                      {new Date(application.appliedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <i className="fas fa-file-download" style={{ color: '#6b7280', marginRight: '8px' }}></i>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: '#1f2937', fontWeight: 600 }}>CV:</strong>{' '}
                      {application.cvFileName ? (
                        <a href={`${import.meta.env.VITE_API_URL}/Uploads/careerCV/${application.cvFileName}`} download className="text-blue-600 hover:underline" style={{ transition: 'color 0.2s ease' }}>
                          Download CV
                        </a>
                      ) : (
                        'No CV'
                      )}
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <i className="fas fa-info-circle" style={{ color: '#6b7280', marginRight: '8px' }}></i>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: '#1f2937', fontWeight: 600 }}>Status:</strong>{' '}
                      <span
                        className="badge"
                        style={{
                          padding: '8px 12px',
                          borderRadius: '999px',
                          fontSize: '14px',
                          background: application.status === 'accepted' ? '#22c55e' : application.status === 'rejected' ? '#ef4444' : '#facc15',
                          color: application.status === 'accepted' || application.status === 'rejected' ? '#fff' : '#1f2937',
                        }}
                      >
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </p>
                  </div>
                  {application.updatedBy && (
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                      <i className="fas fa-envelope" style={{ color: '#6b7280', marginRight: '8px' }}></i>
                      <p style={{ margin: 0 }}>
                        <strong style={{ color: '#1f2937', fontWeight: 600 }}>Updated By:</strong>{' '}
                        {application.updatedBy ? `${application.updatedBy.firstName} ${application.updatedBy.lastName} (${application.updatedBy.email})` : 'Unknown'}
                      </p>
                    </div>
                  )}
                  {application.updatedAt && (
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                      <i className="fas fa-calendar-alt" style={{ color: '#6b7280', marginRight: '8px' }}></i>
                      <p style={{ margin: 0 }}>
                        <strong style={{ color: '#1f2937', fontWeight: 600 }}>Updated At:</strong>{' '}
                        {new Date(application.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {application.cvFileName && (
                <div style={{ marginTop: '32px' }}>
                  <h5 style={{ color: '#1f2937', fontWeight: 600, fontSize: '20px', marginBottom: '16px' }}>CV Preview</h5>
                  {application.cvFileName.match(/\.(jpe?g|png)$/i) ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/Uploads/careerCV/${application.cvFileName}`}
                      alt="CV Preview"
                      style={{ maxWidth: '100%', maxHeight: '600px', borderRadius: '8px', border: '1px solid #e5e7eb', objectFit: 'contain' }}
                    />
                  ) : application.cvFileName.match(/\.(pdf)$/i) ? (
                    <iframe
                      src={`${import.meta.env.VITE_API_URL}/Uploads/careerCV/${application.cvFileName}`}
                      style={{ width: '100%', height: '600px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      title="CV Preview"
                    ></iframe>
                  ) : (
                    <p style={{ color: '#6b7280' }}>
                      Preview not available for this file type (DOC/DOCX). Please{' '}
                      <a href={`${import.meta.env.VITE_API_URL}/Uploads/careerCV/${application.cvFileName}`} download className="text-blue-600 hover:underline">
                        download the CV
                      </a>{' '}
                      to view.
                    </p>
                  )}
                </div>
              )}
              <div style={{ marginTop: '32px' }} id="updateApplicant">
                <h5 style={{ color: '#1f2937', fontWeight: 600, fontSize: '20px', marginBottom: '16px' }}>Update Application Status</h5>
                <form onSubmit={handleStatusUpdate} className="needs-validation" noValidate>
                  <div style={{ marginBottom: '24px' }}>
                    <label htmlFor="status" style={{ color: '#1f2937', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                      Select Status
                    </label>
                    <select
                      className="form-select"
                      id="status"
                      name="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      required
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', width: '100%', fontSize: '16px' }}
                    >
                      <option value="" disabled>
                        Select a status
                      </option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <div className="invalid-feedback" style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                      Please select a status.
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '10px 20px', borderRadius: '8px', background: '#3b82f6', color: '#fff', fontWeight: 500, transition: 'background 0.3s ease' }}
                  >
                    Update Status
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationDetail;