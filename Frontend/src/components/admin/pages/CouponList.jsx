import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { setCouponsData, removeCoupon } from '../../../redux/slices/couponSlice';
import Pagination from './Pagination';
import DeleteModal from './DeleteModal';

function CouponList() {
  const { user, userType } = useSelector((state) => state.auth);
  const { allCoupons, totalPages, currentPage, search, statusFilter } = useSelector((state) => state.coupons);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get('page')) || 1;
  const initialSearch = queryParams.get('search') || '';
  const initialStatusFilter = queryParams.get('statusFilter') || 'all';

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/coupon-list`, {
          params: { page: initialPage, search: initialSearch, statusFilter: initialStatusFilter },
          withCredentials: true,
        });
        const data = response.data;
        if (data.success) {
          dispatch(setCouponsData({
            allCoupons: data.coupons,
            totalPages: data.totalPages,
            currentPage: data.currentPage,
            search: data.search,
            statusFilter: data.statusFilter,
          }));
        } else {
          toast.error(data.message || 'Failed to fetch coupons');
          navigate('/coupon-list');
        }
      } catch (error) {
        console.error('Error fetching coupons:', error);
        toast.error('Server error fetching coupons');
        navigate('/coupon-list');
      } finally {
        setLoading(false);
      }
    };

    if (['admin', 'agent'].includes(userType)) {
      fetchCoupons();
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
    navigate(`/coupon-list${newUrl}`);
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

  if (!allCoupons) {
    return null;
  }

  return (
    <div className="db-info-wrap">
      <div className="row">
        <div className="col-lg-12">
          <div className="dashboard-box table-opp-color-box">
            <div className="header-controls" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <h4 style={{ margin: 0, color: '#333' }}>Coupons List</h4>
              <Link to="/new-coupon" className="btn btn-primary" aria-label="Add new coupon">
                Add Coupon
              </Link>
            </div>
            <div className="user-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <form id="search-form" onSubmit={handleSearchSubmit}>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <input
                    type="text"
                    name="search"
                    id="search-input"
                    placeholder="Search by coupon code"
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
                    aria-label="Search coupons"
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
                    <th>Code</th>
                    <th>Discount Type</th>
                    <th>Discount Value</th>
                    <th>Created By</th>
                    <th>Expiry Date</th>
                    <th>Updated By</th>
                    <th>Status</th>
                    <th>Actions</th>

                  </tr>
                </thead>
                <tbody>
                  {allCoupons && allCoupons.length > 0 ? (
                    allCoupons.map((coupon) => (
                      <tr key={coupon._id}>
                        <td><span className="coupon-code">{coupon.code}</span></td>
                        <td>{coupon.discountType.toUpperCase()}</td>
                        <td>{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue.toFixed(2)}`}</td>
                        <td>{coupon.createdBy ? `${coupon.createdBy.firstName} ${coupon.createdBy.lastName}` : 'Unknown'}</td>
                        <td>{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                        <td>{coupon.updatedBy ? `${coupon.updatedBy.firstName} ${coupon.updatedBy.lastName}` : ''}</td>
                        <td>
                          <span className={`badge badge-${coupon.isActive ? 'success' : 'danger'}`}>
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td >
                          <span
                            className="badge badge-info text-white"
                            title="View Coupon"
                            onClick={() => navigate(`/coupon-details/${coupon._id}`)}
                            style={{ cursor: 'pointer' }}
                          >
                            <i className="far fa-eye"></i>
                          </span>

                          <span
                            className="badge badge-success text-white"
                            onClick={() => navigate(`/edit-coupon/${coupon._id}`)}
                            style={{ cursor: 'pointer', marginLeft: '5px' }}
                            aria-label="Edit Coupon"
                          >
                            <i className="far fa-edit"></i>
                          </span>
                     
                          <span
                            className="badge badge-danger delete-btn"
                            style={{ cursor: 'pointer', marginLeft: '5px' }}
                            data-toggle="modal"
                            data-target={`#deleteModal_${coupon._id}`}
                            aria-label="Delete Coupon"
                          >
                            <i className="far fa-trash-alt"></i>
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center text-muted">
                        No coupons found.
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
      {allCoupons && allCoupons.length > 0 && allCoupons.map((coupon) => (
        <DeleteModal
          key={`deleteModal_${coupon._id}`}
          modalId={`deleteModal_${coupon._id}`}
          entityName="Coupon"
          apiEndpoint={`${import.meta.env.VITE_API_URL}/api/admin/delete-coupon/${coupon._id}`}
          entityId={coupon._id}
          deleteCallback={removeCoupon}
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

export default CouponList;