import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../layouts/Loader';

function WishlistPage() {
  const { user, userType } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        if (!user || userType !== 'User') {
          toast.error('Unauthorized access');
          navigate('/login');
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/client/wishlist`, {
          withCredentials: true,
        });

        if (response.data.success) {
          setWishlist(response.data.packages || []);
          console.log(response)
        } else {
          toast.error(response.data.message || 'Failed to load wishlist');
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        toast.error(error.response?.data?.message || 'Server error');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [navigate, user, userType]);

  const handleRemoveFromWishlist = async (packageId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/client/wishlist/remove/${packageId}`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        setWishlist((prev) => prev.filter((pkg) => pkg._id !== packageId));
        toast.success('Removed from wishlist');
      } else {
        toast.error(response.data.message || 'Failed to remove package from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Error removing package from wishlist');
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div id="page" className="full-page">
      <style>{`
        .wishlist-remove:hover {
          text-decoration: underline;
        }
      `}</style>
      <main id="content" className="site-main">
        <section className="inner-banner-wrap">
          <div className="inner-baner-container" style={{ backgroundImage: 'url(/assets/images/inner-banner.jpg)' }}>
            <div className="container">
              <div className="inner-banner-content">
                <h1 className="inner-title">My Wishlist</h1>
              </div>
            </div>
          </div>
          <div className="inner-shape"></div>
        </section>
        <div className="package-section">
          <div className="container">
            <div className="package-inner">
              <div className="row">
                {wishlist.length === 0 ? (
                  <div className="col-12 text-center">
                    <h3>Your Wishlist is Empty</h3>
                    <p>Add some exciting tour packages to your wishlist!</p>
                    <Link to="/tour-packages" className="button-text">
                      Explore Packages
                    </Link>
                  </div>
                ) : (
                  wishlist.map((pkg) => (
                    <div key={pkg._id} className="col-lg-4 col-md-6">
                      <div className="package-wrap">
                        <figure className="feature-image" style={{ width: '365px', height: '305px', overflow: 'hidden' }}>
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
                                {pkg.tripDuration?.days}D/{pkg.tripDuration?.nights}N
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
                            <p>{pkg.description?.substring(0, 100)}...</p>
                            <div className="btn-wrap">
                              <Link to={`/booking/${pkg._id}`} className=" width-6">
                                Book Now<i className="fas fa-arrow-right"></i>
                              </Link>
                              <Link
                                className="wishlist-remove width-6"
                                // style={{ color: '#dc3545', textDecoration: 'none', fontSize: '0.9rem' }}
                                onClick={() => handleRemoveFromWishlist(pkg._id)}
                              >
                                Remove<i className="fas fa-heart"></i>
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
      </main>
   </div>
  );
}

export default WishlistPage;