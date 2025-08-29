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
          if (data.redirect) {
            toast[data.type](data.message);
            navigate(data.redirect);
          } else {
            setDashboardData(data);
            // toast.success(data.message);
          }
        } else {
          toast[data.type](data.message);
          navigate('/error');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error(error.response?.data?.message || 'Failed to load dashboard');
        navigate('/error');
      } finally {
        setLoading(false);
      }
    };

    if (['admin', 'agent'].includes(userType)) {
      fetchDashboardData();
    } else {
      navigate('/error');
    }
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!dashboardData) {
    return null;
  }

  const { agentCount, usersCount, productEarnings, packageEarnings, bookings, enquiries, packages, products, faqs } = dashboardData;

  return (
    <div className="db-info-wrap">
      <div className="row">
        <div className="col-xl-3 col-sm-6">
          <div className="db-info-list">
            <div className="dashboard-stat-icon bg-blue">
              <i className="fas fa-user-shield"></i>
            </div>
            <div className="dashboard-stat-content">
              <h4>Agents</h4>
              <h5>{agentCount.toLocaleString()}</h5>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-sm-6">
          <div className="db-info-list">
            <div className="dashboard-stat-icon bg-purple">
              <i className="fas fa-users"></i>
            </div>
            <div className="dashboard-stat-content">
              <h4>Users</h4>
              <h5>{usersCount.toLocaleString()}</h5>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-sm-6">
          <div className="db-info-list">
            <div className="dashboard-stat-icon bg-green">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div className="dashboard-stat-content">
              <h4>Product Earnings</h4>
              <h5>${productEarnings.toLocaleString()}</h5>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-sm-6">
          <div className="db-info-list">
            <div className="dashboard-stat-icon bg-green">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div className="dashboard-stat-content">
              <h4>Package Earnings</h4>
              <h5>${packageEarnings.toLocaleString()}</h5>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="dashboard-box">
            <h4>Recent Bookings</h4>
            <p>Latest bookings for packages and products</p>
            <div className="table-responsive">
              <table className="table">
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
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center">No bookings available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6">
          <div className="dashboard-box">
            <h4>Packages</h4>
            <p>Recent travel packages</p>
            <div className="table-responsive">
              <table className="table">
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
                  {packages.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center">No packages available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="dashboard-box">
            <h4>Products</h4>
            <p>Recent products</p>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center">No products available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6">
          <div className="dashboard-box">
            <h4>Contact Enquiries</h4>
            <p>Latest contact enquiries</p>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Message</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center">No enquiries available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="dashboard-box">
            <h4>FAQs</h4>
            <p>Recent frequently asked questions</p>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Message</th>
                    <th>Answer</th>
                  </tr>
                </thead>
                <tbody>
                  {faqs.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center">No FAQs available</td>
                    </tr>
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