import { Outlet, Link } from 'react-router-dom';
import '../../../styles/admin.scss'
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { clearUser } from '../../../redux/slices/authSlice';
import { persistor } from '../../../redux/store';
import { clearAgentsData } from '../../../redux/slices/agentSlice';
import { clearBookingsData } from '../../../redux/slices/packageBookingSlice';

function AdminLayout() {
    const { userType, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await axios.post(`${apiUrl}/api/auth/logout`, {}, { withCredentials: true });
            const data = response.data;
            console.log(response)
            if (data.success) {
                await persistor.purge();
                toast.success(data.message);
                navigate('/');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Logout error:', error);
            toast.error(error.response?.data?.message || 'Error during logout');
        }
    };


    return (
        <div className='admin-layout'>
            <div id="container-wrapper">
                <div id="dashboard" className="dashboard-container">
                    {/* Header */}
                    <div className="dashboard-header sticky-header">
                        <div className="content-left  logo-section pull-left">
                            <h1><a href="/dashboard"><img style={{ height: '50px' }} src="/admin/assets/images/logoImage1.png" alt="" /></a></h1>
                        </div>
                        <div className="heaer-content-right pull-right">

                            <div className="dropdown">
                                <a className="dropdown-toggle" data-toggle="dropdown">
                                    <div className="dropdown-item profile-sec">
                                        {user && user.profilePic && (
                                            <img src={`${import.meta.env.VITE_API_URL}/Uploads/profiles/${user.profilePic}`} alt="User Profile Picture" />
                                        )}

                                        <span>My Account </span>
                                        <i className="fas fa-caret-down"></i>
                                    </div>
                                </a>
                                <div className="dropdown-menu account-menu">
                                    <ul>

                                        <li><Link to="/admin-agent-profile"><i className="fas fa-user-tie"></i>Profile</Link></li>
                                        <li><Link to="#" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i>Logout</Link></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="dashboard-navigation">

                        <div id="dashboard-Navigation" className="slick-nav"></div>
                        <div id="navigation" className="navigation-container">
                            <ul>
                                <li><Link to="/dashboard"><i className="far fa-chart-bar"></i> Dashboard</Link></li>
                                {user && userType == 'admin' && (
                                    <li><Link to='/db-user-dashboard'><i className="fas fa-user"></i>Users</Link></li>
                                )}
                                <li><Link to='/db-package-dashboard'><i className="fas fa-hotel"></i>Packages</Link></li>
                                {/* <li><Link to="/product-list"><i className="fas fa-store fa-3x"></i>Shop</Link></li> */}
                                <li><Link to="/db-bookings"><i className="fas fa-shopping-cart fa-3x"></i>Bookings</Link></li>
                                {/* <li><Link to="/blog-list"><i className="fas fa-blog fa-3x"></i> Blog</Link></li> */}
                                <li><Link to="/coupon-list"><i className="fas fa-ticket-alt fa-3x"></i> Coupon</Link></li>
                                <li><Link to="/career-list"><i className="fas fa-briefcase fa-3x"></i> Career</Link></li>
                                <li><Link to="/application-list"><i className="fas fa-file-signature fa-3x"></i> Applicant</Link></li>
                                <li><Link to="/tour-guide-list"><i className="fas fa-route"></i> Tour Guide</Link></li>
                                <li><Link to="/galleryDashboard"><i className="fas fa-images fa-3x"></i> Gallery</Link></li>
                                <li><Link to="/enquiryDashboard"><i className="fas fa-question-circle fa-3x"></i> Enquiry</Link></li>
                                <li><Link to="#" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Logout</Link></li>
                            </ul>
                        </div>
                    </div>


                    {/* Main Content */}

                    <Outlet />



                    {/* Footer */}
                    <div className="copyrights">
                        Copyright © 2021 Travele. All rights reserved.
                    </div>
                </div>
            </div>

        </div >
    );
}

export default AdminLayout;
