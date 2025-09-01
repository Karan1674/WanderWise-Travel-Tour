import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { setCareersData, removeCareer } from '../../../redux/slices/careerSlice';
import Pagination from './Pagination';
import DeleteModal from './DeleteModal';

function CareerList() {
  const { user, userType } = useSelector((state) => state.auth);
  const { allCareers, totalPages, currentPage, search, statusFilter } = useSelector((state) => state.careers);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get('page')) || 1;
  const initialSearch = queryParams.get('search') || '';
  const initialStatusFilter = queryParams.get('statusFilter') || 'all';

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/career-list`, {
          params: { page: initialPage, search: initialSearch, statusFilter: initialStatusFilter },
          withCredentials: true,
        });
        const data = response.data;
        if (data.success) {
          dispatch(setCareersData({
            allCareers: data.careers,
            totalPages: data.totalPages,
            currentPage: data.currentPage,
            search: data.search,
            statusFilter: data.statusFilter,
          }));
        } else {
          toast.error(data.message || 'Failed to fetch careers');
          navigate('/career-list');
        }
      } catch (error) {
        console.error('Error fetching careers:', error);
        toast.error('Server error fetching careers');
        navigate('/career-list');
      } finally {
        setLoading(false);
      }
    };

    if (['admin', 'agent'].includes(userType)) {
      fetchCareers();
    } else {
      toast.error('Unauthorized access');
      navigate('/');
    }
  }, [navigate, initialPage, initialSearch, initialStatusFilter, userType, dispatch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newSearch = e.target.search.value.trim();
    const newStatusFilter = e.target.statusFilter.value;
    const newUrl = `?page=1${newSearch ? `&search=${encodeURIComponent(newSearch)}` : ''}${newStatusFilter !== 'all' ? `&statusFilter=${encodeURIComponent(newStatusFilter)}` : ''}`;
    navigate(`/career-list${newUrl}`);
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

  if (!allCareers) {
    return null;
  }

  return (
    <div className="db-info-wrap">
      <div className="row">
        <div className="col-lg-12">
          <div className="dashboard-box table-opp-color-box">
            <div className="header-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ margin: 0, color: '#333' }}>Career List</h4>
              <Link to="/add-career" className="btn btn-primary" aria-label="Add new career">
                Add Career
              </Link>
            </div>
            <div className="user-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <form id="search-form" onSubmit={handleSearchSubmit}>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <input
                    type="text"
                    name="search"
                    id="search-input"
                    placeholder="Search by career title"
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
                    <option value="Active">Active</option>
                    <option value="notActive">Not Active</option>
                  </select>
                  <button
                    type="submit"
                    aria-label="Search careers"
                    style={{ position: 'absolute', right: '40px', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <i className="fas fa-search" style={{ color: '#007bff' }}></i>
                  </button>
                </div>
              </form>
            </div>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Employment Type</th>
                    <th>Vacancies</th>
                    <th>Salary</th>
                    <th>Created By</th>
                    <th>Updated By</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allCareers && allCareers.length > 0 ? (
                    allCareers.map((career) => (
                      <tr key={career._id}>
                        <td>{career.title}</td>
                        <td>{career.employmentType}</td>
                        <td>{career.vacancies}</td>
                        <td>{career.salary}</td>
                        <td>{career.createdBy ? `${career.createdBy.firstName} ${career.createdBy.lastName}` : 'Unknown'}</td>
                        <td>{career.updatedBy ? `${career.updatedBy.firstName} ${career.updatedBy.lastName}` : ''}</td>
                        <td>
                          <span className={`badge badge-${career.isActive ? 'success' : 'danger'}`}>
                            {career.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td>
                          <span
                            className="badge badge-info text-white view-btn"
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/career-detail/${career._id}`)}
                            aria-label="View Career"
                          >
                            <i className="far fa-eye"></i>
                          </span>
                    
                          <span
                            className="badge badge-success text-white edit-btn"
                            onClick={() => navigate(`/edit-career/${career._id}`)}
                            style={{ cursor: 'pointer', marginLeft: '5px' }}
                            aria-label="Edit Career"
                          >
                            <i className="far fa-edit"></i>
                          </span>
                    
                          <span
                            className="badge badge-danger delete-btn"
                            style={{ cursor: 'pointer', marginLeft: '5px' }}
                            data-toggle="modal"
                            data-target={`#deleteModal_${career._id}`}
                            aria-label="Delete Career"
                          >
                            <i className="far fa-trash-alt"></i>
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center text-muted">
                        No careers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
 
      {/* Delete modals */}
      {allCareers && allCareers.length > 0 && allCareers.map((career) => (
        <DeleteModal
          key={`deleteModal_${career._id}`}
          modalId={`deleteModal_${career._id}`}
          entityName="Career"
          apiEndpoint={`${import.meta.env.VITE_API_URL}/api/admin/delete-career/${career._id}`}
          entityId={career._id}
          deleteCallback={removeCareer}
        />
      ))}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        search={search}
        statusFilter={statusFilter}
      />
    </div>
  );
}

export default CareerList;