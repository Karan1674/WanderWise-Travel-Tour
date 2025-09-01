import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function PackageBookingEdit() {
  const { user, userType } = useSelector((state) => state.auth);
  const { allBookings } = useSelector((state) => state.packageBookings);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {

        const storedBooking = allBookings.find((b) => b._id === bookingId);
        if (storedBooking) {
          setBooking(storedBooking);
          setStatus(storedBooking.status);
          setLoading(false);
          return;
        }


        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/package-booking/edit/${bookingId}`, {
          withCredentials: true,
        });
        const data = response.data;
        if (data.success && data.booking) {
          setBooking(data.booking);
          setStatus(data.booking.status);

        } else {
          toast.error(data.message || 'Booking not found');
          navigate('/db-bookings');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error('Server error fetching booking');
      } finally {
        setLoading(false);
      }
    };

    if (['admin', 'agent'].includes(userType)) {
      fetchBooking();
    } else {
      toast.error('Unauthorized access');
      navigate('/');
    }
  }, [bookingId, userType, navigate, allBookings, dispatch]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/package-booking/edit/${bookingId}`,
        { status },
        { withCredentials: true }
      );
      const data = response.data;
      if (data.success) {
        toast.success(data.message || 'Booking updated successfully');
        navigate(-1);
      } else {
        toast.error(data.message || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Server error updating booking');
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
          <div className="dashboard-box" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '25px' }}>
              <h4 style={{ margin: 0, color: '#2c3e50', fontSize: '1.8rem', fontWeight: 600 }}>Package Booking Details</h4>
              <div className="form-group" style={{ textAlign: 'right' }}>
                <Link to="/db-bookings" className="btn btn-danger">Back to List</Link>
              </div>
            </div>
            {/* Container 1: Basic Information */}
            <div className="card mb-4" style={{ borderRadius: '10px', border: '1px solid #e9ecef' }}>
              <div className="card-header" style={{ background: '#f8f9fa', fontWeight: 600, color: '#2c3e50' }}>Basic Information</div>
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>Booking ID</label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>{booking._id || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>Total Amount</label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>{booking.total ? `$${booking.total.toFixed(2)}` : 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>Total People</label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {booking.items ? booking.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0}
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>Status</label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>Payment Status</label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {booking.payment ? booking.payment.paymentStatus.charAt(0).toUpperCase() + booking.payment.paymentStatus.slice(1) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>Payment Type</label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {booking.payment ? booking.payment.paymentType.charAt(0).toUpperCase() + booking.payment.paymentType.slice(1) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Container 2: Items */}
            <div className="card mb-4" style={{ borderRadius: '10px', border: '1px solid #e9ecef' }}>
              <div className="card-header" style={{ background: '#f8f9fa', fontWeight: 600, color: '#2c3e50' }}>Packages</div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Package Name</th>
                        <th>Quantity</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {booking.items && booking.items.length > 0 ? (
                        booking.items.map((item, index) => (
                          <tr key={index}>
                            <td
                              style={{ cursor: 'pointer', color: '#0056b3' }}
                              onClick={() => navigate(`/package-preview/${item.packageId?._id || ''}`)}
                            >
                              {item.packageId?.title || 'Unknown Package'}
                            </td>
                            <td>{item.quantity || 1}</td>
                            <td>{item.price ? `$${item.price.toFixed(2)}` : 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3">No packages</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* Container 3: User Details */}
            <div className="card mb-4" style={{ borderRadius: '10px', border: '1px solid #e9ecef' }}>
              <div className="card-header" style={{ background: '#f8f9fa', fontWeight: 600, color: '#2c3e50' }}>User Details</div>
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>First Name</label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>{booking.userDetails?.firstName || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>Last Name</label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>{booking.userDetails?.lastName || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>Email</label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>{booking.userDetails?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>Phone</label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>{booking.userDetails?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>Country</label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>{booking.userDetails?.country || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>Street Address</label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {booking.userDetails
                          ? `${booking.userDetails.street_1}${booking.userDetails.street_2 ? ', ' + booking.userDetails.street_2 : ''}`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>City</label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>{booking.userDetails?.city || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>State</label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>{booking.userDetails?.state || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>Postal Code</label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>{booking.userDetails?.postal_code || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>Notes</label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>{booking.userDetails?.notes || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Container 4: Audit Information */}
            <div className="card mb-4" style={{ borderRadius: '10px', border: '1px solid #e9ecef' }}>
              <div className="card-header" style={{ background: '#f8f9fa', fontWeight: 600, color: '#2c3e50' }}>Audit Information</div>
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>Created At</label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>Updated At</label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {booking.updatedAt ? new Date(booking.updatedAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>Updated By</label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {booking.updatedBy
                          ? `${booking.updatedBy.firstName} ${booking.updatedBy.lastName} (${booking.updatedBy.email})`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>Updated By Model</label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>{booking.updatedByModel || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Container 5: Edit Status */}
            <div className="card mb-4" style={{ borderRadius: '10px', border: '1px solid #e9ecef' }}>
              <div className="card-header" style={{ background: '#f8f9fa', fontWeight: 600, color: '#2c3e50' }}>Edit Status</div>
              <div className="card-body">
                {booking.status !== 'rejected' ? (
                  <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label htmlFor="status" style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>Status</label>
                      <select
                        name="status"
                        id="status"
                        value={status}
                        onChange={handleStatusChange}
                        className="form-control"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ textAlign: 'right', marginBottom: '1.75rem' }}>
                      <button type="submit" className="btn btn-primary">Update Status</button>
                    </div>
                  </form>
                ) : (
                  <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                    This booking is rejected and cannot be edited.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PackageBookingEdit;