import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import DeleteModal from './DeleteModal';
import Pagination from './Pagination';
import { clearAgentsData, setAgentsData } from '../../../redux/slices/agentSlice';


function AgentList() {
  const { userType } = useSelector((state) => state.auth);
  const { allAgents, totalPages, currentPage, search, statusFilter } = useSelector((state) => state.agents);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get('page')) || 1;
  const initialSearch = queryParams.get('search') || '';
  const initialStatusFilter = queryParams.get('statusFilter') || 'all';

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/agents`, {
          params: { page: initialPage, search: initialSearch, statusFilter: initialStatusFilter },
          withCredentials: true,
        });
        const data = response.data;
        if (data.success) {
          dispatch(setAgentsData({
            allAgents: data.allAgents,
            totalPages: data.totalPages,
            currentPage: data.currentPage,
            search: data.search,
            statusFilter: data.statusFilter,
          }));
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        toast.error(error.response?.data?.message || 'Failed to load agents');
      } finally {
        setLoading(false);
      }
    };

    if (['admin'].includes(userType)) {
      fetchAgents();
    }


  }, [navigate, location, initialPage, initialSearch, initialStatusFilter, userType, dispatch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newSearch = e.target.search.value.trim();
    const newStatusFilter = e.target.statusFilter.value;
    const newUrl = `?page=1${newSearch ? `&search=${encodeURIComponent(newSearch)}` : ''}${newStatusFilter !== 'all' ? `&statusFilter=${encodeURIComponent(newStatusFilter)}` : ''}`;
    navigate(`/db-admin-created-agents${newUrl}`);
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

  if (!allAgents) {
    return null;
  }

  return (
    <div className="db-info-wrap">
      <div className="row">
        <div className="col-lg-12">
          <div
            className="dashboard-box table-opp-color-box"

          >
            <div
              className="header-controls"

            >
              <h4 style={{ margin: 0, color: '#333' }}>Agent Details</h4>
              <Link to="/new-agent" className="btn btn-primary" aria-label="Add new agent">
                Add Agent
              </Link>
            </div>
            <div
              className="user-controls"

            >
              <form id="search-form" onSubmit={handleSearchSubmit} >
                <div className="form-group" >
                  <input
                    type="text"
                    name="search"
                    id="search-input"
                    placeholder="Search by agent name"
                    defaultValue={search}

                  />
                  <select
                    name="statusFilter"
                    id="status-filter"
                    defaultValue={statusFilter}

                  >
                    <option value="all">All</option>
                    <option value="Active">Active</option>
                    <option value="notActive">Not Active</option>
                  </select>
                  <button
                    type="submit"
                    id="btnSubmit"
                    aria-label="Search agents"

                  >
                    <i className="fas fa-search" style={{ color: '#007bff' }}></i>
                  </button>
                </div>
              </form>
            </div>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Profile Pic</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Country</th>
                    <th>Status</th>
                    <th>View</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {allAgents && allAgents.length > 0 ? (
                    allAgents.map((agent) => (
                      <tr key={agent._id}>
                        <td>
                          <span className="list-img">
                            <img
                              src={agent.profilePic ? `${import.meta.env.VITE_API_URL}/Uploads/profiles/${agent.profilePic}` : '/assets/images/favicon.png'}
                              alt="Profile Picture"
                            />
                          </span>
                        </td>
                        <td>
                          <span className="list-name">{`${agent.firstName} ${agent.lastName}`}</span>
                        </td>
                        <td>{`${agent.countryCode || ''} ${agent.phone || 'N/A'}`}</td>
                        <td>{agent.email || 'N/A'}</td>
                        <td>{agent.country || 'N/A'}</td>
                        <td>
                          <span className={`badge badge-${agent.isActive ? 'success' : 'danger'}`}>
                            {agent.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td>
                          <span
                            className="badge badge-info text-white view-btn"
                            style={{ cursor: 'pointer' }}
                            data-toggle="modal"
                            data-target={`#viewModal_${agent._id}`}
                            aria-label="View Agent"
                          >
                            <i className="far fa-eye"></i>
                          </span>
                        </td>
                        <td>
                          <span
                            className="badge badge-success text-white edit-btn"
                            onClick={() => navigate(`/edit-agent?editAgentId=${agent._id}&page=${currentPage}`)}
                            style={{ cursor: 'pointer' }}
                            aria-label="Edit Agent"
                          >
                            <i className="far fa-edit"></i>
                          </span>
                        </td>
                        <td>
                          <span
                            className="badge badge-danger delete-btn"
                            style={{ cursor: 'pointer' }}
                            data-toggle="modal"
                            data-target={`#deleteModal_${agent._id}`}
                            data-itemid={agent._id}
                            data-apiendpoint={`${import.meta.env.VITE_API_URL}/api/auth/delete-agent/${agent._id}`}
                            data-redirectpath={`/db-admin-created-agents?page=${currentPage}`}
                            aria-label="Delete Agent"
                          >
                            <i className="far fa-trash-alt"></i>
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center text-muted">
                        No Agents found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Modals for viewing agent details */}
      {allAgents && allAgents.length > 0 && allAgents.map((agent) => (
        <div
          key={`modal_${agent._id}`}
          className="modal fade"
          id={`viewModal_${agent._id}`}
          tabIndex="-1"
          role="dialog"
          aria-labelledby={`viewModalLabel_${agent._id}`}
          aria-hidden="true"
          style={{ zIndex: 99999, top: '30px', padding: '20px' }}
        >
          <div
            className="modal-dialog modal-lg"
            role="document"
            style={{ transition: 'all 0.3s ease-in-out' }}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id={`viewModalLabel_${agent._id}`}>
                  Agent Details
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="container-fluid">
                  <div className="row g-3 align-items-start">
                    <div className="col-md-8">
                      <div className="card p-3 shadow-sm">
                        <div className="row g-2">
                          <div className="col-md-12">
                            <p className="mb-2"><strong>Name:</strong> {`${agent.firstName} ${agent.lastName}`}</p>
                          </div>
                          <div className="col-md-12">
                            <p className="mb-2"><strong>Email:</strong> {agent.email || 'N/A'}</p>
                          </div>
                          <div className="col-md-12">
                            <p className="mb-2"><strong>Phone:</strong> {`${agent.countryCode || ''} ${agent.phone || 'N/A'}`}</p>
                          </div>
                          <div className="col-md-12">
                            <p className="mb-2"><strong>Date of Birth:</strong> {agent.dateOfBirth ? new Date(agent.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          <div className="col-md-12">
                            <p className="mb-2"><strong>Country:</strong> {agent.country || 'N/A'}</p>
                          </div>
                          <div className="col-md-12">
                            <p className="mb-2"><strong>State:</strong> {agent.state || 'N/A'}</p>
                          </div>
                          <div className="col-md-12">
                            <p className="mb-2"><strong>City:</strong> {agent.city || 'N/A'}</p>
                          </div>
                          <div className="col-md-12">
                            <p className="mb-2"><strong>Address:</strong> {agent.address || 'N/A'}</p>
                          </div>
                          <div className="col-md-12">
                            <p className="mb-2"><strong>Status:</strong> {agent.isActive ? 'Active' : 'Not Active'}</p>
                          </div>
                          <div className="col-md-12">
                            <p className="mb-2"><strong>Created At:</strong> {agent.createdAt ? new Date(agent.createdAt).toLocaleString() : 'N/A'}</p>
                          </div>
                          <div className="col-md-12">
                            <p className="mb-2"><strong>Updated At:</strong> {agent.updatedAt ? new Date(agent.updatedAt).toLocaleString() : 'N/A'}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="mb-0"><strong>Description:</strong> {agent.description || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 text-center">
                      <div className="card p-3 shadow-sm">
                        <p className="mb-2"><strong>Profile Picture:</strong></p>
                        {agent.profilePic ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img
                              src={`${import.meta.env.VITE_API_URL}/Uploads/profiles/${agent.profilePic}`}
                              alt="Profile Picture"
                              className="img-fluid rounded"
                              style={{ maxWidth: '200px', marginTop: '10px' }}
                            />
                          </div>
                        ) : (
                          <p className="text-muted">N/A</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      {/* Delete modals */}
      {allAgents && allAgents.length > 0 && allAgents.map((agent) => (
        <DeleteModal
          key={`deleteModal_${agent._id}`}
          modalId={`deleteModal_${agent._id}`}
          entityName="Agent"
          entityId={agent._id}
          apiEndpoint={`${import.meta.env.VITE_API_URL}/api/admin/delete-agent/${agent._id}`}
          redirectPath={`/db-admin-created-agents?page=${currentPage}`}
        />
      ))}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        search={search}
        statusFilter={statusFilter}
      />
    </div>
  );
}

export default AgentList;
