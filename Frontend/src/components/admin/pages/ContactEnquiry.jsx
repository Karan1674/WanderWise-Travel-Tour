import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { setContactEnquiriesData, updateContactEnquiry, removeContactEnquiry } from '../../../redux/slices/contactEnquirySlice';
import Pagination from './Pagination';
import DeleteModal from './DeleteModal';


function ContactEnquiry() {
  const { userType } = useSelector((state) => state.auth);
  const { allContactEnquiries, totalPages, currentPage, search, statusFilter } = useSelector((state) => state.contactEnquiries);
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
    const fetchContactEnquiries = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/contactEnquiry`, {
          params: { page: initialPage, search: initialSearch, statusFilter: initialStatusFilter },
          withCredentials: true,
        });
        const data = response.data;
        if (data.success) {
          dispatch(setContactEnquiriesData({
            allContactEnquiries: data.allContactEnquiries,
            totalPages: data.totalPages,
            currentPage: data.currentPage,
            search: data.search,
            statusFilter: data.statusFilter,
          }));
        }
      } catch (error) {
        console.error('Error fetching contact enquiries:', error);
        toast.error('Error fetching contact enquiry list');
        navigate('/error');
      } finally {
        setLoading(false);
      }
    };

    if (['admin', 'agent'].includes(userType)) {
      fetchContactEnquiries();
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
    navigate(`/contact-enquiry${newUrl}`);
  };

  const handleStatusUpdate = async (e, enquiryId) => {
    e.preventDefault();
    const enquiryStatus = e.target.enquiryStatus.value;
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/contactEnquiry/update/${enquiryId}`,
        { enquiryStatus },
        { withCredentials: true }
      );
      const { enquiry } = response.data;
      dispatch(updateContactEnquiry(enquiry));
      toast.success('Contact enquiry status updated successfully');
      setEditEnquiry(null);
      document.getElementById(`statusModal_${enquiryId}`).classList.remove('show');
      document.body.classList.remove('modal-open');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.remove();
    } catch (error) {
      console.error('Error updating contact enquiry status:', error);
      toast.error('Error updating contact enquiry status');
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

  if (!allContactEnquiries) {
    return null;
  }

  return (

        <div className="db-info-wrap">
          <div className="row">
            <div className="col-lg-12">
              <div className="dashboard-box" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div className="header-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4 style={{ margin: 0, color: '#333' }}>Contact Enquiry List</h4>
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
                        id="status-filter"
                        defaultValue={statusFilter}
                        style={{ width: '30%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="cancel">Cancel</option>
                      </select>
                      <button type="submit" aria-label="Search enquiries" style={{ position: 'absolute', right: '40px', background: 'none', border: 'none', cursor: 'pointer' }}>
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
                        <th>Status</th>
                        <th>Updated By</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allContactEnquiries && allContactEnquiries.length > 0 ? (
                        allContactEnquiries.map((contact) => (
                          <tr key={contact._id}>
                            <td>{contact.name}</td>
                            <td>{contact.email}</td>
                            <td>{contact.number || '-'}</td>
                            <td>
                              <span
                                className={`badge badge-${contact.enquiryStatus === 'pending' ? 'warning' : contact.enquiryStatus === 'active' ? 'success' : 'danger'}`}
                              >
                                {contact.enquiryStatus.charAt(0).toUpperCase() + contact.enquiryStatus.slice(1)}
                              </span>
                            </td>
                            <td>{contact.updatedBy ? `${contact.updatedBy.firstName} ${contact.updatedBy.lastName}` : ''}</td>
                            <td>
                              <span
                                className="badge badge-info text-white view-btn"
                                style={{ cursor: 'pointer' }}
                                data-bs-toggle="modal"
                                data-bs-target={`#viewModal_${contact._id}`}
                                aria-label="View Enquiry"
                              >
                                <i className="far fa-eye"></i>
                              </span>
                              <span
                                className="badge badge-success text-white status-btn"
                                style={{ cursor: 'pointer',marginLeft:'5px' }}
                                data-bs-toggle="modal"
                                data-bs-target={`#statusModal_${contact._id}`}
                                onClick={() => setEditEnquiry(contact)}
                                aria-label="Update Status"
                              >
                                <i className="fas fa-edit"></i>
                              </span>
                              <span
                                className="badge badge-danger delete-btn"
                                style={{ cursor: 'pointer',marginLeft:'5px' }}
                                data-bs-toggle="modal"
                                data-bs-target={`#deleteModal_${contact._id}`}
                                aria-label="Delete Enquiry"
                              >
                                <i className="far fa-trash-alt"></i>
                              </span>
                            </td>
                            {/* View Modal */}
                            <div
                              className="modal fade"
                              id={`viewModal_${contact._id}`}
                              tabIndex="-1"
                              aria-labelledby={`viewModalLabel_${contact._id}`}
                              aria-hidden="true"
                              style={{ zIndex: 99999, top: '30px', padding: '20px' }}
                            >
                              <div className="modal-dialog modal-lg" style={{ transition: 'all 0.3s ease-in-out' }}>
                                <div className="modal-content">
                                  <div className="modal-header">
                                    <h5 className="modal-title" id={`viewModalLabel_${contact._id}`}>
                                      Contact Enquiry Details
                                    </h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"> <span aria-hidden="true">&times;</span></button>
                                  </div>
                                  <div className="modal-body">
                                    <p><strong>Name:</strong> {contact.name}</p>
                                    <p><strong>Email:</strong> {contact.email}</p>
                                    <p><strong>Number:</strong> {contact.number || '-'}</p>
                                    <p><strong>Message:</strong> {contact.message}</p>
                                    <p><strong>Status:</strong> {contact.enquiryStatus.charAt(0).toUpperCase() + contact.enquiryStatus.slice(1)}</p>
                                    <p><strong>Created At:</strong> {new Date(contact.createdAt).toLocaleString()}</p>
                                  </div>
                                  <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                      Close
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* Status Update Modal */}
                            <div
                              className="modal fade"
                              id={`statusModal_${contact._id}`}
                              tabIndex="-1"
                              aria-labelledby={`statusModalLabel_${contact._id}`}
                              aria-hidden="true"
                              style={{ zIndex: 99999, top: '30px', padding: '20px' }}
                            >
                              <div className="modal-dialog modal-lg" style={{ transition: 'all 0.3s ease-in-out' }}>
                                <div className="modal-content" style={{ overflowY: 'hidden' }}>
                                  <div className="modal-header">
                                    <h5 className="modal-title" id={`statusModalLabel_${contact._id}`}>
                                      Update Contact Enquiry Status
                                    </h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"> <span aria-hidden="true">&times;</span></button>
                                  </div>
                                  <form onSubmit={(e) => handleStatusUpdate(e, contact._id)}>
                                    <div className="modal-body">
                                      <div className="row">
                                        <div className="col-md-6 form-group">
                                          <label htmlFor={`name_${contact._id}`}>Name</label>
                                          <input
                                            type="text"
                                            name="name"
                                            id={`name_${contact._id}`}
                                            className="form-control"
                                            value={contact.name}
                                            disabled
                                          />
                                        </div>
                                        <div className="col-md-6 form-group">
                                          <label htmlFor={`email_${contact._id}`}>Email</label>
                                          <input
                                            type="email"
                                            name="email"
                                            id={`email_${contact._id}`}
                                            className="form-control"
                                            value={contact.email}
                                            disabled
                                          />
                                        </div>
                                      </div>
                                      <div className="row">
                                        <div className="col-md-6 form-group">
                                          <label htmlFor={`number_${contact._id}`}>Number</label>
                                          <input
                                            type="text"
                                            name="number"
                                            id={`number_${contact._id}`}
                                            className="form-control"
                                            value={contact.number || ''}
                                            disabled
                                          />
                                        </div>
                                        <div className="col-md-6 form-group">
                                          <label htmlFor={`createdAt_${contact._id}`}>Enquiry Submitted At</label>
                                          <input
                                            type="text"
                                            name="createdAt"
                                            id={`createdAt_${contact._id}`}
                                            className="form-control"
                                            value={new Date(contact.createdAt).toLocaleString()}
                                            disabled
                                          />
                                        </div>
                                      </div>
                                      <div className="row">
                                        <div className="col-12 form-group">
                                          <label htmlFor={`message_${contact._id}`}>Message</label>
                                          <textarea
                                            name="message"
                                            id={`message_${contact._id}`}
                                            className="form-control"
                                            rows="3"
                                            value={contact.message}
                                            disabled
                                          ></textarea>
                                        </div>
                                      </div>
                                      <div className="row">
                                        <div className="col-12 form-group">
                                          <label htmlFor={`enquiryStatus_${contact._id}`}>Status</label>
                                          <select
                                            name="enquiryStatus"
                                            id={`enquiryStatus_${contact._id}`}
                                            className="form-control"
                                            defaultValue={contact.enquiryStatus}
                                          >
                                            <option value="pending">Pending</option>
                                            <option value="active">Active</option>
                                            <option value="cancel">Cancel</option>
                                          </select>
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
                              modalId={`deleteModal_${contact._id}`}
                              entityName="Contact Enquiry"
                              apiEndpoint={`${import.meta.env.VITE_API_URL}/api/admin/contactEnquiry/delete/${contact._id}`}
                              entityId={contact._id}
                              deleteCallback={removeContactEnquiry}
                            />
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center text-muted">
                            No Contact enquiries found.
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
                  basePath="/contact-enquiry"
                />
            </div>
          </div>
        </div>
 
  );
}

export default ContactEnquiry;