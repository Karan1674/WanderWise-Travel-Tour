import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../layouts/Loader';

function UserPackageBookings() {
  const { user, userType } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [userData, setUserData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        if (!user || userType !== 'User') {
          toast.error('Unauthorized access');
          navigate('/login');
          return;
        }

        const page = parseInt(searchParams.get('page')) || 1;
        const searchQuery = searchParams.get('search') || '';

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/client/user-package-bookings`,
          {
            params: { page, search: searchQuery },
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setBookings(response.data.bookings);
          setUserData(response.data.user);
          setCurrentPage(response.data.currentPage);
          setTotalPages(response.data.totalPages);
          setLimit(response.data.limit);
          setSearch(response.data.search);
        } else {
          toast.error(response.data.message || 'Failed to load bookings');
          navigate('/tour-packages');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Server error');
        navigate('/tour-packages');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate, user, userType, searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ page: '1', search });
  };

  const handlePageChange = (page) => {
    setSearchParams({ page: page.toString(), search });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <section className="inner-banner-wrap">
        <div className="inner-baner-container" style={{ backgroundImage: 'url(/assets/images/inner-banner.jpg)' }}>
          <div className="container">
            <div className="inner-banner-content">
              <h1 className="inner-title">My Bookings</h1>
            </div>
          </div>
        </div>
        <div className="inner-shape"></div>
      </section>
      <div className="package-section">
        <div className="container-xxl px-5 mx-5">
          <form id="search-form" onSubmit={handleSearch} style={{ flex: 1, marginBottom: '20px' }}>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <input
                type="text"
                name="search"
                id="search-input"
                placeholder="Search by Booking ID, Package Title, or Payment Status"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 40px 8px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <button
                type="submit"
                aria-label="Search packages"
                style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <i className="fas fa-search" style={{ color: '#007bff' }}></i>
              </button>
            </div>
          </form>
          <div className="dashboard-box">
            {bookings.length > 0 ? (
              <>
                <div className="">
                  <table className="table" style={{ whiteSpace: 'nowrap' }}>
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Booking ID</th>
                        <th>Package Name</th>
                        <th>Quantity</th>
                        <th>Total Cost</th>
                        <th>Payment Status</th>
                        <th>Booking Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking, index) =>
                        booking.items.map((item, itemIndex) => (
                          <tr key={`${booking._id}-${itemIndex}`}>
                            {itemIndex === 0 && (
                              <>
                                <td rowSpan={booking.items.length}>
                                  <span>{(currentPage - 1) * limit + index + 1}.</span>
                                </td>
                                <td rowSpan={booking.items.length}>
                                  <span>{booking._id}</span>
                                </td>
                              </>
                            )}
                            <td>
                              <Link
                                to={`/package-detail/${item.packageId?._id}`}
                                className="package-name"
                              >
                                {item.packageId?.title || 'Unknown'}
                              </Link>
                            </td>
                            <td>{item.quantity}</td>
                            {itemIndex === 0 && (
                              <>
                                <td rowSpan={booking.items.length}>${(booking.total || 0).toFixed(2)}</td>
                                <td rowSpan={booking.items.length}>
                                  {booking.payment?.paymentStatus || 'Unknown'}
                                </td>
                                <td rowSpan={booking.items.length}>
                                  {new Date(booking.createdAt).toLocaleDateString()}
                                </td>
                                <td rowSpan={booking.items.length}>
                                  <span
                                    className={`badge badge-${
                                      booking.status === 'approved'
                                        ? 'success'
                                        : booking.status === 'rejected'
                                        ? 'danger'
                                        : 'primary'
                                    }`}
                                  >
                                    {booking.status === 'approved'
                                      ? 'Approve'
                                      : booking.status === 'rejected'
                                      ? 'Reject'
                                      : 'Pending'}
                                  </span>
                                </td>
                                <td rowSpan={booking.items.length}>
                                  <Link
                                    to={`/confirmation/${booking._id}?isShowAll=false`}
                                    className="text-white px-2 py-1"
                                    style={{ backgroundColor: '#0791BE' }}
                                  >
                                    See Details
                                  </Link>
                                </td>
                              </>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="pagination">
                  {currentPage > 1 ? (
                    <Link
                      to={`/userBookingPage?page=${currentPage - 1}${
                        search ? `&search=${encodeURIComponent(search)}` : ''
                      }`}
                      className="pagination-link pagination-prev"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </Link>
                  ) : (
                    <span className="pagination-link pagination-disabled">
                      <i className="fas fa-chevron-left"></i>
                    </span>
                  )}
                  {(() => {
                    const maxPagesToShow = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
                    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
                    if (endPage - startPage < maxPagesToShow - 1) {
                      startPage = Math.max(1, endPage - maxPagesToShow + 1);
                    }
                    const pages = [];
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <Link
                          key={i}
                          to={`/userBookingPage?page=${i}${
                            search ? `&search=${encodeURIComponent(search)}` : ''
                          }`}
                          className={`pagination-link ${i === currentPage ? 'active' : ''}`}
                        >
                          {i}
                        </Link>
                      );
                    }
                    return pages;
                  })()}
                  {currentPage < totalPages ? (
                    <Link
                      to={`/userBookingPage?page=${currentPage + 1}${
                        search ? `&search=${encodeURIComponent(search)}` : ''
                      }`}
                      className="pagination-link pagination-next"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </Link>
                  ) : (
                    <span className="pagination-link pagination-disabled">
                      <i className="fas fa-chevron-right"></i>
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="d-flex flex-column align-items-center">
                <span className="text-secondary" style={{ fontSize: '17px' }}>
                  No bookings found
                </span>
                <Link to="/tour-packages" className="mt-2">
                  <button className="button-secondary">Explore Tours</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table th,
        .table td {
          padding: 12px 30px;
          text-align: left;
          vertical-align: middle;
        }

        .table th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #333;
          text-align:center;

        }

        .table td {
          font-size: 16px;
          color: #555;
          text-align:center;

        }

        .package-name {
          color: #0791be;
          text-decoration: none;
          cursor: pointer;
        }

        .package-name:hover {
          text-decoration: underline;
        }

        .badge {
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 14px;
        }

        .badge-success {
          background-color: #28a745;
          color: #fff;
        }

        .badge-danger {
          background-color: #dc3545;
          color: #fff;
        }

        .badge-primary {
          background-color: #007bff;
          color: #fff;
        }

        .pagination {
          margin-top: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
        }

        .pagination-link {
          padding: 12px 12px;
          font-size: 12px;
          font-weight: 600;
          color: #007bff;
          background: #fff;
          border: 2px solid #007bff;
          text-decoration: none;
          transition: all 0.3s ease;
          min-width: 44px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pagination-link:hover {
          background: #007bff;
          color: #fff !important;
          border-color: #007bff;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .pagination-link.active {
          background: #007bff;
          color: #fff !important;
          border-color: #007bff;
          cursor: default;
          transform: none;
          box-shadow: none;
        }

        .pagination-link.pagination-disabled {
          color: #adb5bd;
          border-color: #adb5bd;
          background: #f1f3f5;
          cursor: not-allowed;
        }

        .pagination-link.pagination-disabled:hover {
          background: #f1f3f5;
          color: #ffff;
          transform: none;
        }

        .pagination-link.pagination-prev,
        .pagination-link.pagination-next {
          padding: 12px 16px;
          font-size: 18px;
        }
      
      `}</style>
    </>
  );
}

export default UserPackageBookings;