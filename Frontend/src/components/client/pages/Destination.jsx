import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../layouts/Loader';

function Destination() {
  const { user, userType } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [data, setData] = useState({ destinations: []});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/client/destination`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setData(response.data);
        } else {
          toast.error(response.data.message || 'Failed to load destinations');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching destinations:', error);
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
  }, [navigate,  userType]);

  if (loading) {
    return (
 <Loader/> 
    );
  }

  const { destinations } = data;

  return (
    <>
      <section
        className="inner-banner-wrap"
    
      >
        <div className="inner-baner-container"     style={{ backgroundImage: 'url(/assets/images/inner-banner.jpg)' }}>
          <div className="container">
            <div className="inner-banner-content">
              <h1 className="inner-title">Destination</h1>
            </div>
          </div>
        </div>
        <div className="inner-shape"></div>
      </section>

      <section className="destination-section destination-page">
        <div className="container">
          <div className="destination-inner destination-three-column">
            <div className="row">
              <div className="col-lg-7">
                <div className="row">
                  {destinations.slice(0, 2).map((destination, index) => (
                    <div className="col-sm-6" key={index}>
                      <div className="desti-item overlay-desti-item" >
                        <figure className="desti-image">
                          <img src={destination.image} alt={destination.name}  />
                        </figure>
                        <div className="meta-cat bg-meta-cat"  >
                          <Link to={`/tour-packages?destination=${encodeURIComponent(destination.country)}`} >
                            {destination.country}
                          </Link>
                        </div>
                        <div className="desti-content" style={{ position: 'absolute', bottom: '30px', left: '10px', color: '#fff' }}>
                          <h3>
                            <Link to={`/tour-packages?destination=${encodeURIComponent(destination.country)}`} >
                              {destination.name}
                            </Link>
                          </h3>
                          <div className="rating-start" title={`Rated 5 out of ${destination.rating}`} >
                            <span style={{ width: destination.ratingWidth || '0%' }}></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-5">
                <div className="row">
                  {destinations.slice(2, 4).map((destination, index) => (
                    <div className="col-md-6 col-xl-12" key={index}>
                      <div className="desti-item overlay-desti-item">
                        <figure className="desti-image">
                          <img src={destination.image } alt={destination.name}  />
                        </figure>
                        <div className="meta-cat bg-meta-cat" >
                          <Link to={`/tour-packages?destination=${encodeURIComponent(destination.country)}`} >
                            {destination.country}
                          </Link>
                        </div>
                        <div className="desti-content" style={{ position: 'absolute', bottom: '30px', left: '10px', color: '#fff' }}>
                          <h3>
                            <Link to={`/tour-packages?destination=${encodeURIComponent(destination.country)}`} >
                              {destination.name}
                            </Link>
                          </h3>
                          <div className="rating-start" title={`Rated 5 out of ${destination.rating}`} >
                            <span style={{ width: destination.ratingWidth || '0%' }}></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-5">
                <div className="row">
                  {destinations.slice(4, 6).map((destination, index) => (
                    <div className="col-md-6 col-xl-12" key={index}>
                      <div className="desti-item overlay-desti-item" >
                        <figure className="desti-image">
                          <img src={destination.image} alt={destination.name}  />
                        </figure>
                        <div className="meta-cat bg-meta-cat" >
                          <Link to={`/tour-packages?destination=${encodeURIComponent(destination.country)}`} >
                            {destination.country}
                          </Link>
                        </div>
                        <div className="desti-content" style={{ position: 'absolute', bottom: '30px', left: '10px', color: '#fff' }}>
                          <h3>
                            <Link to={`/tour-packages?destination=${encodeURIComponent(destination.country)}`} >
                              {destination.name}
                            </Link>
                          </h3>
                          <div className="rating-start" title={`Rated 5 out of ${destination.rating}`} >
                            <span style={{ width: destination.ratingWidth || '0%' }}></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-7">
                <div className="row">
                  {destinations.slice(6, 8).map((destination, index) => (
                    <div className="col-sm-6" key={index}>
                      <div className="desti-item overlay-desti-item" >
                        <figure className="desti-image">
                          <img src={destination.image} alt={destination.name}  />
                        </figure>
                        <div className="meta-cat bg-meta-cat" >
                          <Link to={`/tour-packages?destination=${encodeURIComponent(destination.country)}`} >
                            {destination.country}
                          </Link>
                        </div>
                        <div className="desti-content" style={{ position: 'absolute', bottom: '30px', left: '10px', color: '#fff' }}>
                          <h3>
                            <Link to={`/tour-packages?destination=${encodeURIComponent(destination.country)}`}>
                              {destination.name}
                            </Link>
                          </h3>
                          <div className="rating-start" title={`Rated 5 out of ${destination.rating}`}>
                            <span style={{ width: destination.ratingWidth || '0%' }}></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!user && (
        <section
          className="subscribe-section"
          style={{ backgroundImage: 'url(/assets/images/img16.jpg)'}}
        >
          <div className="container">
            <div className="row">
              <div className="col-lg-7">
                <div className="section-heading section-heading-white">
                  <h5 className="dash-style">HOLIDAY PACKAGE OFFER</h5>
                  <h2>HOLIDAY SPECIAL 25% OFF !</h2>
                  <h4>Sign up now to receive hot special offers and information about the best tour packages, updates and discounts !!</h4>
                  <div className="newsletter-form">
                    <form onSubmit={(e) => e.preventDefault()}>
                      <input type="email" name="s" placeholder="Your Email Address" />
                      <input type="submit" name="signup" value="SIGN UP NOW!" />
                    </form>
                  </div>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo. Eaque adipiscing, luctus eleifend temporibus occaecat luctus eleifend tempo ribus.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default Destination;