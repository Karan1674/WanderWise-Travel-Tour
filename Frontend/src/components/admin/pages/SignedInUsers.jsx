import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Pagination from './Pagination';

function SignedInUsers() {
    const navigate = useNavigate();
    const location = useLocation();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('search') || '';
    const pageQuery = parseInt(queryParams.get('page')) || 1;

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/db-signed-in-users`, {
                    params: { search: searchQuery, page: pageQuery },
                    withCredentials: true,
                });

                const { allUsers, search, currentPage, totalPages, statusFilter } = response.data;

                setUsers(allUsers || []);
                setSearch(search || '');
                setCurrentPage(parseInt(currentPage) || 1);
                setTotalPages(totalPages || 1);
                setStatusFilter(statusFilter || null)
            } catch (error) {
                console.error('Error fetching users:', error);
                toast.error(error.response?.data?.message || 'Failed to load users');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [location]);

    const handleSearch = (e) => {
        e.preventDefault();
        const query = e.target.search.value.trim();
        navigate(`/db-signed-in-users?search=${encodeURIComponent(query)}&page=1`);
    };

    const openViewModal = (user) => {
        setSelectedUser({ ...user });
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
                    <div className="dashboard-box table-opp-color-box">
                        <div
                            className="header-controls"
                        >
                            <h4 style={{ margin: 0 }}>Signed-In Users</h4>
                        </div>
                        <div
                            className="user-controls"
                        >
                            <form id="search-form" onSubmit={handleSearch} >
                                <div className="form-group" >
                                    <input
                                        type="text"
                                        name="search"
                                        id="search-input"
                                        placeholder="Search by user name or email"
                                        defaultValue={search}
                                        style={{ width: '100%' }}
                                    />
                                    <button
                                        type="submit"
                                        aria-label="Search users"
                                        id="btnSubmit"
                                    >
                                        <i className="fas fa-search" style={{ color: '#007bff' }}></i>
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Profile Pic</th>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>View</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <tr key={user._id}>
                                                <td>
                                                    <span className="list-img">
                                                        <img
                                                            src={
                                                                user.profilePic
                                                                    ? `${import.meta.env.VITE_API_URL}/Uploads/profiles/${user.profilePic}`
                                                                    : `${import.meta.env.VITE_API_URL}/assets/images/favicon2.png`
                                                            }
                                                            alt="Profile Picture"
                                                        />
                                                    </span>
                                                </td>
                                                <td>
                                                    <a href="#" onClick={() => openViewModal(user)}>
                                                        <span className="list-name">{`${user.firstName} ${user.lastName}`}</span>
                                                    </a>
                                                </td>
                                                <td>{user.phone || 'N/A'}</td>
                                                <td>{user.email || 'N/A'}</td>
                                                <td>
                                                    <span
                                                        style={{ cursor: 'pointer' }}
                                                        className="badge badge-success"
                                                        data-toggle="modal"
                                                        data-target="#viewUserModal"
                                                        onClick={() => openViewModal(user)}
                                                        aria-label="View User"
                                                    >
                                                        <i className="far fa-eye"></i>
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center text-muted">
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} search={search} statusFilter={statusFilter} />

            {/* View User Modal */}
            {selectedUser && (
                <div
                    className="modal fade"
                    id="viewUserModal"
                    tabIndex="-1"
                    role="dialog"
                    aria-labelledby="viewUserModalLabel"
                    aria-hidden="true"
                    style={{ zIndex: 99999, top: '50px', padding: '20px' }}
                >
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="viewUserModalLabel">
                                    User Details
                                </h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
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
                                                        <p className="mb-2">
                                                            <strong>Name:</strong> {`${selectedUser.firstName} ${selectedUser.lastName}`}
                                                        </p>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <p className="mb-2">
                                                            <strong>Email:</strong> {selectedUser.email || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <p className="mb-2">
                                                            <strong>Phone:</strong> {`${selectedUser.phone || 'N/A'}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4 text-center">
                                            <div className="card p-3 shadow-sm">
                                                <p className="mb-2">
                                                    <strong>Profile Picture:</strong>
                                                </p>
                                                {selectedUser.profilePic ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <img
                                                            src={`${import.meta.env.VITE_API_URL}/Uploads/profiles/${selectedUser.profilePic}`}
                                                            alt="Profile Picture"
                                                            className="img-fluid rounded"
                                                            style={{ maxWidth: '150px', marginTop: '10px' }}
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
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SignedInUsers;
