import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { clearUser } from '../../../redux/slices/authSlice';
import { persistor } from '../../../redux/store';

function Header() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.post(`${apiUrl}/api/auth/logout`, {}, { withCredentials: true });
      const data = response.data;
      console.log(response)
      if (data.success) {
        dispatch(clearUser());
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
    <header id="masthead" className="site-header header-primary">
      <div className="top-header">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 d-none d-lg-block">
              <div className="header-contact-info">
                <ul>
                  <li>
                    <NavLink to="#">
                      <i className="fas fa-phone-alt"></i> +01 (977) 2599 12
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="mailto:info@Travel.com">
                      <i className="fas fa-envelope"></i> company@domain.com
                    </NavLink>
                  </li>
                  <li>
                    <i className="fas fa-map-marker-alt"></i> 3146 Koontz Lane, California
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4 d-flex justify-content-lg-end justify-content-between">
              <div className="header-social social-links">
                <ul>
                  <li>
                    <NavLink to="#">
                      <i className="fab fa-facebook-f" aria-hidden="true"></i>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="#">
                      <i className="fab fa-twitter" aria-hidden="true"></i>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="#">
                      <i className="fab fa-instagram" aria-hidden="true"></i>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="#">
                      <i className="fab fa-linkedin" aria-hidden="true"></i>
                    </NavLink>
                  </li>
                </ul>
              </div>
      
            </div>
          </div>
        </div>
      </div>
      <div className="bottom-header">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="site-identity">
            <h1 className="site-title">
              <NavLink to="/">
                <img className="white-logo" src="/assets/images/logoImage2.png" alt="logo" />
                <img className="black-logo" src="/assets/images/logoImage1.png" alt="logo" />
              </NavLink>
            </h1>
          </div>
          <div className="main-navigation d-none d-lg-block">
            <nav id="navigation" className="navigation">
              <ul>
                <li>
                  <NavLink to="/" end>
                    Home
                  </NavLink>
                </li>
                <li className="menu-item-has-children">
                  <NavLink to="#">Tour</NavLink>
                  <ul>
                    <li>
                      <NavLink to="/destination">Destination</NavLink>
                    </li>
                    <li>
                      <NavLink to="/tour-packages">Tour Packages</NavLink>
                    </li>
                    <li>
                      <NavLink to="/package-offer">Package Offer</NavLink>
                    </li>
                  </ul>
                </li>

               

                <li className="menu-item-has-children">
                  <NavLink to="#">Discover</NavLink>
                  <ul>
                  <li>
                  <NavLink to="/services">Service</NavLink>
                </li>

                    <li>
                      <NavLink to="/careers">Career</NavLink>
                    </li>
                    {/* <li>
                      <NavLink to="/tour-guide">Tour Guide</NavLink>
                    </li> */}
                    {/* <li>
                      <NavLink to="/gallery">Gallery</NavLink>
                    </li> */}
                    <li>
                      <NavLink to="/faq">FAQ</NavLink>
                    </li>
                    <li>
                      <NavLink to="/testimonials">Testimonial</NavLink>
                    </li>
                   
                  </ul>
                </li>

                <li>
                  <NavLink to="/about">About</NavLink>
                </li>
                <li>
                      <NavLink to="/contact">Contact</NavLink>
                    </li>
               
                {/* <li>
                  <NavLink to="/products">Shop</NavLink>
                </li> */}
                {/* <li>
                  <NavLink to="/blog">Blog</NavLink>
                </li> */}
                {user ? (
                  <li className="menu-item-has-children">
                    <NavLink to="#">Dashboard</NavLink>
                    <ul>
                      <li>
                        <NavLink to="/user-profile">Profile</NavLink>
                      </li>
                      <li>
                        <NavLink to="/package-cart">Cart</NavLink>
                      </li>
                      <li>
                        <NavLink to="/userBookingPage">Booking</NavLink>
                      </li>
                      <li>
                        <NavLink to="/applied-careers">Applied Careers</NavLink>
                      </li>
                      <li>
                        <NavLink to="/wishlist">Wishlist</NavLink>
                      </li>
                      <li>
                        <NavLink to="#" onClick={handleLogout}>Logout</NavLink>
                      </li>
                    </ul>
                  </li>
                ) : (
                  <li>
                    <NavLink to="/login">Login</NavLink>
                  </li>
                )}
              </ul>
            </nav>
          </div>
          <div className="header-btn">
            <NavLink to="/tour-packages" className="button-primary">
              BOOK NOW
            </NavLink>
          </div>
        </div>
      </div>
      <div className="mobile-menu-container"></div>
    </header>
  );
}

export default Header;