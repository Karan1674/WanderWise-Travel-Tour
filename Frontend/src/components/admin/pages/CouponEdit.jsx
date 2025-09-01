import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';


function CouponEdit() {
  const { userType } = useSelector((state) => state.auth);
  const { allCoupons } = useSelector((state) => state.coupons);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { couponId } = useParams();
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: 0,
    maxDiscount: 0,
    expiryDate: '',
    usageLimit: 1,
    restrictToUser: '',
    isActive: 'true',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        // Check if coupon exists in Redux store
        const storedCoupon = allCoupons.find((c) => c._id === couponId);
        if (storedCoupon) {
          setFormData({
            code: storedCoupon.code,
            discountType: storedCoupon.discountType,
            discountValue: storedCoupon.discountValue,
            minPurchase: storedCoupon.minPurchase,
            maxDiscount: storedCoupon.maxDiscount,
            expiryDate: new Date(storedCoupon.expiryDate).toISOString().split('T')[0],
            usageLimit: storedCoupon.usageLimit,
            restrictToUser: storedCoupon.restrictToUser ? storedCoupon.restrictToUser.email : '',
            isActive: storedCoupon.isActive.toString(),
          });
          setLoading(false);
          return;
        }

        // Fallback to API
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin//edit-coupon/${couponId}`, {
          withCredentials: true,
        });
        const data = response.data;
        if (data.success && data.coupon) {
          setFormData({
            code: data.coupon.code,
            discountType: data.coupon.discountType,
            discountValue: data.coupon.discountValue,
            minPurchase: data.coupon.minPurchase,
            maxDiscount: data.coupon.maxDiscount,
            expiryDate: new Date(data.coupon.expiryDate).toISOString().split('T')[0],
            usageLimit: data.coupon.usageLimit,
            restrictToUser: data.coupon.restrictToUser ? data.coupon.restrictToUser.email : '',
            isActive: data.coupon.isActive.toString(),
          });

        } else {
          toast.error(data.message || 'Coupon not found');
          navigate(-1);
        }
      } catch (error) {
        console.error('Error fetching coupon:', error);
        toast.error('Server error fetching coupon');
        navigate(-1);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/edit-coupon/${couponId}`,
        formData,
        { withCredentials: true }
      );
      const data = response.data;
      if (data.success) {
        toast.success(data.message || 'Coupon updated successfully');

        navigate(-1);
      } else {
        toast.error(data.message || 'Failed to update coupon');
      }
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast.error('Server error updating coupon');
    }
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


  return (
    <div className="db-info-wrap">
      <div className="row">
        <div className="col-lg-12">
          <div className="dashboard-box">
            <h4>Edit Coupon</h4>
            <p>Update the details of the coupon. Fill in all required fields to ensure proper functionality.</p>
            <form className="form-horizontal" onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Coupon Code</label>
                    <input
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="form-control"
                      type="text"
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Discount Type</label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Discount Value</label>
                    <input
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      className="form-control"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Minimum Purchase</label>
                    <input
                      name="minPurchase"
                      value={formData.minPurchase}
                      onChange={handleInputChange}
                      className="form-control"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Maximum Discount</label>
                    <input
                      name="maxDiscount"
                      value={formData.maxDiscount}
                      onChange={handleInputChange}
                      className="form-control"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="form-control"
                      type="date"
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Usage Limit</label>
                    <input
                      name="usageLimit"
                      value={formData.usageLimit}
                      onChange={handleInputChange}
                      className="form-control"
                      type="number"
                      min="1"
                      step="1"
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Restrict to User (Optional)</label>
                    <input
                      name="restrictToUser"
                      value={formData.restrictToUser}
                      onChange={handleInputChange}
                      className="form-control"
                      type="text"
                      placeholder="Enter User Email"
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Active</label>
                    <select
                      name="isActive"
                      value={formData.isActive}
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>
              </div>
              <br />
              <input type="submit" value="Update Coupon" />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CouponEdit;