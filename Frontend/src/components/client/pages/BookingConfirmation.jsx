import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../layouts/Loader';

function BookingConfirmation() {
  const { user, userType } = useSelector((state) => state.auth);
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isShow, setIsShow] = useState(false);
  const [isShowAll, setIsShowAll]= useState(true)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfirmationData = async () => {
      try {
        if (!user || userType !== 'User') {
          toast.error('Unauthorized access');
          navigate('/login');
          return;
        }

        if (!bookingId) {
          toast.error('No booking ID provided');
          navigate('/tour-packages');
          return;
        }

        // Get isShow from query parameter
        const query = new URLSearchParams(location.search);
        const isShowParam = query.get('isShow') === 'true';
        const isShowAllParam = query.get('isShowAll') === 'true' 
        setIsShow(isShowParam);
        setIsShowAll(isShowAllParam);

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/client/booking/${bookingId}`,
          { withCredentials: true }
        );

        if (response.data.success) {
          setBooking(response.data.booking);
          setPaymentDetails(response.data.paymentDetails);
        } else {
          toast.error(response.data.message || 'Failed to load confirmation data');
          navigate('/tour-packages');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Server error');
        navigate('/tour-packages');
      } finally {
        setLoading(false);
      }
    };

    fetchConfirmationData();
  }, [navigate, user, userType, bookingId, location.search]);

  if (loading) {
    return <Loader />;
  }

  if (!booking) {
    return (
      <>
        <section className="inner-banner-wrap">
          <div className="inner-baner-container" style={{ backgroundImage: 'url(/assets/images/inner-banner.jpg)' }}>
            <div className="container">
              <div className="inner-banner-content">
                <h1 className="inner-title">Booking Confirmation</h1>
              </div>
            </div>
          </div>
          <div className="inner-shape"></div>
        </section>
        <div className="container text-center">
          <h3>No booking found</h3>
          <Link to="/tour-packages">Continue Shopping</Link>
        </div>
      </>
    );
  }

  const subtotal = booking.items.reduce((sum, item) => {
    if (item && item.packageId && (item.packageId.salePrice || item.packageId.regularPrice) && item.quantity) {
      return sum + item.quantity * (item.packageId.salePrice || item.packageId.regularPrice);
    }
    return sum;
  }, 0);
  const tax = (subtotal - (booking.discount || 0)) * 0.13;
  const total = subtotal + 34 + 34 + tax - (booking.discount || 0);

  return (
    <>
      <section className="inner-banner-wrap">
        <div className="inner-baner-container" style={{ backgroundImage: 'url(/assets/images/inner-banner.jpg)' }}>
          <div className="container">
            <div className="inner-banner-content">
              <h1 className="inner-title">Booking Confirmation</h1>
            </div>
          </div>
        </div>
        <div className="inner-shape"></div>
      </section>
      <div className="step-section cart-section">
        <div className="container">
       {isShowAll && (
       
          <div className="step-link-wrap">
            {isShow && (
              <div className="step-item active">
                Your cart
                <Link to="#" className="step-icon"></Link>
              </div>
            )}
            <div className="step-item active">
              Your Details
              <Link to="#" className="step-icon"></Link>
            </div>
            <div className="step-item active">
              Finish
              <Link to="#" className="step-icon"></Link>
            </div>
          </div>
          )}
          <div className="confirmation-outer">
          {isShowAll && (
            <div className="success-notify">
              <div className="success-icon">
                <i className="fas fa-check"></i>
              </div>
              <div className="success-content">
                <h3>PAYMENT CONFIRMED</h3>
                <p>
                  Thank you, your payment has been successful and your booking is now confirmed. A confirmation email has
                  been sent to {booking.userDetails?.email || 'your email'}.
                </p>
              </div>
            </div>
             )}
            <div className="confirmation-inner">
              <div className="row">
                <div className="col-lg-8 right-sidebar">
                  <div className="confirmation-details">
                    <h3>BOOKING DETAILS</h3>
                    <table className="table">
                      <tbody>
                        <tr>
                          <td>Booking ID:</td>
                          <td>{booking._id || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td>First Name:</td>
                          <td>{booking.userDetails?.firstname  || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td>Last Name:</td>
                          <td>{booking.userDetails?.lastname  || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td>Email:</td>
                          <td>{booking.userDetails?.email  || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td>Phone:</td>
                          <td>{booking.userDetails?.phone  || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td>Country:</td>
                          <td>{booking.userDetails?.country || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td>Zip Code:</td>
                          <td>{booking.userDetails?.postal_code || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td>Address:</td>
                          <td>
                            {booking.userDetails?.street_1 || ''}
                            {booking.userDetails?.street_2 ? `, ${booking.userDetails.street_2}` : ''}
                            {booking.userDetails?.city ? `, ${booking.userDetails.city}` : ''}
                            {booking.userDetails?.state ? `, ${booking.userDetails.state}` : ''}
                          </td>
                        </tr>
                        <tr>
                          <td>Notes:</td>
                          <td>{booking.userDetails?.notes || 'None'}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="details payment-details">
                      <h3>PAYMENT</h3>
                      <div className="details-desc">
                        {booking.payment?.paymentStatus ? (
                          <p>
                            Payment{' '}
                            {booking.payment.paymentStatus === 'succeeded'
                              ? `successful via ${paymentDetails?.cardBrand || 'card'} ending in ${
                                  paymentDetails?.last4 || 'N/A'
                                }`
                              : booking.payment.paymentStatus}
                          </p>
                        ) : (
                          <p>Payment status unknown</p>
                        )}
                      </div>
                      <div className="details-desc">
                        {booking.payment?.paymentType ? (
                          <p>
                            Payment{' '}
                            {booking.payment.paymentType === 'deposit' ? 'deposited successfully' : 'refunded successfully'}
                          </p>
                        ) : (
                          <p>Payment type unknown</p>
                        )}
                      </div>
                    </div>
                    <div className="details">
                      <h3>VIEW BOOKING DETAILS</h3>
                      <div className="details-desc">
                        <p>
                          <Link to={`booking/${booking._id || '#'}`}>
                            https://www.wanderwise.com/booking/{booking._id || 'N/A'}
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <aside className="sidebar">
                    <div className="widget-bg widget-table-summary">
                      <h4 className="bg-title">Summary</h4>
                      <table>
                        <tbody>
                          {booking.items?.length > 0 ? (
                            booking.items.map((item, index) => (
                              <tr key={index}>
                                <td>
                                  <strong>{item.packageId?.title || 'N/A'}</strong>
                                </td>
                                <td className="text-right">
                                  $
                                  {(
                                    item.quantity * (item.packageId?.salePrice || item.packageId?.regularPrice || 0)
                                  ).toFixed(2)}{' '}
                                  (x{item.quantity})
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="2">No items in booking</td>
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
                            <td className="text-right">-${(booking.discount || 0).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td>
                              <strong>Applied Coupon Code</strong>
                            </td>
                            <td className="text-right">{booking.couponCode || 'None'}</td>
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
                    <div className="widget-bg widget-support-wrap">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BookingConfirmation;