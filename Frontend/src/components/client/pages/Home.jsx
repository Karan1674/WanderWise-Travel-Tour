import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../layouts/Loader';

function Home() {
  const { userType, user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [backendData, setBackendData] = useState(null);

  useEffect(() => {

    const fetchHomeData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const apiEndpoint = user ? userType === 'User' ? "/client/UserDashboard" : '/admin/AdminDashboard' : '/auth/'
        const response = await axios.get(`${apiUrl}/api${apiEndpoint}`, { withCredentials: true });
        const data = response.data;

        if (data.success) {
          if (userType === 'user' || userType == 'null') {
            setBackendData(data);
          }
          else if(userType === 'admin' || userType==='agent') {
            navigate('/dashboard', { replace: true });
          }
          else{
            navigate('/', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error fetching home page data:', error);
        toast.error(error.response.data.message)
      }
      finally {
        setLoading(false);
      }
    };
    fetchHomeData();

  }, [backendData, navigate,user]);

  if (loading) {
    return (
    <Loader/>
    );
  }

  return (
    <>
      <section className="home-slider-section">
        <div className="home-slider">
          <div className="home-banner-items">
            <div className="banner-inner-wrap" style={{ backgroundImage: 'url(/assets/images/slider-banner-1.jpg)' }}></div>
            <div className="banner-content-wrap">
              <div className="container">
                <div className="banner-content text-center">
                  <h2 className="banner-title">TRAVELLING AROUND THE WORLD</h2>
                  <p>
                    Taciti quasi, sagittis excepteur hymenaeos, id temporibus hic proident ullam,
                    eaque donec delectus tempor consectetur nunc, purus congue? Rem volutpat sodales!
                    Mollit. Minus exercitationem wisi.
                  </p>
                  <a href="#" className="button-primary">CONTINUE READING</a>
                </div>
              </div>
            </div>
            <div className="overlay"></div>
          </div>
          <div className="home-banner-items">
            <div className="banner-inner-wrap" style={{ backgroundImage: 'url(/assets/images/slider-banner-2.jpg)' }}></div>
            <div className="banner-content-wrap">
              <div className="container">
                <div className="banner-content text-center">
                  <h2 className="banner-title">EXPERIENCE THE NATURE'S BEAUTY</h2>
                  <p>
                    Taciti quasi, sagittis excepteur hymenaeos, id temporibus hic proident ullam,
                    eaque donec delectus tempor consectetur nunc, purus congue? Rem volutpat sodales!
                    Mollit. Minus exercitationem wisi.
                  </p>
                  <a href="#" className="button-primary">CONTINUE READING</a>
                </div>
              </div>
            </div>
            <div className="overlay"></div>
          </div>
        </div>
      </section>

      <div className="trip-search-section shape-search-section">
        <div className="slider-shape"></div>
        <div className="container">
          <div className="trip-search-inner white-bg d-flex">
            <div className="input-group">
              <label>Search Destination*</label>
              <input type="text" name="s" placeholder="Enter Destination" />
            </div>
            <div className="input-group">
              <label>Pax Number*</label>
              <input type="text" name="s" placeholder="No.of People" />
            </div>
            <div className="input-group width-col-3">
              <label>Checkin Date*</label>
              <i className="far fa-calendar"></i>
              <input
                className="input-date-picker"
                type="text"
                name="s"
                placeholder="MM / DD / YY"
                autoComplete="off"
                readOnly="readonly"
              />
            </div>
            <div className="input-group width-col-3">
              <label>Checkout Date*</label>
              <i className="far fa-calendar"></i>
              <input
                className="input-date-picker"
                type="text"
                name="s"
                placeholder="MM / DD / YY"
                autoComplete="off"
                readOnly="readonly"
              />
            </div>
            <div className="input-group width-col-3">
              <label className="screen-reader-text">Search</label>
              <input type="submit" name="travel-search" value="INQUIRE NOW" />
            </div>
          </div>
        </div>
      </div>

      <section className="destination-section">
        <div className="container">
          <div className="section-heading">
            <div className="row align-items-end">
              <div className="col-lg-7">
                <h5 className="dash-style">POPULAR DESTINATION</h5>
                <h2>TOP NOTCH DESTINATION</h2>
              </div>
              <div className="col-lg-5">
                <div className="section-disc">
                  Aperiam sociosqu urna praesent, tristique, corrupti condimentum asperiores platea
                  ipsum ad arcu. Nostrud. Aut nostrum, ornare quas provident laoreet nesciunt.
                </div>
              </div>
            </div>
          </div>
          <div className="destination-inner destination-three-column">
            <div className="row">
              <div className="col-lg-7">
                <div className="row">
                  <div className="col-sm-6">
                    <div className="desti-item overlay-desti-item">
                      <figure className="desti-image">
                        <img src="/assets/images/img1.jpg" alt="" />
                      </figure>
                      <div className="meta-cat bg-meta-cat">
                        <a href="#">THAILAND</a>
                      </div>
                      <div className="desti-content">
                        <h3>
                          <a href="#">Disney Land</a>
                        </h3>
                        <div className="rating-start" title="Rated 5 out of 4">
                          <span style={{ width: '53%' }}></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="desti-item overlay-desti-item">
                      <figure className="desti-image">
                        <img src="/assets/images/img2.jpg" alt="" />
                      </figure>
                      <div className="meta-cat bg-meta-cat">
                        <a href="#">NORWAY</a>
                      </div>
                      <div className="desti-content">
                        <h3>
                          <a href="#">Besseggen Ridge</a>
                        </h3>
                        <div className="rating-start" title="Rated 5 out of 5">
                          <span style={{ width: '100%' }}></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="row">
                  <div className="col-md-6 col-xl-12">
                    <div className="desti-item overlay-desti-item">
                      <figure className="desti-image">
                        <img src="/assets/images/img3.jpg" alt="" />
                      </figure>
                      <div className="meta-cat bg-meta-cat">
                        <a href="#">NEW ZEALAND</a>
                      </div>
                      <div className="desti-content">
                        <h3>
                          <a href="#">Oxolotan City</a>
                        </h3>
                        <div className="rating-start" title="Rated 5 out of 5">
                          <span style={{ width: '100%' }}></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-xl-12">
                    <div className="desti-item overlay-desti-item">
                      <figure className="desti-image">
                        <img src="/assets/images/img4.jpg" alt="" />
                      </figure>
                      <div className="meta-cat bg-meta-cat">
                        <a href="#">SINGAPORE</a>
                      </div>
                      <div className="desti-content">
                        <h3>
                          <a href="#">Marina Bay Sand City</a>
                        </h3>
                        <div className="rating-start" title="Rated 5 out of 4">
                          <span style={{ width: '60%' }}></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="btn-wrap text-center">
              <a href="#" className="button-primary">MORE DESTINATION</a>
            </div>
          </div>
        </div>
      </section>

      <section className="package-section">
        <div className="container">
          <div className="section-heading text-center">
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <h5 className="dash-style">EXPLORE GREAT PLACES</h5>
                <h2>POPULAR PACKAGES</h2>
                <p>
                  Mollit voluptatem perspiciatis convallis elementum corporis quo veritatis aliquid
                  blandit, blandit torquent, odit placeat. Adipiscing repudiandae eius cursus? Nostrum
                  magnis maxime curae placeat.
                </p>
              </div>
            </div>
          </div>
          <div className="package-inner">
            <div className="row">
              <div className="col-lg-4 col-md-6">
                <div className="package-wrap">
                  <figure className="feature-image">
                    <a href="#">
                      <img src="/assets/images/img5.jpg" alt="" />
                    </a>
                  </figure>
                  <div className="package-price">
                    <h6>
                      <span>$1,900</span> / per person
                    </h6>
                  </div>
                  <div className="package-content-wrap">
                    <div className="package-meta text-center">
                      <ul>
                        <li>
                          <i className="far fa-clock"></i>
                          7D/6N
                        </li>
                        <li>
                          <i className="fas fa-user-friends"></i>
                          People: 5
                        </li>
                        <li>
                          <i className="fas fa-map-marker-alt"></i>
                          Malaysia
                        </li>
                      </ul>
                    </div>
                    <div className="package-content">
                      <h3>
                        <a href="#">Sunset view of beautiful lakeside resident</a>
                      </h3>
                      <div className="review-area">
                        <span className="review-text">(25 reviews)</span>
                        <div className="rating-start" title="Rated 5 out of 5">
                          <span style={{ width: '60%' }}></span>
                        </div>
                      </div>
                      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit luctus nec ullam. Ut elit tellus, luctus nec ullam elit tellpus.</p>
                      <div className="btn-wrap">
                        <a href="#" className="button-text width-6">Book Now<i className="fas fa-arrow-right"></i></a>
                        <a href="#" className="button-text width-6">Wish List<i className="far fa-heart"></i></a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6">
                <div className="package-wrap">
                  <figure className="feature-image">
                    <a href="#">
                      <img src="/assets/images/img6.jpg" alt="" />
                    </a>
                  </figure>
                  <div className="package-price">
                    <h6>
                      <span>$1,230</span> / per person
                    </h6>
                  </div>
                  <div className="package-content-wrap">
                    <div className="package-meta text-center">
                      <ul>
                        <li>
                          <i className="far fa-clock"></i>
                          5D/4N
                        </li>
                        <li>
                          <i className="fas fa-user-friends"></i>
                          People: 8
                        </li>
                        <li>
                          <i className="fas fa-map-marker-alt"></i>
                          Canada
                        </li>
                      </ul>
                    </div>
                    <div className="package-content">
                      <h3>
                        <a href="#">Experience the natural beauty of island</a>
                      </h3>
                      <div className="review-area">
                        <span className="review-text">(17 reviews)</span>
                        <div className="rating-start" title="Rated 5 out of 5">
                          <span style={{ width: '100%' }}></span>
                        </div>
                      </div>
                      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit luctus nec ullam. Ut elit tellus, luctus nec ullam elit tellpus.</p>
                      <div className="btn-wrap">
                        <a href="#" className="button-text width-6">Book Now<i className="fas fa-arrow-right"></i></a>
                        <a href="#" className="button-text width-6">Wish List<i className="far fa-heart"></i></a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6">
                <div className="package-wrap">
                  <figure className="feature-image">
                    <a href="#">
                      <img src="/assets/images/img7.jpg" alt="" />
                    </a>
                  </figure>
                  <div className="package-price">
                    <h6>
                      <span>$2,000</span> / per person
                    </h6>
                  </div>
                  <div className="package-content-wrap">
                    <div className="package-meta text-center">
                      <ul>
                        <li>
                          <i className="far fa-clock"></i>
                          6D/5N
                        </li>
                        <li>
                          <i className="fas fa-user-friends"></i>
                          People: 6
                        </li>
                        <li>
                          <i className="fas fa-map-marker-alt"></i>
                          Portugal
                        </li>
                      </ul>
                    </div>
                    <div className="package-content">
                      <h3>
                        <a href="#">Vacation to the water city of Portugal</a>
                      </h3>
                      <div className="review-area">
                        <span className="review-text">(22 reviews)</span>
                        <div className="rating-start" title="Rated 5 out of 5">
                          <span style={{ width: '80%' }}></span>
                        </div>
                      </div>
                      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit luctus nec ullam. Ut elit tellus, luctus nec ullam elit tellpus.</p>
                      <div className="btn-wrap">
                        <a href="#" className="button-text width-6">Book Now<i className="fas fa-arrow-right"></i></a>
                        <a href="#" className="button-text width-6">Wish List<i className="far fa-heart"></i></a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="btn-wrap text-center">
              <a href="#" className="button-primary">VIEW ALL PACKAGES</a>
            </div>
          </div>
        </div>
      </section>

      <section className="callback-section">
        <div className="container">
          <div className="row no-gutters align-items-center">
            <div className="col-lg-5">
              <div className="callback-img" style={{ backgroundImage: 'url(/assets/images/img8.jpg)' }}>
                <div className="video-button">
                  <a id="video-container" data-video-id="IUN664s7N-c">
                    <i className="fas fa-play"></i>
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="callback-inner">
                <div className="section-heading section-heading-white">
                  <h5 className="dash-style">CALLBACK FOR MORE</h5>
                  <h2>GO TRAVEL. DISCOVER. REMEMBER US!!</h2>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec
                    ullamcorper mattis, pulvinar dapibus leo. Eaque adipiscing, luctus eleifend.
                  </p>
                </div>
                <div className="callback-counter-wrap">
                  <div className="counter-item">
                    <div className="counter-icon">
                      <img src="/assets/images/icon1.png" alt="" />
                    </div>
                    <div className="counter-content">
                      <span className="counter-no">
                        <span className="counter">500</span>K+
                      </span>
                      <span className="counter-text">Satisfied Clients</span>
                    </div>
                  </div>
                  <div className="counter-item">
                    <div className="counter-icon">
                      <img src="/assets/images/icon2.png" alt="" />
                    </div>
                    <div className="counter-content">
                      <span className="counter-no">
                        <span className="counter">250</span>K+
                      </span>
                      <span className="counter-text">Satisfied Clients</span>
                    </div>
                  </div>
                  <div className="counter-item">
                    <div className="counter-icon">
                      <img src="/assets/images/icon3.png" alt="" />
                    </div>
                    <div className="counter-content">
                      <span className="counter-no">
                        <span className="counter">15</span>K+
                      </span>
                      <span className="counter-text">Satisfied Clients</span>
                    </div>
                  </div>
                  <div className="counter-item">
                    <div className="counter-icon">
                      <img src="/assets/images/icon4.png" alt="" />
                    </div>
                    <div className="counter-content">
                      <span className="counter-no">
                        <span className="counter">10</span>K+
                      </span>
                      <span className="counter-text">Satisfied Clients</span>
                    </div>
                  </div>
                </div>
                <div className="support-area">
                  <div className="support-icon">
                    <img src="/assets/images/icon5.png" alt="" />
                  </div>
                  <div className="support-content">
                    <h4>Our 24/7 Emergency Phone Services</h4>
                    <h3>
                      <a href="#">Call: 123-456-7890</a>
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="activity-section">
        <div className="container">
          <div className="section-heading text-center">
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <h5 className="dash-style">TRAVEL BY ACTIVITY</h5>
                <h2>ADVENTURE & ACTIVITY</h2>
                <p>
                  Mollit voluptatem perspiciatis convallis elementum corporis quo veritatis aliquid
                  blandit, blandit torquent, odit placeat. Adipiscing repudiandae eius cursus? Nostrum
                  magnis maxime curae placeat.
                </p>
              </div>
            </div>
          </div>
          <div className="activity-inner row">
            <div className="col-lg-2 col-md-4 col-sm-6">
              <div className="activity-item">
                <div className="activity-icon">
                  <a href="#">
                    <img src="/assets/images/icon6.png" alt="" />
                  </a>
                </div>
                <div className="activity-content">
                  <h4>
                    <a href="#">Adventure</a>
                  </h4>
                  <p>15 Destination</p>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-sm-6">
              <div className="activity-item">
                <div className="activity-icon">
                  <a href="#">
                    <img src="/assets/images/icon10.png" alt="" />
                  </a>
                </div>
                <div className="activity-content">
                  <h4>
                    <a href="#">Trekking</a>
                  </h4>
                  <p>12 Destination</p>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-sm-6">
              <div className="activity-item">
                <div className="activity-icon">
                  <a href="#">
                    <img src="/assets/images/icon9.png" alt="" />
                  </a>
                </div>
                <div className="activity-content">
                  <h4>
                    <a href="#">Camp Fire</a>
                  </h4>
                  <p>7 Destination</p>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-sm-6">
              <div className="activity-item">
                <div className="activity-icon">
                  <a href="#">
                    <img src="/assets/images/icon8.png" alt="" />
                  </a>
                </div>
                <div className="activity-content">
                  <h4>
                    <a href="#">Off Road</a>
                  </h4>
                  <p>15 Destination</p>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-sm-6">
              <div className="activity-item">
                <div className="activity-icon">
                  <a href="#">
                    <img src="/assets/images/icon7.png" alt="" />
                  </a>
                </div>
                <div className="activity-content">
                  <h4>
                    <a href="#">Camping</a>
                  </h4>
                  <p>13 Destination</p>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-sm-6">
              <div className="activity-item">
                <div className="activity-icon">
                  <a href="#">
                    <img src="/assets/images/icon11.png" alt="" />
                  </a>
                </div>
                <div className="activity-content">
                  <h4>
                    <a href="#">Exploring</a>
                  </h4>
                  <p>25 Destination</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="special-section">
        <div className="container">
          <div className="section-heading text-center">
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <h5 className="dash-style">TRAVEL OFFER & DISCOUNT</h5>
                <h2>SPECIAL TRAVEL OFFER</h2>
                <p>
                  Mollit voluptatem perspiciatis convallis elementum corporis quo veritatis aliquid
                  blandit, blandit torquent, odit placeat. Adipiscing repudiandae eius cursus? Nostrum
                  magnis maxime curae placeat.
                </p>
              </div>
            </div>
          </div>
          <div className="special-inner">
            <div className="row">
              <div className="col-md-6 col-lg-4">
                <div className="special-item">
                  <figure className="special-img">
                    <img src="/assets/images/img9.jpg" alt="" />
                  </figure>
                  <div className="badge-dis">
                    <span>
                      <strong>20%</strong> off
                    </span>
                  </div>
                  <div className="special-content">
                    <div className="meta-cat">
                      <a href="#">CANADA</a>
                    </div>
                    <h3>
                      <a href="#">Experience the natural beauty of glacier</a>
                    </h3>
                    <div className="package-price">
                      Price: <del>$1500</del> <ins>$1200</ins>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="special-item">
                  <figure className="special-img">
                    <img src="/assets/images/img10.jpg" alt="" />
                  </figure>
                  <div className="badge-dis">
                    <span>
                      <strong>15%</strong> off
                    </span>
                  </div>
                  <div className="special-content">
                    <div className="meta-cat">
                      <a href="#">NEW ZEALAND</a>
                    </div>
                    <h3>
                      <a href="#">Trekking to the mountain camp site</a>
                    </h3>
                    <div className="package-price">
                      Price: <del>$1300</del> <ins>$1105</ins>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="special-item">
                  <figure className="special-img">
                    <img src="/assets/images/img11.jpg" alt="" />
                  </figure>
                  <div className="badge-dis">
                    <span>
                      <strong>15%</strong> off
                    </span>
                  </div>
                  <div className="special-content">
                    <div className="meta-cat">
                      <a href="#">MALAYSIA</a>
                    </div>
                    <h3>
                      <a href="#">Sunset view of beautiful lakeside city</a>
                    </h3>
                    <div className="package-price">
                      Price: <del>$1800</del> <ins>$1476</ins>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="best-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-5">
              <div className="section-heading">
                <h5 className="dash-style">OUR TOUR GALLERY</h5>
                <h2>BEST TRAVELER'S SHARED PHOTOS</h2>
                <p>
                  Aperiam sociosqu urna praesent, tristique, corrupti condimentum asperiores platea
                  ipsum ad arcu. Nostrud. Esse? Aut nostrum, ornare quas provident laoreet nesciunt
                  odio voluptates etiam, omnis.
                </p>
              </div>
              <figure className="gallery-img">
                <img src="/assets/images/img12.jpg" alt="" />
              </figure>
            </div>
            <div className="col-lg-7">
              <div className="row">
                <div className="col-sm-6">
                  <figure className="gallery-img">
                    <img src="/assets/images/img13.jpg" alt="" />
                  </figure>
                </div>
                <div className="col-sm-6">
                  <figure className="gallery-img">
                    <img src="/assets/images/img14.jpg" alt="" />
                  </figure>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <figure className="gallery-img">
                    <img src="/assets/images/img15.jpg" alt="" />
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="client-section">
        <div className="container">
          <div className="client-wrap client-slider secondary-bg">
            <div className="client-item">
              <figure>
                <img src="/assets/images/logo1.png" alt="" />
              </figure>
            </div>
            <div className="client-item">
              <figure>
                <img src="/assets/images/logo2.png" alt="" />
              </figure>
            </div>
            <div className="client-item">
              <figure>
                <img src="/assets/images/logo3.png" alt="" />
              </figure>
            </div>
            <div className="client-item">
              <figure>
                <img src="/assets/images/logo4.png" alt="" />
              </figure>
            </div>
            <div className="client-item">
              <figure>
                <img src="/assets/images/logo5.png" alt="" />
              </figure>
            </div>
            <div className="client-item">
              <figure>
                <img src="/assets/images/logo2.png" alt="" />
              </figure>
            </div>
          </div>
        </div>
      </div>

      <section className="subscribe-section" style={{ backgroundImage: 'url(/assets/images/img16.jpg)' }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-7">
              <div className="section-heading section-heading-white">
                <h5 className="dash-style">HOLIDAY PACKAGE OFFER</h5>
                <h2>HOLIDAY SPECIAL 25% OFF !</h2>
                <h4>
                  Sign up now to recieve hot special offers and information about the best tour
                  packages, updates and discounts !!
                </h4>
                <div className="newsletter-form">
                  <form>
                    <input type="email" name="s" placeholder="Your Email Address" />
                    <input type="submit" name="signup" value="SIGN UP NOW!" />
                  </form>
                </div>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec
                  ullamcorper mattis, pulvinar dapibus leo. Eaque adipiscing, luctus eleifend
                  temporibus occaecat luctus eleifend tempo ribus.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="blog-section">
        <div className="container">
          <div className="section-heading text-center">
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <h5 className="dash-style">FROM OUR BLOG</h5>
                <h2>OUR RECENT POSTS</h2>
                <p>
                  Mollit voluptatem perspiciatis convallis elementum corporis quo veritatis aliquid
                  blandit, blandit torquent, odit placeat. Adipiscing repudiandae eius cursus? Nostrum
                  magnis maxime curae placeat.
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 col-lg-4">
              <article className="post">
                <figure className="feature-image">
                  <a href="#">
                    <img src="/assets/images/img17.jpg" alt="" />
                  </a>
                </figure>
                <div className="entry-content">
                  <h3>
                    <a href="#">Life is a beautiful journey not a destination</a>
                  </h3>
                  <div className="entry-meta">
                    <span className="byline">
                      <a href="#">Demoteam</a>
                    </span>
                    <span className="posted-on">
                      <a href="#">August 17, 2021</a>
                    </span>
                    <span className="comments-link">
                      <a href="#">No Comments</a>
                    </span>
                  </div>
                </div>
              </article>
            </div>
            <div className="col-md-6 col-lg-4">
              <article className="post">
                <figure className="feature-image">
                  <a href="#">
                    <img src="/assets/images/img18.jpg" alt="" />
                  </a>
                </figure>
                <div className="entry-content">
                  <h3>
                    <a href="#">Take only memories, leave only footprints</a>
                  </h3>
                  <div className="entry-meta">
                    <span className="byline">
                      <a href="#">Demoteam</a>
                    </span>
                    <span className="posted-on">
                      <a href="#">August 17, 2021</a>
                    </span>
                    <span className="comments-link">
                      <a href="#">No Comments</a>
                    </span>
                  </div>
                </div>
              </article>
            </div>
            <div className="col-md-6 col-lg-4">
              <article className="post">
                <figure className="feature-image">
                  <a href="#">
                    <img src="/assets/images/img19.jpg" alt="" />
                  </a>
                </figure>
                <div className="entry-content">
                  <h3>
                    <a href="#">Journeys are best measured in new friends</a>
                  </h3>
                  <div className="entry-meta">
                    <span className="byline">
                      <a href="#">Demoteam</a>
                    </span>
                    <span className="posted-on">
                      <a href="#">August 17, 2021</a>
                    </span>
                    <span className="comments-link">
                      <a href="#">No Comments</a>
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <div className="testimonial-section" style={{ backgroundImage: 'url(/assets/images/img23.jpg)' }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-10 offset-lg-1">
              <div className="testimonial-inner testimonial-slider">
                <div className="testimonial-item text-center">
                  <figure className="testimonial-img">
                    <img src="/assets/images/img20.jpg" alt="" />
                  </figure>
                  <div className="testimonial-content">
                    <p>
                      " Dolorum aenean dolorem minima! Voluptatum? Corporis condimentum ac primis fusce, atque!
                      Vivamus. Non cupiditate natus excepturi, quod quo, aute facere? Deserunt aliquip, egestas
                      ipsum, eu.Dolorum aenean dolorem minima!? Corporis condi mentum acpri! "
                    </p>
                    <cite>
                      Johny English
                      <span className="company">Travel Agent</span>
                    </cite>
                  </div>
                </div>
                <div className="testimonial-item text-center">
                  <figure className="testimonial-img">
                    <img src="/assets/images/img21.jpg" alt="" />
                  </figure>
                  <div className="testimonial-content">
                    <p>
                      " Dolorum aenean dolorem minima! Voluptatum? Corporis condimentum ac primis fusce, atque!
                      Vivamus. Non cupiditate natus excepturi, quod quo, aute facere? Deserunt aliquip, egestas
                      ipsum, eu.Dolorum aenean dolorem minima!? Corporis condi mentum acpri! "
                    </p>
                    <cite>
                      William Housten
                      <span className="company">Travel Agent</span>
                    </cite>
                  </div>
                </div>
                <div className="testimonial-item text-center">
                  <figure className="testimonial-img">
                    <img src="/assets/images/img22.jpg" alt="" />
                  </figure>
                  <div className="testimonial-content">
                    <p>
                      " Dolorum aenean dolorem minima! Voluptatum? Corporis condimentum ac primis fusce, atque!
                      Vivamus. Non cupiditate natus excepturi, quod quo, aute facere? Deserunt aliquip, egestas
                      ipsum, eu.Dolorum aenean dolorem minima!? Corporis condi mentum acpri! "
                    </p>
                    <cite>
                      Alison Wright
                      <span className="company">Travel Guide</span>
                    </cite>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="contact-section">
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
                        <li>
                          <a href="#">support@gmail.com</a>
                        </li>
                        <li>
                          <a href="#">info@domain.com</a>
                        </li>
                        <li>
                          <a href="#">name@company.com</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="contact-details">
                      <div className="contact-icon">
                        <img src="/assets/images/icon13.png" alt="" />
                      </div>
                      <ul>
                        <li>
                          <a href="#">+132 (599) 254 669</a>
                        </li>
                        <li>
                          <a href="#">+123 (669) 255 587</a>
                        </li>
                        <li>
                          <a href="#">+01 (977) 2599 12</a>
                        </li>
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
                <a href="#" className="button-primary">LEARN MORE</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
