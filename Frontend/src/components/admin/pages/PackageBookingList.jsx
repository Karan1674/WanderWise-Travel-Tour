import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import DeleteModal from './DeleteModal';
import Pagination from './Pagination';
import { setBookingsData, removeBooking } from '../../../redux/slices/packageBookingSlice';

function PackageBookingList() {
  const { user, userType } = useSelector((state) => state.auth);
  const { allBookings, totalPages, currentPage, search, statusFilter } = useSelector((state) => state.packageBookings);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get('page')) || 1;
  const initialSearch = queryParams.get('search') || '';
  const initialStatusFilter = queryParams.get('statusFilter') || 'all';

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/package-bookings`, {
          params: { page: initialPage, search: initialSearch, statusFilter: initialStatusFilter },
          withCredentials: true,
        });
        const data = response.data;
        if (data.success) {
          dispatch(setBookingsData({
            allBookings: data.bookings,
            totalPages: data.totalPages,
            currentPage: data.currentPage,
            search: data.search,
            statusFilter: data.statusFilter,
          }));
        } else {
          toast.error(data.message || 'Failed to load bookings');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Server error fetching bookings');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (['admin', 'agent'].includes(userType)) {
      fetchBookings();
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
    navigate(`/package-bookings${newUrl}`);
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
    <div className="db-info-wrap db-booking">
      <div className="row">
        <div className="col-lg-12">
          <div className="dashboard-box table-opp-color-box">
            <h4 className="title">Recent Bookings</h4>
            <p className="subtitle">Manage bookings and enquiries for travel packages</p>
            <div className="controls">
              <form id="search-form" onSubmit={handleSearchSubmit} style={{flex: '1', marginRight: '20px'}}>
                <div className="form-group" style={{display: 'flex', alignItems: 'center', position: 'relative'}}>
                  <input
                    type="text"
                    name="search"
                    id="search-input"
                    placeholder="Search by package name or status"
                    defaultValue={search}
                    className="search-input"
                    style={{width: '70%', padding: '8px 40px 8px 8px', border: '1px solid #ddd', borderRadius: '4px', marginRight: '10px'}}
                  />
                  <select
                    name="statusFilter"
                    id="status-filter"
                    defaultValue={statusFilter}
                    className="status-filter"
                    style={{width: '30%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button type="submit" aria-label="Search bookings" className="search-button" style={{position: 'absolute', right: '40px', background: 'none', border: 'none', cursor: 'pointer'}}>
                    <i className="fas fa-search" style={{color: '#007bff'}}></i>
                  </button>
                </div>
              </form>
            </div>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Date</th>
                    <th>Booking ID</th>
                    <th>Status</th>
                    <th>People</th>
                    <th>Updated By</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allBookings && allBookings.length > 0 ? (
                    allBookings.map((booking) => (
                      <tr key={booking._id}>
                        <td>
                          <span className="list-img">
                            <img
                              src={user.profilePic ? `${import.meta.env.VITE_API_URL}/Uploads/profiles/${user.profilePic}` : '/assets/images/favicon.png'}
                              alt="Profile"
                            />
                          </span>
                          <span className="list-enq-name">
                            {booking.userId ? `${booking.userId.firstName} ${booking.userId.lastName}` : 'Unknown User'}
                          </span>
                        </td>
                        <td>{booking.userId?.email || 'N/A'}</td>
                        <td>
                          {booking.createdAt
                            ? new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'N/A'}
                        </td>
                        <td>{booking._id || 'N/A'}</td>
                        <td>
                          <span
                            className={`badge badge-${
                              booking.status === 'approved' ? 'success' : booking.status === 'pending' ? 'primary' : booking.status === 'rejected' ? 'danger' : 'secondary'
                            }`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-success">
                            {booking.items ? booking.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0}
                          </span>
                        </td>
                        <td>
                          {booking.updatedBy ? `${booking.updatedBy.firstName} ${booking.updatedBy.lastName}` : ''}
                        </td>
                        <td>
                          <Link
                            to={`/package-booking/edit/${booking._id}`}
                            className="badge badge-success text-white"
                            title="Edit Booking"
                          >
                            <i className="far fa-edit"></i>
                          </Link>
                          {booking.status === 'rejected' && (
                            <span
                              className="badge badge-danger delete-btn"
                              data-toggle="modal"
                              data-target={`#deleteBookingModal_${booking._id}`}
                              aria-label="Delete Booking"
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
                        No bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {allBookings && allBookings.length > 0 &&
              allBookings.map((booking) => (
                booking.status === 'rejected' && (
                  <DeleteModal
                    key={`deleteBookingModal_${booking._id}`}
                    modalId={`deleteBookingModal_${booking._id}`}
                    entityName="Booking"
                    apiEndpoint={`${import.meta.env.VITE_API_URL}/api/admin/package-booking/delete/${booking._id}`}
                    entityId={booking._id}
                    deleteCallback={removeBooking}
                  />
                )
              ))}
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

export default PackageBookingList;