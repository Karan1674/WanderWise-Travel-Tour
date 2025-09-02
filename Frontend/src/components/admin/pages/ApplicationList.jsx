import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { setApplicationsData } from '../../../redux/slices/applicationSlice';
import Pagination from './Pagination';

function ApplicationList() {
  const { userType } = useSelector((state) => state.auth);
  const { allApplications, totalPages, currentPage, search, statusFilter } = useSelector((state) => state.applications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get('page')) || 1;
  const initialSearch = queryParams.get('search') || '';
  const initialStatusFilter = queryParams.get('statusFilter') || 'all';

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/application-list`, {
          params: { page: initialPage, search: initialSearch, statusFilter: initialStatusFilter },
          withCredentials: true,
        });
        const data = response.data;
        if (data.success) {
          dispatch(setApplicationsData({
            allApplications: data.allApplications,
            totalPages: data.totalPages,
            currentPage: data.currentPage,
            search: data.search,
            statusFilter: data.statusFilter,
          }));
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Error fetching application list');
      } finally {
        setLoading(false);
      }
    };

    if (['admin', 'agent'].includes(userType)) {
      fetchApplications();
    } else {
      toast.error('Unauthorized access');
      navigate('/');
    }
  }, [navigate, initialPage, initialSearch, initialStatusFilter, userType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newSearch = e.target.search.value.trim();
    const newStatusFilter = e.target.statusFilter.value;
    const newUrl = `?page=1${newSearch ? `&search=${encodeURIComponent(newSearch)}` : ''}${newStatusFilter !== 'all' ? `&statusFilter=${encodeURIComponent(newStatusFilter)}` : ''}`;
    navigate(`/application-list${newUrl}`);
  };

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

  if (!allApplications) {
    return null;
  }

  return (
    <div className="db-info-wrap">
      <div className="row">
        <div className="col-lg-12">
          <div className="dashboard-box" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div className="header-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ margin: 0, color: '#333' }}>Applicant List</h4>
            </div>
            <div className="package-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <form id="search-form" onSubmit={handleSearchSubmit} style={{ flex: 1, marginRight: '20px' }}>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <input
                    type="text"
                    name="search"
                    id="search-input"
                    placeholder="Search by Applicant Name or Job Title"
                    defaultValue={search}
                    style={{ width: '70%', padding: '8px 40px 8px 8px', border: '1px solid #ddd', borderRadius: '4px', marginRight: '10px' }}
                  />
                  <select
                    name="statusFilter"
                    id="status-filter"
                    defaultValue={statusFilter}
                    style={{ width: '30%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button type="submit" aria-label="Search applications" style={{ position: 'absolute', right: '40px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <i className="fas fa-search" style={{ color: '#007bff' }}></i>
                  </button>
                </div>
              </form>
            </div>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Applicant Name</th>
                    <th>Email</th>
                    <th>Job Title</th>
                    <th>Status</th>
                    <th>Applied At</th>
                    <th>Updated By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allApplications.map((application) => (
                    <tr key={application._id}>
                      <td>{application.userId ? `${application.userId.firstName} ${application.userId.lastName}` : 'Unknown'}</td>
                      <td>{application.userId?.email || 'N/A'}</td>
                      <td>{application.careerId?.title || 'N/A'}</td>
                      <td>
                        <span
                          className={`badge badge-${application.status === 'accepted' ? 'success' : application.status === 'rejected' ? 'danger' : 'warning'}`}
                        >
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        {new Date(application.appliedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td>{application.updatedBy ? `${application.updatedBy.firstName} ${application.updatedBy.lastName}` : ''}</td>
                      <td>
                        <span
                          className="badge badge-info"
                          style={{ cursor: 'pointer', marginRight: '5px' }}
                          onClick={() => navigate(`/application-detail/${application._id}`)}
                        >
                          <i className="far fa-eye"></i>
                        </span>
                        <span
                          className="badge badge-success"
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/application-detail/${application._id}#updateApplicant`)}
                        >
                          <i className="far fa-edit"></i>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        search={search}
        statusFilter={statusFilter}
      />
        </div>
      </div>
    </div>
  );
}

export default ApplicationList;