import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../layouts/Loader';


function PackageOfferPage() {
  const { user, userType } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        if (!user || userType !== 'User') {
          toast.error('Unauthorized access');
          navigate('/login');
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/client/package-offer`, {
          withCredentials: true,
        });

        if (response.data.success) {
          setPackages(response.data.packages || []);
        } else {
          toast.error(response.data.message || 'Failed to load package offers');
        }
      } catch (error) {
        console.error('Error fetching package offers:', error);
        toast.error(error.response?.data?.message || 'Server error');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [navigate, user, userType]);

  const handleWishlistToggle = async (packageId, isWishlisted) => {
    try {
      const action = isWishlisted ? 'remove' : 'add';
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/client/wishlist/${action}/${packageId}`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        setPackages((prev) =>
          prev.map((pkg) =>
            pkg._id === packageId ? { ...pkg, isWishlisted: !isWishlisted } : pkg
          )
        );
        toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
      } else {
        toast.error(response.data.message || `Failed to ${action} package to wishlist`);
      }
    } catch (error) {
      console.error(`Error ${isWishlisted ? 'removing from' : 'adding to'} wishlist:`, error);
      toast.error('Error updating wishlist');
    }
  };

  if (loading) {
    return <Loader/>;
  }

  return (
<>
        <section className="inner-banner-wrap">
          <div className="inner-baner-container" style={{ backgroundImage: 'url(/assets/images/inner-banner.jpg)' }}>
            <div className="container">
              <div className="inner-banner-content">
                <h1 className="inner-title">Package Offer</h1>
              </div>
            </div>
          </div>
          <div className="inner-shape"></div>
        </section>
        <section className="package-offer-wrap">
          <div className="special-section">
            <div className="container">
              <div className="special-inner">
                <div className="row">
                  {packages.length === 0 ? (
                    <div className="col-12 text-center">
                      <h3>No Package Offers Available</h3>
                      <p>Currently, there are no discounted tour packages available. Please check back later or explore all packages.</p>
                      <Link to="/tour-packages" className="button-text">
                        Explore Packages
                      </Link>
                    </div>
                  ) : (
                    packages.map((pkg) => (
                      <div key={pkg._id} className="col-md-6 col-lg-4">
                        <div className="special-item">
                          <figure className="special-img" style={{ width: '365px', height: '305px', overflow: 'hidden' }}>
                            <Link to={`/package-detail/${pkg._id}`}>
                              <img
                                src={`${import.meta.env.VITE_API_URL}/Uploads/gallery/${pkg.featuredImage || 'default.jpg'}`}
                                alt={pkg.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                              />
                            </Link>
                          </figure>
                          <div className="badge-dis" >
                            <span ><strong>{pkg.discount}%</strong> off</span>
                          </div>
                          <div className="special-content">
                            <div className="meta-cat">
                              <Link to="#" style={{ color: '#007bff', textDecoration: 'none' }}>{pkg.destinationCountry || 'N/A'}</Link>
                            </div>
                            <h3>
                              <Link to={`/package-detail/${pkg._id}`}>{pkg.title}</Link>
                            </h3>
                            <div className="review-area" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                              <span className="review-text" style={{ fontSize: '0.9rem', color: '#555555' }}>
                                ({pkg.reviewCount || 0} reviews)
                              </span>
                              <div
                                className="rating-start"
                                style={{ fontSize: '1rem', color: '#ccc', display: 'inline-flex' }}
                                title={`Rated ${pkg.averageRating || 0} out of 5`}
                              >
                                {[...Array(5)].map((_, i) => (
                                  <i
                                    key={i}
                                    className={`fas fa-star ${i < Math.round(pkg.averageRating || 0) ? 'filled' : ''}`}
                                    style={{
                                      margin: '0 2px',
                                      color: i < Math.round(pkg.averageRating || 0) ? '#f5c518' : '#ccc',
                                    }}
                                  ></i>
                                ))}
                              </div>
                            </div>
                            <div className="package-price" style={{ color: '#999' }}>
                              Price: <del>${pkg.regularPrice}</del>
                              <ins style={{ color: '#dc3545', textDecoration: 'none' }}>${pkg.salePrice}</ins>
                            </div>
                            <div className="btn-wrap" style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                              <Link to={`/bookPackage/${pkg._id}`} className=" width-6" >
                                Book Now <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                              </Link>
                              <Link
                                className="wishlist-toggle  width-6"
                                style={{ color: '#dc3545', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center' }}
                                onClick={() => handleWishlistToggle(pkg._id, pkg.isWishlisted)}
                              >
                                {pkg.isWishlisted ? 'Remove' : 'Wish List'}
                                <i className={pkg.isWishlisted ? 'fas fa-heart' : 'far fa-heart'} style={{ marginLeft: '8px' }}></i>
                              </Link>
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
          <div className="contact-section">
            <div className="container">
              <div className="row">
                <div className="col-lg-4">
                  <div className="contact-img" style={{ backgroundImage: 'url(/assets/images/img24.jpg)' }}></div>
                </div>
                <div className="col-lg-8">
                  <div className="contact-details-wrap">
                    <div className="row">
                      <div className="col-sm-4">
                        <div className="contact-details">
                          <div className="contact-icon">
                            <img src="/assets/images/icon12.png" alt="" />
                          </div>
                          <ul>
                            <li><a href="#">support@gmail.com</a></li>
                            <li><a href="#">info@domain.com</a></li>
                            <li><a href="#">name@company.com</a></li>
                          </ul>
                        </div>
                      </div>
                      <div className="col-sm-4">
                        <div className="contact-details">
                          <div className="contact-icon">
                            <img src="/assets/images/icon13.png" alt="" />
                          </div>
                          <ul>
                            <li><a href="#">+132 (599) 254 669</a></li>
                            <li><a href="#">+123 (669) 255 587</a></li>
                            <li><a href="#">+01 (977) 2599 12</a></li>
                          </ul>
                        </div>
                      </div>
                      <div className="col-sm-4">
                        <div className="contact-details">
                          <div className="contact-icon">
                            <img src="/assets/images/icon14.png" alt="" />
                          </div>
                          <ul>
                            <li>3146 Koontz, California</li>
                            <li>Quze.24 Second floor</li>
                            <li>36 Street, Melbourne</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="contact-btn-wrap">
                    <h3>LET'S JOIN US FOR MORE UPDATE !!</h3>
                    <Link to="/careers" className="button-primary">LEARN MORE</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
  </>
  );
}

export default PackageOfferPage;
