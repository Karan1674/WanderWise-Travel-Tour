import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';


function CouponDetails() {
  const { user, userType } = useSelector((state) => state.auth);
  const { allCoupons } = useSelector((state) => state.coupons);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { couponId } = useParams();
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        // Check if coupon exists in Redux store
        const storedCoupon = allCoupons.find((c) => c._id === couponId);
        if (storedCoupon) {
          setCoupon(storedCoupon);
          setLoading(false);
          return;
        }

        // Fallback to API
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/coupon-details/${couponId}`, {
          withCredentials: true,
        });
        const data = response.data;
        if (data.success && data.coupon) {
          setCoupon(data.coupon);
        } else {
          toast.error(data.message || 'Coupon not found');
          setCoupon(null);
        }
      } catch (error) {
        console.error('Error fetching coupon:', error);
        toast.error('Server error fetching coupon');
        navigate('/coupon-list');
      } finally {
        setLoading(false);
      }
    };

    if (['admin', 'agent'].includes(userType)) {
      fetchCoupon();
    } else {
      toast.error('Unauthorized access');
      navigate('/');
    }
  }, [couponId, userType, navigate, allCoupons, dispatch]);



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


  return (
    <div className="db-info-wrap">
      <div className="row">
        <div className="col-lg-12">
          <div className="dashboard-box">
            <div className="header-controls" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <h4 style={{ margin: 0 }}>Coupon Details</h4>
              <div>
                <Link to={`/edit-coupon/${coupon?._id}`} className="btn btn-primary" style={{ width: 'fit-content' }} aria-label="Edit coupon">
                  Edit Coupon
                </Link>
                <Link to="/coupon-list" className="btn btn-secondary" style={{ width: 'fit-content', marginLeft: '10px' }} aria-label="Back to coupon list">
                  Back to List
                </Link>
              </div>
            </div>
            {!coupon ? (
              <p>No coupon found or you do not have access.</p>
            ) : (
              <>
                <div className="row">
                  <div className="col-sm-6">
                    <p><strong>Coupon Code:</strong> {coupon.code}</p>
                    <p><strong>Discount Type:</strong> {coupon.discountType.charAt(0).toUpperCase() + coupon.discountType.slice(1)}</p>
                    <p><strong>Discount Value:</strong> {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue.toFixed(2)}`}</p>
                    <p><strong>Restricted to User:</strong> {coupon.restrictToUser ? `${coupon.restrictToUser.firstName} ${coupon.restrictToUser.lastName} (${coupon.restrictToUser.email})` : 'None'}</p>
                    <p><strong>Minimum Purchase:</strong> ${coupon.minPurchase.toFixed(2)}</p>
                    <p><strong>Maximum Discount:</strong> {coupon.maxDiscount > 0 ? `$${coupon.maxDiscount.toFixed(2)}` : 'No limit'}</p>
                    <p><strong>Expiry Date:</strong> {new Date(coupon.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <div className="col-sm-6">
                    <p><strong>Usage Limit:</strong> {coupon.usageLimit}</p>
                    <p><strong>Used Count:</strong> {coupon.usedCount}</p>
                    <p><strong>Status:</strong> <span className={`badge badge-${coupon.isActive ? 'success' : 'danger'}`}>{coupon.isActive ? 'Active' : 'Inactive'}</span></p>
                    <p><strong>Created At:</strong> {new Date(coupon.createdAt).toLocaleString()}</p>
                    <p><strong>Created By:</strong> {coupon.createdByModel} ({coupon.createdBy.firstName} {coupon.createdBy.lastName} ({coupon.createdBy.email}))</p>
                    {coupon.updatedAt && <p><strong>Updated At:</strong> {new Date(coupon.updatedAt).toLocaleString()}</p>}
                    {coupon.updatedBy && <p><strong>Updated By:</strong> {coupon.updatedByModel} ({coupon.updatedBy.firstName} {coupon.updatedBy.lastName} ({coupon.updatedBy.email}))</p>}
                  </div>
                </div>
               
              </>
            )}
          </div>
          <div className="row">
                  <div className="col-lg-12">
                    <div className="dashboard-box">
                      <div className="header-controls" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <h4 style={{ margin: 0 }}>Used By</h4>
                      </div>
                      {coupon.usedBy && coupon.usedBy.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table">
                            <thead>
                              <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Used At</th>
                              </tr>
                            </thead>
                            <tbody>
                              {coupon.usedBy.map((entry, index) => (
                                <tr key={index}>
                                  <td>{entry.userId.firstName} {entry.userId.lastName}</td>
                                  <td>{entry.userId.email}</td>
                                  <td>{new Date(entry.usedAt).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p>No users have used this coupon.</p>
                      )}
                    </div>
                  </div>
                </div>
        </div>
        
      </div>
    </div>
  );
}

export default CouponDetails;