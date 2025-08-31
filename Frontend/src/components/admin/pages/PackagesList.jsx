import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import DeleteModal from './DeleteModal';
import Pagination from './Pagination';
import { setPackagesData } from '../../../redux/slices/packageSlice';


function PackagesList() {
  const { userType } = useSelector((state) => state.auth);
  const { allPackages, totalPages, currentPage, search, statusFilter } = useSelector((state) => state.packages);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get('page')) || 1;
  const initialSearch = queryParams.get('search') || '';
  const initialStatusFilter = queryParams.get('statusFilter') || 'all';

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/db-all-packages`, {
          params: { page: initialPage, search: initialSearch, statusFilter: initialStatusFilter },
          withCredentials: true,
        });
        const data = response.data;
        console.log(data)
        if (data.success) {
          dispatch(setPackagesData({
            allPackages: data.allPackages,
            totalPages: data.totalPages,
            currentPage: data.currentPage,
            search: data.search,
            statusFilter: data.statusFilter,
          }));
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (['admin','agent'].includes(userType)) {
      fetchPackages();
    }
  }, [navigate, initialPage, initialSearch, initialStatusFilter, userType, dispatch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newSearch = e.target.search.value.trim();
    const newStatusFilter = e.target.statusFilter.value;
    const newUrl = `?page=1${newSearch ? `&search=${encodeURIComponent(newSearch)}` : ''}${newStatusFilter !== 'all' ? `&statusFilter=${encodeURIComponent(newStatusFilter)}` : ''}`;
    navigate(`/db-package-dashboard${newUrl}`);
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

  if (!allPackages) {
    return null;
  }

  return (
    <div className="db-info-wrap db-package-wrap">
      <div className="row">
        <div className="col-lg-12">
          <div className="dashboard-box table-opp-color-box">
            <div
              className="header-controls"
              style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '20px' }}
            >
              <h4 style={{ margin: 0, color: '#333' }}>Packages List</h4>
              {userType === 'admin' && (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/db-add-package')}
                  aria-label="Add new package"
                >
                  Add Package
                </button>
              )}
            </div>
            <div className="package-controls">
              <form id="search-form" onSubmit={handleSearchSubmit}>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <input
                    type="text"
                    name="search"
                    id="search-input"
                    placeholder="Search by package name"
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
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                  </select>
                  <button
                    type="submit"
                    aria-label="Search packages"
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
                    <th>Name</th>
                    <th>Trip Duration</th>
                    <th>Package Type</th>
                    <th>Destination</th>
                    <th>Created By</th>
                    <th>Status</th>
                    <th>Updated By</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allPackages && allPackages.length > 0 ? (
                    allPackages.map((pkg) => (
                      <tr key={pkg._id}>
                        <td><span className="package-name">{pkg.title}</span></td>
                        <td>{pkg.tripDuration ? `${pkg.tripDuration.days}D ${pkg.tripDuration.nights}N` : 'Not specified'}</td>
                        <td>{pkg.packageType || 'Not specified'}</td>
                        <td>{pkg.destinationCountry || 'Not specified'}</td>
                        <td>{pkg.createdBy ? `${pkg.createdBy.firstName} ${pkg.createdBy.lastName}` : 'Unknown'}</td>
                        <td>
                          <span
                            className={`badge badge-${
                              pkg.status === 'Active' ? 'success' : pkg.status === 'Pending' ? 'primary' : 'danger'
                            }`}
                          >
                            {pkg.status}
                          </span>
                        </td>
                        <td>{pkg.updatedBy ? `${pkg.updatedBy.firstName} ${pkg.updatedBy.lastName}` : ''}</td>
                        <td>
                          <Link
                            to={`/package-preview/${pkg._id}`}
                            className="badge badge-info text-white"
                            title="Preview Package"
                          >
                            <i className="far fa-eye"></i>
                          </Link>
                          <span
                            className="badge badge-success"
                            style={{ cursor: 'pointer', marginLeft: '5px' }}
                            onClick={() => navigate(`/edit-package/${pkg._id}`)}
                            aria-label="Edit Package"
                          >
                            <i className="far fa-edit"></i>
                          </span>
                          {userType === 'admin' && (
                            <span
                              className="badge badge-danger delete-btn"
                              style={{ cursor: 'pointer', marginLeft: '5px' }}
                              data-toggle="modal"
                              data-target={`#deletePackageModal_${pkg._id}`}
                              aria-label="Delete Package"
                            >
                              <i className="far fa-trash-alt"></i>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center text-muted">
                        No packages found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {allPackages && allPackages.length > 0 &&
        allPackages.map((pkg) => (
          <DeleteModal
            key={`deletePackageModal_${pkg._id}`}
            modalId={`deletePackageModal_${pkg._id}`}
            entityName="Package"
            apiEndpoint={`${import.meta.env.VITE_API_URL}/api/admin/delete-package/${pkg._id}`}
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

export default PackagesList;