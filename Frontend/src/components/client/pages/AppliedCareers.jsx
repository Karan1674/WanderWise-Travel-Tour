import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../layouts/Loader';

function AppliedCareers() {
  const { user, userType } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialPage = parseInt(query.get('page')) || 1;
  const initialSearch = query.get('search') || '';
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState(initialSearch);
  const limit = 5;

  useEffect(() => {
    const fetchAppliedCareers = async () => {
      try {
        if (!user || userType !== 'User') {
          toast.error('Unauthorized access');
          navigate('/login');
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/client/applied-careers?page=${currentPage}&search=${encodeURIComponent(search)}`,
          { withCredentials: true }
        );

        if (response.data.success) {
          setApplications(response.data.applications);
          setCurrentPage(response.data.currentPage);
          setTotalPages(response.data.totalPages);
        } else {
          toast.error(response.data.message || 'Failed to load applications');
          navigate('/login');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Server error');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedCareers();
  }, [navigate, user, userType, currentPage, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    navigate(`/applied-careers?search=${encodeURIComponent(search)}&page=1`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    navigate(`/applied-careers?search=${encodeURIComponent(search)}&page=${page}`);
  };

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return null; // Redirect handled by useEffect
  }

  return (
    <>
      <section className="inner-banner-wrap">
        <div className="inner-baner-container" style={{ backgroundImage: 'url(/assets/images/inner-banner.jpg)' }}>
          <div className="container">
            <div className="inner-banner-content">
              <h1 className="inner-title">My Applied Careers</h1>
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
                placeholder="Search by Application ID, Job Title, or Status"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 40px 8px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <button
                type="submit"
                aria-label="Search applications"
                style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <i className="fas fa-search" style={{ color: '#007bff' }}></i>
              </button>
            </div>
          </form>
          <div className="dashboard-box">
            {applications && applications.length > 0 ? (
              <>
                <div className="table-responsive">
                  <table className="table" style={{ whiteSpace: 'nowrap' }}>
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Application ID</th>
                        <th>Job Title</th>
                        <th>Status</th>
                        <th>Applied Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((application, index) => (
                        <tr key={application._id}>
                          <td>{(currentPage - 1) * limit + index + 1}.</td>
                          <td>{application._id}</td>
                          <td>
                            <a href={`/careers/${application.careerId._id}`} className="package-name">
                              {application.careerId.title}
                            </a>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                application.status === 'accepted'
                                  ? 'badge-success'
                                  : application.status === 'rejected'
                                  ? 'badge-danger'
                                  : 'badge-primary'
                              }`}
                            >
                              {application.status}
                            </span>
                          </td>
                          <td>{new Date(application.appliedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pagination">
                  {currentPage > 1 ? (
                    <a
                      href={`/applied-careers?page=${currentPage - 1}&search=${encodeURIComponent(search)}`}
                      className="pagination-link pagination-prev"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage - 1);
                      }}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </a>
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
                        <a
                          key={i}
                          href={`/applied-careers?page=${i}&search=${encodeURIComponent(search)}`}
                          className={`pagination-link ${i === currentPage ? 'active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(i);
                          }}
                        >
                          {i}
                        </a>
                      );
                    }
                    return pages;
                  })()}
                  {currentPage < totalPages ? (
                    <a
                      href={`/applied-careers?page=${currentPage + 1}&search=${encodeURIComponent(search)}`}
                      className="pagination-link pagination-next"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage + 1);
                      }}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </a>
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
                  No applications found
                </span>
                <a className="mt-2" href="/careers">
                  <button className="button-secondary">Explore Careers</button>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
           .table th, .table td {
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
            color: #0791BE;
            text-decoration: none;
            cursor: pointer;
        }
        .package-name:hover {
            text-decoration: underline;
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
            color: #adb5bd;
            transform: none;
        }
        .pagination-link.pagination-prev, .pagination-link.pagination-next {
            padding: 12px 16px;
            font-size: 18px;
        }
      `}</style>
    </>
  );
}

export default AppliedCareers;