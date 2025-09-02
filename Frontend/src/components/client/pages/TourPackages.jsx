import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../layouts/Loader';

function TourPackages() {
  const { user, userType } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState({ packages: []});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const destination = urlParams.get('destination');
        const url = `${import.meta.env.VITE_API_URL}/api/client/tour-packages${destination ? `?destination=${destination}` : ''}`;
        const response = await axios.get(url, { withCredentials: true });
        if (response.data.success) {
          setData(response.data);
        } else {
          toast.error(response.data.message || 'Failed to load packages');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching tour packages:', error);
        toast.error(error.response?.data?.message || 'Server error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (user && userType === 'User') {
      fetchData();
    } else {
      toast.info('Unauthorized access. Login first to view the page');
      navigate('/login');
    }
  }, [navigate, user, userType, location.search]);

  const handleWishlistToggle = async (packageId, isWishlisted) => {
    try {
      const action = isWishlisted ? 'remove' : 'add';
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/client/wishlist/${action}/${packageId}`,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success(response.data.message);
        setData((prev) => ({
          ...prev,
          packages: prev.packages.map((pkg) =>
            pkg._id === packageId ? { ...pkg, isWishlisted: !isWishlisted } : pkg
          ),
        }));
      } else {
        toast.error(response.data.message || `Failed to ${action} package from wishlist`);
      }
    } catch (error) {
      console.error(`Error ${isWishlisted ? 'removing from' : 'adding to'} wishlist:`, error);
      toast.error(`Error ${isWishlisted ? 'removing from' : 'adding to'} wishlist`);
    }
  };

  if (loading) {
    return (
    <Loader/>
    );
  }

  const { packages } = data;

  return (
    <>
      <section
        className="inner-banner-wrap"
      
      >
        <div className="inner-baner-container"   style={{ backgroundImage: 'url(/assets/images/inner-banner.jpg)' }}>
          <div className="container">
            <div className="inner-banner-content">
              <h1 className="inner-title">Tour Packages</h1>
            </div>
          </div>
        </div>
        <div className="inner-shape"></div>
      </section>

      <div className="package-section">
        <div className="container">
          <div className="package-inner">
            <div className="row">
              {packages.length === 0 ? (
                <div className="col-12 text-center">
                  <h3>No packages available</h3>
                  <p>Currently, there are no active tour packages available. Please check back later or explore other destinations.</p>
                </div>
              ) : (
                packages
                  .filter((pkg) => pkg.status === 'Active')
                  .map((pkg) => (
                    <div className="col-lg-4 col-md-6" key={pkg._id}>
                      <div className="package-wrap">
                        <figure
                          className="feature-image"
                          style={{ width: '365px', height: '305px', overflow: 'hidden' }}
                        >
                          <Link to={`/package-detail/${pkg._id}`}>
                            <img
                              src={`${import.meta.env.VITE_API_URL}/Uploads/gallery/${pkg.featuredImage || 'default.jpg'}`}
                              alt={pkg.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                             
                            />
                          </Link>
                        </figure>
                        <div className="package-price">
                          <h6>
                            <span>${pkg.salePrice || pkg.regularPrice}</span> / per person
                          </h6>
                        </div>
                        <div className="package-content-wrap">
                          <div className="package-meta text-center">
                            <ul>
                              <li>
                                <i className="far fa-clock"></i>
                                {pkg.tripDuration.days}D/{pkg.tripDuration.nights}N
                              </li>
                              <li>
                                <i className="fas fa-user-friends"></i>
                                People: {pkg.groupSize || 'N/A'}
                              </li>
                              <li>
                                <i className="fas fa-map-marker-alt"></i>
                                {pkg.destinationCountry || 'N/A'}
                              </li>
                            </ul>
                          </div>
                          <div className="package-content">
                            <h3>
                              <Link to={`/package-detail/${pkg._id}`} >
                                {pkg.title}
                              </Link>
                            </h3>
                            <div
                              className="review-area"
                              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}
                            >
                              <span className="review-text" style={{ fontSize: '0.9rem', color: '#555555' }}>
                                ({pkg.reviewCount || 0} reviews)
                              </span>
                              <div
                                className="rating-start"
                                title={`Rated ${pkg.averageRating || 0} out of 5`}
                                style={{ fontSize: '1rem', color: '#ccc', display: 'inline-flex' }}
                              >
                                {[...Array(5)].map((_, i) => (
                                  <i
                                    key={i}
                                    className={`fas fa-star ${i < Math.round(pkg.averageRating || 0) ? 'filled' : ''}`}
                                    style={{ margin: '0 2px', color: i < Math.round(pkg.averageRating || 0) ? '#f5c518' : '#ccc' }}
                                  ></i>
                                ))}
                              </div>
                            </div>
                            <p>{pkg.description?.substring(0, 100)}...</p>
                            <div className="btn-wrap">
                              <Link
                                to={`/bookPackage/${pkg._id}`}
                                className=" width-6"
                                
                              >
                                Book Now<i className="fas fa-arrow-right"></i>
                              </Link>
                              <Link
                                to="#"
                                className="wishlist-toggle width-6"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleWishlistToggle(pkg._id, pkg.isWishlisted);
                                }}
                             
                              >
                                {pkg.isWishlisted ? 'Remove' : 'Wish List'}
                                <i className={pkg.isWishlisted ? 'fas fa-heart' : 'far fa-heart'} ></i>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="activity-section">
        <div className="container">
          <div className="section-heading text-center">
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <h5 className="dash-style">TRAVEL BY ACTIVITY</h5>
                <h2>ADVENTURE & ACTIVITY</h2>
                <p>
                  Mollit voluptatem perspiciatis convallis elementum corporis quo veritatis aliquid blandit, blandit torquent, odit placeat. Adipiscing repudiandae eius cursus? Nostrum magnis maxime curae placeat.
                </p>
              </div>
            </div>
          </div>
          <div className="activity-inner row">
            {[
              { icon: '/assets/images/icon6.png', title: 'Adventure' },
              { icon: '/assets/images/icon10.png', title: 'Trekking' },
              { icon: '/assets/images/icon9.png', title: 'Camp Fire' },
              { icon: '/assets/images/icon8.png', title: 'Off Road' },
              { icon: '/assets/images/icon7.png', title: 'Camping' },
              { icon: '/assets/images/icon11.png', title: 'Exploring' },
            ].map((activity, index) => (
              <div className="col-lg-2 col-md-4 col-sm-6" key={index}>
                <div className="activity-item">
                  <div className="activity-icon">
                    <Link to="#">
                      <img src={activity.icon} alt={activity.title} />
                    </Link>
                  </div>
                  <div className="activity-content">
                    <h4>
                      <Link to="#">{activity.title}</Link>
                    </h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default TourPackages;