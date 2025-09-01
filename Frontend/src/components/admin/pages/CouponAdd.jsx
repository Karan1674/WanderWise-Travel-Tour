import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function CouponAdd() {
  const { userType } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    creationMode: 'manual',
    code: '',
    numCoupons: 1,
    discountType: 'percentage',
    discountValue: '',
    minPurchase: 0,
    maxDiscount: 0,
    expiryDate: '',
    usageLimit: 1,
    restrictToUser: '',
    isActive: 'true',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!['admin', 'agent'].includes(userType)) {
      toast.error('Unauthorized access');
      navigate('/');
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/new-coupon`, formData, {
        withCredentials: true,
      });
      const data = response.data;
      if (data.success) {
        toast.success(data.message || 'Coupon(s) created successfully');
        navigate('/coupon-list');
      } else {
        toast.error(data.message || 'Failed to create coupon');
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error('Server error creating coupon');
    }
  };

  return (
    <div className="db-info-wrap">
      <div className="row">
        <div className="col-lg-12">
          <div className="dashboard-box">
            <h4>Add New Coupon</h4>
            <p>Create a new coupon manually or generate multiple coupons automatically for discounts across the store.</p>
            <form className="form-horizontal" onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Creation Mode</label>
                    <select
                      name="creationMode"
                      value={formData.creationMode}
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      <option value="manual">Manual</option>
                      <option value="automatic">Automatic</option>
                    </select>
                  </div>
                </div>
                <div className="col-sm-6" style={{ display: formData.creationMode === 'manual' ? 'block' : 'none' }}>
                  <div className="form-group">
                    <label>Coupon Code</label>
                    <input
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="form-control"
                      type="text"
                      required={formData.creationMode === 'manual'}
                    />
                  </div>
                </div>
                <div className="col-sm-6" style={{ display: formData.creationMode === 'automatic' ? 'block' : 'none' }}>
                  <div className="form-group">
                    <label>Number of Coupons to Generate</label>
                    <input
                      name="numCoupons"
                      value={formData.numCoupons}
                      onChange={handleInputChange}
                      className="form-control"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Enter number of coupons"
                      required={formData.creationMode === 'automatic'}
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
              <input
                type="submit"
                value={formData.creationMode === 'automatic' ? 'Generate Coupons' : 'Create Coupon'}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CouponAdd;