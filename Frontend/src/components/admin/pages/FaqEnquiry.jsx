import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { setFaqEnquiriesData, updateFaqEnquiry, removeFaqEnquiry } from '../../../redux/slices/faqEnquirySlice';
import Pagination from './Pagination';
import DeleteModal from './DeleteModal';


function FaqEnquiry() {
  const { userType } = useSelector((state) => state.auth);
  const { allFaqEnquiries, totalPages, currentPage, search, statusFilter } = useSelector((state) => state.faqEnquiries);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [editEnquiry, setEditEnquiry] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get('page')) || 1;
  const initialSearch = queryParams.get('search') || '';
  const initialStatusFilter = queryParams.get('statusFilter') || 'all';

  useEffect(() => {
    const fetchFaqEnquiries = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/faqEnquiry`, {
          params: { page: initialPage, search: initialSearch, statusFilter: initialStatusFilter },
          withCredentials: true,
        });
        const data = response.data;
        if (data.success) {
          dispatch(setFaqEnquiriesData({
            allFaqEnquiries: data.allFaqEnquiries,
            totalPages: data.totalPages,
            currentPage: data.currentPage,
            search: data.search,
            statusFilter: data.statusFilter,
          }));
        }
      } catch (error) {
        console.error('Error fetching FAQ enquiries:', error);
        toast.error('Error fetching FAQ enquiry list');
        navigate('/error');
      } finally {
        setLoading(false);
      }
    };

    if (['admin', 'agent'].includes(userType)) {
      fetchFaqEnquiries();
    } else {
      toast.error('Unauthorized access');
      navigate('/');
    }
  }, [navigate, initialPage, initialSearch, initialStatusFilter, userType, dispatch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newSearch = e.target.search.value.trim();
    const newStatusFilter = e.target.statusFilter.value;
    const newUrl = `?page=1${newSearch ? `&search=${encodeURIComponent(newSearch)}` : ''}${newStatusFilter !== 'all' ? `&statusFilter=${encodeURIComponent(newStatusFilter)}` : ''}`;
    navigate(`/faq-enquiry${newUrl}`);
  };

  const handleEditSubmit = async (e, enquiryId) => {
    e.preventDefault();
    const answer = e.target.answer.value.trim();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/faqEnquiry/edit/${enquiryId}`,
        { answer },
        { withCredentials: true }
      );
      const { enquiry } = response.data;
      dispatch(updateFaqEnquiry(enquiry));
      toast.success('FAQ enquiry updated successfully');
      setEditEnquiry(null);
      document.getElementById(`editModal_${enquiryId}`).classList.remove('show');
      document.body.classList.remove('modal-open');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.remove();
    } catch (error) {
      console.error('Error updating FAQ enquiry:', error);
      toast.error('Error updating FAQ enquiry');
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

  if (!allFaqEnquiries) {
    return null;
  }

  return (

        <div className="db-info-wrap">
          <div className="row">
            <div className="col-lg-12">
              <div className="dashboard-box" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div className="header-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4 style={{ margin: 0, color: '#333' }}>FAQ Enquiry List</h4>
                  <Link to="/enquiryDashboard" className="btn btn-primary" style={{ transition: 'background 0.3s' }} aria-label="Back to Enquiry Dashboard">
                    Back to Enquiry Dashboard
                  </Link>
                </div>
                <div className="package-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <form id="search-form" onSubmit={handleSearchSubmit} style={{ flex: 1, marginRight: '20px' }}>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                      <input
                        type="text"
                        name="search"
                        id="search-name"
                        placeholder="Search by Asked By"
                        defaultValue={search}
                        style={{ width: '70%', padding: '8px 40px 8px 8px', border: '1px solid #ddd', borderRadius: '4px', marginRight: '10px' }}
                      />
                      <select
                        name="statusFilter"
                        id="answer-status"
                        defaultValue={statusFilter}
                        style={{ width: '30%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      >
                        <option value="all">All</option>
                        <option value="answered">Answered</option>
                        <option value="notAnswered">Not Answered</option>
                      </select>
                      <button type="submit" aria-label="Search questions" style={{ position: 'absolute', right: '40px', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <i className="fas fa-search" style={{ color: '#007bff' }}></i>
                      </button>
                    </div>
                  </form>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Asked By</th>
                        <th>Email</th>
                        <th>Number</th>
                        <th>Answered By</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allFaqEnquiries && allFaqEnquiries.length > 0 ? (
                        allFaqEnquiries.map((question) => (
                          <tr key={question._id}>
                            <td>{question.name}</td>
                            <td>{question.email}</td>
                            <td>{question.number || '-'}</td>
                            <td>{question.answeredBy ? `${question.answeredBy.firstName} ${question.answeredBy.lastName}` : '-'}</td>
                            <td>
                              <span
                                className="badge badge-info text-white view-btn"
                                style={{ cursor: 'pointer' }}
                                data-bs-toggle="modal"
                                data-bs-target={`#viewModal_${question._id}`}
                                aria-label="View Enquiry"
                              >
                                <i className="far fa-eye"></i>
                              </span>
                              <span
                                className="badge badge-success text-white edit-btn"
                                style={{ cursor: 'pointer', marginLeft:'5px' }}
                                data-bs-toggle="modal"
                                data-bs-target={`#editModal_${question._id}`}
                                onClick={() => setEditEnquiry(question)}
                                aria-label="Edit Enquiry"
                              >
                                <i className="far fa-edit"></i>
                              </span>
                              <span
                                className="badge badge-danger delete-btn"
                                style={{ cursor: 'pointer',marginLeft:'5px' }}
                                data-bs-toggle="modal"
                                data-bs-target={`#deleteModal_${question._id}`}
                                aria-label="Delete Enquiry"
                              >
                                <i className="far fa-trash-alt"></i>
                              </span>
                            </td>
                            {/* View Modal */}
                            <div
                              className="modal fade"
                              id={`viewModal_${question._id}`}
                              tabIndex="-1"
                              aria-labelledby={`viewModalLabel_${question._id}`}
                              aria-hidden="true"
                              style={{ zIndex: 99999, top: '30px', padding: '20px' }}
                            >
                              <div className="modal-dialog modal-lg" style={{ transition: 'all 0.3s ease-in-out' }}>
                                <div className="modal-content">
                                  <div className="modal-header">
                                    <h5 className="modal-title" id={`viewModalLabel_${question._id}`}>
                                      FAQ Enquiry Details
                                    </h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"> <span aria-hidden="true">&times;</span></button>
                                  </div>
                                  <div className="modal-body">
                                    <p><strong>Name:</strong> {question.name}</p>
                                    <p><strong>Email:</strong> {question.email}</p>
                                    <p><strong>Number:</strong> {question.number || '-'}</p>
                                    <p><strong>Question:</strong> {question.message}</p>
                                    <p><strong>Answer:</strong> {question.answer || 'Not answered'}</p>
                                    <p><strong>Created At:</strong> {new Date(question.createdAt).toLocaleString()}</p>
                                    <p><strong>Answered By:</strong> {question.answeredBy ? `${question.answeredBy.firstName} ${question.answeredBy.lastName} (${question.answeredBy.email})` : '-'}</p>
                                    <p><strong>Answered At:</strong> {question.answeredAt ? new Date(question.answeredAt).toLocaleString() : '-'}</p>
                                  </div>
                                  <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                      Close
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* Edit Modal */}
                            <div
                              className="modal fade"
                              id={`editModal_${question._id}`}
                              tabIndex="-1"
                              aria-labelledby={`editModalLabel_${question._id}`}
                              aria-hidden="true"
                              style={{ zIndex: 99999, top: '30px', padding: '20px' }}
                            >
                              <div className="modal-dialog modal-lg" style={{ transition: 'all 0.3s ease-in-out' }}>
                                <div className="modal-content" style={{ overflowY: 'hidden' }}>
                                  <div className="modal-header">
                                    <h5 className="modal-title" id={`editModalLabel_${question._id}`}>
                                      Answer FAQ Enquiry
                                    </h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"> <span aria-hidden="true">&times;</span></button>
                                  </div>
                                  <form onSubmit={(e) => handleEditSubmit(e, question._id)}>
                                    <div className="modal-body">
                                      <div className="row">
                                        <div className="col-md-6 form-group">
                                          <label htmlFor={`name_${question._id}`}>Name</label>
                                          <input
                                            type="text"
                                            name="name"
                                            id={`name_${question._id}`}
                                            className="form-control"
                                            value={question.name}
                                            disabled
                                          />
                                        </div>
                                        <div className="col-md-6 form-group">
                                          <label htmlFor={`email_${question._id}`}>Email</label>
                                          <input
                                            type="email"
                                            name="email"
                                            id={`email_${question._id}`}
                                            className="form-control"
                                            value={question.email}
                                            disabled
                                          />
                                        </div>
                                      </div>
                                      <div className="row">
                                        <div className="col-md-6 form-group">
                                          <label htmlFor={`number_${question._id}`}>Number</label>
                                          <input
                                            type="text"
                                            name="number"
                                            id={`number_${question._id}`}
                                            className="form-control"
                                            value={question.number || ''}
                                            disabled
                                          />
                                        </div>
                                        <div className="col-md-6 form-group">
                                          <label htmlFor={`createdAt_${question._id}`}>Question Asked At</label>
                                          <input
                                            type="text"
                                            name="createdAt"
                                            id={`createdAt_${question._id}`}
                                            className="form-control"
                                            value={new Date(question.createdAt).toLocaleString()}
                                            disabled
                                          />
                                        </div>
                                      </div>
                                      <div className="row">
                                        <div className="col-12 form-group">
                                          <label htmlFor={`message_${question._id}`}>Question</label>
                                          <textarea
                                            name="message"
                                            id={`message_${question._id}`}
                                            className="form-control"
                                            rows="3"
                                            value={question.message}
                                            disabled
                                          ></textarea>
                                        </div>
                                      </div>
                                      <div className="row">
                                        <div className="col-12 form-group">
                                          <label htmlFor={`answer_${question._id}`}>Answer</label>
                                          <textarea
                                            name="answer"
                                            id={`answer_${question._id}`}
                                            className="form-control"
                                            rows="3"
                                            defaultValue={question.answer || ''}
                                          ></textarea>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="modal-footer">
                                      <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                        Cancel
                                      </button>
                                      <button type="submit" className="btn btn-primary">
                                        Save
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              </div>
                            </div>
                            {/* Delete Modal */}
                            <DeleteModal
                              modalId={`deleteModal_${question._id}`}
                              entityName="FAQ Enquiry"
                              apiEndpoint={`${import.meta.env.VITE_API_URL}/api/admin/faqEnquiry/delete/${question._id}`}
                              entityId={question._id}
                              deleteCallback={removeFaqEnquiry}
                            />
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center text-muted">
                            No FAQ enquiries found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  search={search}
                  statusFilter={statusFilter}
                  basePath="/faq-enquiry"
                />
            </div>
          </div>
        </div>

  );
}

export default FaqEnquiry;