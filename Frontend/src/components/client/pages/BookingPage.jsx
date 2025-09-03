import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Loader from '../layouts/Loader';

function CouponPopup({ coupons, onApply, onClose }) {
  return (
    <>
      <div
        id="popup-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
          opacity: 1,
          pointerEvents: 'auto',
        }}
        onClick={onClose}
      ></div>
      <div
        id="available-coupons-popup"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#ffffff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          maxWidth: '500px',
          maxHeight: '70vh',
          overflowY: 'auto',
          opacity: 1,
          width: '90%',
        }}
      >
        <i
          className="fas fa-times close-icon"
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            fontSize: '20px',
            color: '#6c757d',
            cursor: 'pointer',
          }}
          onClick={onClose}
        ></i>
        <h5 style={{ marginBottom: '20px', color: '#333', fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>
          Available Coupons
        </h5>
        {coupons.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {coupons.map((coupon) => (
              <li
                key={coupon._id}
                style={{
                  marginBottom: '15px',
                  padding: '15px',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  background: '#f9f9f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div className="coupon-details" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div className="coupon-code" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-gift text-secondary" style={{ color: '#6c757d' }}></i>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>{coupon.code}</span>
                  </div>
                  <span className="coupon-save" style={{ fontSize: '13px', color: '#6c757d' }}>
                    Save {coupon.discountType === 'fixed' ? '$' : ''}{coupon.discountValue}
                    {coupon.discountType === 'percentage' ? '%' : ''}
                  </span>
                </div>
                <button
                  className="apply"
                  style={{
                    padding: '8px 15px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                  onClick={() => onApply(coupon.code)}
                >
                  Apply
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ textAlign: 'center', color: '#6c757d', fontSize: '14px' }}>No coupons available.</p>
        )}
      </div>
    </>
  );
}

function BookingForm({ cart, user, isShow, stripeKey }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: user?.firstName || '',
    lastname: user?.lastName || '',
    email: user?.email || '',
    confirm_email: user?.email || '',
    phone: user?.phone || '',
    country: '',
    street_1: '',
    street_2: '',
    city: '',
    state: '',
    postal_code: '',
    notes: '',
    firstname_booking: '',
    accept_terms: false,
  });
  const [clientSecret, setClientSecret] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [quantities, setQuantities] = useState(
    cart.items.reduce((acc, item, index) => ({
      ...acc,
      [index]: item.quantity,
    }), {})
  );
  const formRef = useRef(null);

  const calculateTotals = () => {
    const subtotal = cart.items.reduce(
      (sum, item, index) => sum + (quantities[index] || item.quantity) * (item.packageId.salePrice || item.packageId.regularPrice),
      0
    );
    console.log(appliedCoupon)
    const discount = appliedCoupon
      ? appliedCoupon.discountType === 'percentage'
        ? Math.min(subtotal * (appliedCoupon.discountValue / 100), appliedCoupon.maxDiscount || Infinity)
        : appliedCoupon.discountValue
      : 0;
    const tax = (subtotal - discount) * 0.13;
    const total = subtotal - discount + 34 + 34 + tax;
    return { subtotal, discount, tax, total };
  };

  const { subtotal, discount, tax, total } = calculateTotals();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const updateQuantity = async (index, packageId, newQuantity) => {
    if (newQuantity < 1) return;
    if (!isShow) {
      setQuantities((prev) => ({ ...prev, [index]: newQuantity }));
      return;
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/client/packageCart/update`,
        { packageId, quantity: newQuantity },
        { withCredentials: true }
      );
      if (response.data.success) {
        setQuantities((prev) => ({ ...prev, [index]: newQuantity }));
        toast.success('Quantity updated');
      } else {
        toast.error(response.data.message || 'Failed to update quantity');
      }
    } catch (error) {
      toast.error('Error updating quantity');
    }
  };
  const applyCoupon = async (code) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/client/applyCoupon`,
        { couponCode: code },
        { withCredentials: true }
      );
      if (response.data.success) {
        if (subtotal >= response.data.coupon.minPurchase) {
          // Calculate discount using the coupon data from the response
          const discount =
            response.data.coupon.discountType === 'percentage'
              ? Math.min(subtotal * (response.data.coupon.discountValue / 100), response.data.coupon.maxDiscount || Infinity)
              : response.data.coupon.discountValue;
          
          // Update state
          setCouponCode(code);
          setAppliedCoupon(response.data.coupon);
  
          // Show toast with the calculated discount
          toast.success(`Coupon applied! Discount: $${discount.toFixed(2)}`);
        } else {
          toast.error('Minimum purchase requirement not met');
        }
      } else {
        toast.error(response.data.message || 'Invalid coupon');
      }
    } catch (error) {
      toast.error('Failed to apply coupon');
    }
  };
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/client/available-coupons`, { withCredentials: true });
      if (response.data.success) {
        setCoupons(response.data.coupons);
        setShowCoupons(true);
      } else {
        toast.error(response.data.message || 'No available coupons');
      }
    } catch (error) {
      toast.error('Failed to load coupons');
    }
  };

  const fetchPaymentIntent = async (url, body, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.post(import.meta.env.VITE_API_URL+'/api/client'+ url, body, { withCredentials: true });
        return response;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      toast.error('Payment system not loaded. Please try again.');
      return;
    }
    if (formData.email !== formData.confirm_email) {
      toast.error('Emails do not match');
      return;
    }
    if (!formData.accept_terms) {
      toast.error('You must accept the terms and conditions');
      return;
    }

    setSubmitting(true);

    try {
      const paymentIntentUrl = isShow ? '/packageCart/create-payment-intent' : '/bookPackage/create-payment-intent';
      const requestBody = isShow
        ? {
            email: formData.email,
            items: cart.items.map((item, index) => ({
              packageId: item.packageId._id,
              quantity: quantities[index] || item.quantity,
            })),
            couponCode,
          }
        : {
            email: formData.email,
            packageId: cart.items[0].packageId._id,
            quantity: quantities[0] || cart.items[0].quantity,
            couponCode,
          };

      const response = await fetchPaymentIntent(paymentIntentUrl, requestBody);
      if (!response.data.success) {
        toast.error(response.data.message || 'Failed to create payment intent');
        return;
      }

      const { clientSecret } = response.data;
      setClientSecret(clientSecret);

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: formData.firstname_booking,
            email: formData.email,
            phone: formData.phone,
            address: {
              line1: formData.street_1,
              line2: formData.street_2 || '',
              city: formData.city,
              state: formData.state,
              postal_code: formData.postal_code || '',
              country: formData.country,
            },
          },
        },
      });

      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      const confirmUrl = isShow ? `${import.meta.env.VITE_API_URL}/api/client/packageCart/confirm` : `${import.meta.env.VITE_API_URL}/api/client/bookPackage/confirm`;
      const confirmBody = {
        ...formData,
        client_secret: clientSecret,
        appliedCouponCode: couponCode,
        ...(isShow
          ? {
              items: cart.items.map((item, index) => ({
                packageId: item.packageId._id,
                quantity: quantities[index] || item.quantity,
              })),
            }
          : {
              packageId: cart.items[0].packageId._id,
              quantity: quantities[0] || cart.items[0].quantity,
            }),
      };

      const confirmResponse = await axios.post(confirmUrl, confirmBody, { withCredentials: true });
      if (confirmResponse.data.success) {
        navigate(`/confirmation/${confirmResponse.data.booking._id}?isShow=${isShow}&isShowAll=true`);
        toast.success('Booking confirmed successfully');
      } else {
        toast.error(confirmResponse.data.message || 'Failed to confirm booking');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!stripeKey) {
    return (
      <div className="container text-center">
        <h3>Error loading payment system</h3>
        <p>Please try again later or contact support.</p>
        <Link to="/tour-packages">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="row">
      <style>{`
        .booking-form-wrap .form-control {
          width: 100%;
          padding: 10px;
          margin-bottom: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .booking-form-wrap .form-group {
          margin-bottom: 15px;
        }
        .booking-form-wrap label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        .booking-form-wrap textarea.form-control {
          min-height: 100px;
        }
        .form-title {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        .form-title span {
          display: inline-block;
          width: 30px;
          height: 30px;
          line-height: 30px;
          text-align: center;
          background: #007bff;
          color: #fff;
          border-radius: 50%;
          margin-right: 10px;
        }
        .widget-table-summary {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .widget-table-summary table {
          width: 100%;
          margin-bottom: 20px;
        }
        .widget-table-summary td {
          padding: 10px;
          vertical-align: middle;
        }
        .quantity-control {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 5px;
        }
        .quantity {
          min-width: 20px;
          text-align: center;
        }
        .btn-sm {
          padding: 2px 8px;
          font-size: 12px;
          border: 1px solid #ddd;
          background: #f5f5f5;
          cursor: pointer;
        }
        .widget-coupon-apply {
          margin-top: 20px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .input-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .input-group input {
          flex: 1;
          padding: 10px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        .widget-support-wrap {
          margin-top: 20px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .widget-support-wrap .icon i {
          font-size: 24px;
          color: #007bff;
        }
        .widget-support-wrap .support-content h5 {
          margin: 0 0 5px;
          font-size: 16px;
        }
        .widget-support-wrap .phone {
          color: #007bff;
          font-size: 16px;
          text-decoration: none;
        }
        .widget-support-wrap small {
          display: block;
          font-size: 12px;
          color: #6c757d;
        }
        .form-policy {
          margin-top: 20px;
        }
        .checkbox-list {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .custom-checkbox {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 1px solid #ddd;
          border-radius: 3px;
          position: relative;
        }
        .checkbox-list input:checked + .custom-checkbox::after {
          content: '✔';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #007bff;
        }
        .button-primary {
          position: relative;
          display: inline-block;
          padding: 10px 20px;
          font-size: 16px;
          font-weight: 600;
          text-align: center;
          border: none;
          border-radius: 4px;
          background: #007bff;
          color: #fff;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .button-primary:disabled {
          cursor: not-allowed;
          opacity: 0.6;
          background: #6c757d;
        }
        #card-element {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
      `}</style>
      <div className="col-lg-8 right-sidebar">
        <div className="booking-form-wrap">
          <form onSubmit={handleSubmit} id="booking-form" ref={formRef}>
            <input type="hidden" name="client_secret" value={clientSecret} />
            <input type="hidden" name="appliedCouponCode" value={couponCode} />
            {!isShow && cart.items[0] && (
              <>
                <input type="hidden" name="packageId" value={cart.items[0].packageId._id} />
                <input type="hidden" name="quantity" value={quantities[0] || cart.items[0].quantity} />
              </>
            )}
            {isShow &&
              cart.items.map((item, index) => (
                <div key={index}>
                  <input type="hidden" name={`items[${index}][packageId]`} value={item.packageId._id} />
                  <input type="hidden" name={`items[${index}][quantity]`} value={quantities[index] || item.quantity} />
                </div>
              ))}
            <div className="booking-content">
              <div className="form-title">
                <span>1</span>
                <h3>Your Details</h3>
              </div>
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>First name*</label>
                    <input
                      type="text"
                      className="form-control"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Last name*</label>
                    <input
                      type="text"
                      className="form-control"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Email*</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Confirm Email*</label>
                    <input
                      type="email"
                      className="form-control"
                      name="confirm_email"
                      value={formData.confirm_email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Phone*</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="booking-content">
              <div className="form-title">
                <span>2</span>
                <h3>Payment Information</h3>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="form-group">
                    <label>Name on card*</label>
                    <input
                      type="text"
                      className="form-control"
                      name="firstname_booking"
                      value={formData.firstname_booking}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="row align-items-center">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Card Details*</label>
                        <div id="card-element">
                          <CardElement
                            options={{
                              style: {
                                base: {
                                  fontSize: '16px',
                                  color: '#32325d',
                                  '::placeholder': { color: '#aab7c4' },
                                },
                              },
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <img src="/assets/images/cards.png" alt="Cards" style={{ maxWidth: '200px' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="booking-content">
              <div className="form-title">
                <span>3</span>
                <h3>Billing Address</h3>
              </div>
              <div className="row">
                <div className="col-sm-12">
                  <div className="form-group">
                    <label>Country*</label>
                    <select
                      className="form-control"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select your country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                    </select>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Street line 1*</label>
                    <input
                      type="text"
                      name="street_1"
                      className="form-control"
                      value={formData.street_1}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Street line 2</label>
                    <input
                      type="text"
                      name="street_2"
                      className="form-control"
                      value={formData.street_2}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-6 col-sm-12">
                  <div className="form-group">
                    <label>City*</label>
                    <input
                      type="text"
                      name="city"
                      className="form-control"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-3 col-sm-6">
                  <div className="form-group">
                    <label>State*</label>
                    <input
                      type="text"
                      name="state"
                      className="form-control"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-3 col-sm-6">
                  <div className="form-group">
                    <label>Postal code</label>
                    <input
                      type="text"
                      name="postal_code"
                      className="form-control"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-12 col-sm-12">
                  <div className="form-group">
                    <label>Additional Information</label>
                    <textarea
                      rows="6"
                      name="notes"
                      className="form-control"
                      placeholder="Notes about your order, e.g. special notes for delivery"
                      value={formData.notes}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div className="form-policy">
              <h3>Cancellation policy</h3>
              <div className="form-group">
                <label className="checkbox-list">
                  <input
                    type="checkbox"
                    name="accept_terms"
                    checked={formData.accept_terms}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="custom-checkbox"></span>
                  I accept terms and conditions and general policy.
                </label>
              </div>
              <button type="submit" className="button-primary" disabled={submitting || !stripe}>
                <span className="">{submitting ? 'Processing...' : 'Book Now'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="col-lg-4">
        <aside className="sidebar">
          <div className="widget-table-summary">
            <h4 className="bg-title">Summary</h4>
            <table>
              <tbody>
                {cart.items.length > 0 ? (
                  cart.items.map((item, index) => (
                    <tr key={item.packageId._id} data-price={item.packageId.salePrice || item.packageId.regularPrice}>
                      <td>
                        <strong>{item.packageId.title}</strong>
                        <div className="quantity-control">
                          <button
                            className="btn btn-sm btn-outline-secondary decrease-quantity"
                            onClick={() => updateQuantity(index, item.packageId._id, (quantities[index] || item.quantity) - 1)}
                          >
                            -
                          </button>
                          <span className="quantity">{quantities[index] || item.quantity}</span>
                          <button
                            className="btn btn-sm btn-outline-secondary increase-quantity"
                            onClick={() => updateQuantity(index, item.packageId._id, (quantities[index] || item.quantity) + 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="text-right">
                        ${(quantities[index] || item.quantity) * (item.packageId.salePrice || item.packageId.regularPrice).toFixed(2)}
                        (x<span>{quantities[index] || item.quantity}</span>)
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2">No items in cart</td>
                  </tr>
                )}
                <tr>
                  <td>
                    <strong>Dedicated tour guide</strong>
                  </td>
                  <td className="text-right">$34.00</td>
                </tr>
                <tr>
                  <td>
                    <strong>Insurance</strong>
                  </td>
                  <td className="text-right">$34.00</td>
                </tr>
                <tr>
                  <td>
                    <strong>Tax (13%)</strong>
                  </td>
                  <td className="text-right">${tax.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Discount</strong>
                  </td>
                  <td className="text-right">-${discount.toFixed(2)}</td>
                </tr>
                <tr className="total">
                  <td>
                    <strong>Total cost</strong>
                  </td>
                  <td className="text-right">
                    <strong>${total.toFixed(2)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="widget-coupon-apply">
            <h4 className="bg-title">Apply Coupon</h4>
            <div className="input-group">
              <input
                type="text"
                id="coupon-input"
                className="form-control"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.trim())}
              />
              <button
                type="button"
                className="button-primary"
                onClick={() => {
                  if (couponCode) {
                    applyCoupon(couponCode);
                  } else {
                    toast.error('Please enter a coupon code');
                  }
                }}
                style={{ display: appliedCoupon ? 'none' : 'inline-block', background: '#007bff' }}
              >
                <span className="text-white">Apply</span>
              </button>
              <button
                type="button"
                className="button-primary"
                onClick={removeCoupon}
                style={{ display: appliedCoupon ? 'inline-block' : 'none', background: '#dc3545' }}
              >
                <span className="text-white">Remove</span>
              </button>
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                fetchCoupons();
              }}
              style={{ display: 'block', marginTop: '10px', color: '#007bff', textDecoration: 'underline', fontSize: '14px' }}
            >
              Available Coupons
            </a>
          </div>
          <div className="widget-support-wrap">
            <div className="icon">
              <i className="fas fa-phone-volume"></i>
            </div>
            <div className="support-content">
              <h5>HELP AND SUPPORT</h5>
              <a href="tel:+1123488900" className="phone">
                +11 234 889 00
              </a>
              <small>Monday to Friday 9.00am - 7.30pm</small>
            </div>
          </div>
        </aside>
        {showCoupons && (
          <CouponPopup
            coupons={coupons}
            onApply={async (code) => {
              await applyCoupon(code);
              setCouponCode(code);
              setShowCoupons(false);
            }}
            onClose={() => setShowCoupons(false)}
          />
        )}
      </div>
    </div>
  );
}

function BookingPage() {
  const { user, userType } = useSelector((state) => state.auth);
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [userData, setUserData] = useState(null);
  const [stripeKey, setStripeKey] = useState('');
  const [loading, setLoading] = useState(true);
  const isShow = !packageId;

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        if (!user || userType !== 'User') {
          toast.error('Unauthorized access');
          navigate('/login');
          return;
        }

        const url = isShow
          ? `${import.meta.env.VITE_API_URL}/api/client/packageCart/checkout`
          : `${import.meta.env.VITE_API_URL}/api/client/bookPackage/${packageId}`;
        const response = await axios.get(url, { withCredentials: true });

        if (response.data.success) {
          setCart(response.data.cart);
          setUserData(response.data.user);
          setStripeKey(response.data.stripeKey);
        } else {
          toast.error(response.data.message || 'Failed to load booking data');
          navigate('/package-cart');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Server error');
        navigate('/package-cart');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [navigate, user, userType, packageId, isShow]);

  if (loading) {
    return <Loader />;
  }

  if (!cart.items.length) {
    return (
      <>
        <section className="inner-banner-wrap">
          <div className="inner-baner-container" style={{ backgroundImage: 'url(/assets/images/inner-banner.jpg)' }}>
            <div className="container">
              <div className="inner-banner-content">
                <h1 className="inner-title">Booking</h1>
              </div>
            </div>
          </div>
          <div className="inner-shape"></div>
        </section>
        <div className="container text-center">
          <h3>No items to book</h3>
          <Link to="/tour-packages">Continue Shopping</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <section className="inner-banner-wrap">
        <div className="inner-baner-container" style={{ backgroundImage: 'url(/assets/images/inner-banner.jpg)' }}>
          <div className="container">
            <div className="inner-banner-content">
              <h1 className="inner-title">Booking</h1>
            </div>
          </div>
        </div>
        <div className="inner-shape"></div>
      </section>
      <div className="step-section booking-section">
        <div className="container">
          <div className="step-link-wrap">
            {isShow && (
              <div className="step-item active">
                Your cart
                <a href="#" className="step-icon"></a>
              </div>
            )}
            <div className="step-item active">
              Your Details
              <a href="#" className="step-icon"></a>
            </div>
            <div className="step-item">
              Finish
              <a href="#" className="step-icon"></a>
            </div>
          </div>
          <Elements stripe={loadStripe(stripeKey)}>
            <BookingForm cart={cart} user={userData} isShow={isShow} stripeKey={stripeKey} />
          </Elements>
        </div>
      </div>
    </>
  );
}

export default BookingPage;