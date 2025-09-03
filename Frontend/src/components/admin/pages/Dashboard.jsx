import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';


function Dashboard() {
  const { user, userType } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/AdminDashboard`, {
          withCredentials: true,
        });
        const data = response.data;
        if (data.success) {
          setDashboardData(data);
        } else {
          toast.error(data.message || 'Failed to load dashboard');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error(error.response?.data?.message || 'Failed to load dashboard');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (['admin', 'agent'].includes(userType)) {
      fetchDashboardData();
    } else {
      toast.error('Unauthorized access');
      navigate('/');
    }
  }, [navigate, userType]);

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

  if (!dashboardData) {
    return null;
  }

  const { agentCount, usersCount, enquiryCount, packageEarnings, bookings, enquiries, packages, faqs } = dashboardData;

  return (

        <div className="db-info-wrap" style={{ padding: '2rem' }}>
          <div className="row">
            <div className="col-xl-3 col-sm-6">
              <div className="db-info-list">
                <div className="dashboard-stat-icon bg-blue" style={{ backgroundColor: '#1d4ed8' }}>
                  <i className="fas fa-user-shield"></i>
                </div>
                <div className="dashboard-stat-content">
                  <h4>Agents</h4>
                  <h5>{agentCount?.toLocaleString()}</h5>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6">
              <div className="db-info-list">
                <div className="dashboard-stat-icon bg-purple" style={{ backgroundColor: '#6b7280' }}>
                  <i className="fas fa-users"></i>
                </div>
                <div className="dashboard-stat-content">
                  <h4>Users</h4>
                  <h5>{usersCount?.toLocaleString()}</h5>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6">
              <div className="db-info-list">
                <div className="dashboard-stat-icon bg-green" style={{ backgroundColor: '#10b981' }}>
                  <i className="fas fa-question-circle"></i>
                </div>
                <div className="dashboard-stat-content">
                  <h4>Total Enquiries</h4>
                  <h5>{enquiryCount?.toLocaleString()}</h5>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6">
              <div className="db-info-list">
                <div className="dashboard-stat-icon bg-green" style={{ backgroundColor: '#10b981' }}>
                  <i className="fas fa-dollar-sign"></i>
                </div>
                <div className="dashboard-stat-content">
                  <h4>Package Earnings</h4>
                  <h5>${packageEarnings?.toLocaleString()}</h5>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="dashboard-box" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px' }}>
                <h4>Recent Bookings</h4>
                <p>Latest bookings for packages</p>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Date</th>
                        <th>Item</th>
                        <th>Type</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center text-muted">No bookings available</td>
                        </tr>
                      ) : (
                        bookings.map((booking, index) => (
                          <tr key={index}>
                            <td>{booking.user.name}</td>
                            <td>{booking.user.email}</td>
                            <td>{new Date(booking.bookingDate)?.toLocaleDateString()}</td>
                            <td>{booking.itemName}</td>
                            <td>{booking.type}</td>
                            <td>
                              <span
                                className={`badge badge-${
                                  booking.status === 'approved' ? 'success' : 'warning'
                                }`}
                              >
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="dashboard-box" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px' }}>
                <h4>Packages</h4>
                <p>Recent travel packages</p>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Discount</th>
                        <th>Bookings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packages.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center text-muted">No packages available</td>
                        </tr>
                      ) : (
                        packages.map((pkg) => (
                          <tr key={pkg._id}>
                            <td>
                              {pkg.featuredImage ? (
                                <img
                                  src={`${import.meta.env.VITE_API_URL}/Uploads/gallery/${pkg.featuredImage}`}
                                  alt={pkg.title}
                                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                              ) : (
                                'N/A'
                              )}
                            </td>
                            <td>{pkg.title}</td>
                            <td>${pkg.regularPrice?.toLocaleString()}</td>
                            <td>{pkg.discount ? `${pkg.discount}%` : 'N/A'}</td>
                            <td>{pkg.bookingsCount?.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
         
          </div>

          <div className="row">

          <div className="col-lg-6">
              <div className="dashboard-box" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px' }}>
                <h4>Contact Enquiries</h4>
                <p>Latest contact enquiries</p>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Date</th>
                        <th>Message</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enquiries.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">No enquiries available</td>
                        </tr>
                      ) : (
                        enquiries.map((enquiry) => (
                          <tr key={enquiry._id}>
                            <td>{enquiry.name}</td>
                            <td>{new Date(enquiry.createdAt)?.toLocaleDateString()}</td>
                            <td>{enquiry.message.length > 50 ? `${enquiry.message.substring(0, 50)}...` : enquiry.message}</td>
                            <td>
                              <span
                                className={`badge badge-${
                                  enquiry.enquiryStatus === 'pending'
                                    ? 'warning'
                                    : enquiry.enquiryStatus === 'active'
                                    ? 'success'
                                    : 'danger'
                                }`}
                              >
                                {enquiry.enquiryStatus.charAt(0).toUpperCase() + enquiry.enquiryStatus.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="dashboard-box" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px' }}>
                <h4>FAQs</h4>
                <p>Recent frequently asked questions</p>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Date</th>
                        <th>Message</th>
                        <th>Answer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {faqs.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">No FAQs available</td>
                        </tr>
                      ) : (
                        faqs.map((faq) => (
                          <tr key={faq._id}>
                            <td>{faq.name}</td>
                            <td>{new Date(faq.createdAt)?.toLocaleDateString()}</td>
                            <td>{faq.message.length > 50 ? `${faq.message.substring(0, 50)}...` : faq.message}</td>
                            <td>{faq.answer ? (faq.answer.length > 50 ? `${faq.answer.substring(0, 50)}...` : faq.answer) : 'Not answered'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

  );
}

export default Dashboard;