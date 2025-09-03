import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../layouts/Loader';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function Home() {
  const { userType, user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [backendData, setBackendData] = useState({
    destinations: [],
    packages: [],
    testimonials: [],
  });

  const sliderSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  const linksSetting = {
    slidesToShow: 6,
  };

  const testimonialSettings={
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    dots:true,
   arrows:false,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  }

  useEffect(() => {
    const fetchHomeData = async () => {
      try {

        if(user &&( userType === 'admin' || userType === 'agent') ){
          navigate('/dashboard', { replace: true });
        }

        if (!user || userType !== 'User') {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/`, {
            withCredentials: true,
          });
          setBackendData({  destinations: response.data.destinations || [],
            packages: response.data.packages || [],
            testimonials: response.data.testimonials || [],});
            console.log(backendData)
          setLoading(false);
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/client/UserDashboard`, {
          withCredentials: true,
        });

        if (response.data.success) {
          setBackendData({
            destinations: response.data.destinations || [],
            packages: response.data.packages || [],
            testimonials: response.data.testimonials || [],
          });
          console.log(backendData)
        } else {
          toast.error(response.data.message || 'Failed to load home page');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching home page data:', error);
        toast.error(error.response?.data?.message || 'Server error');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
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
        setBackendData((prev) => ({
          ...prev,
          packages: prev.packages.map((pkg) =>
            pkg._id === packageId ? { ...pkg, isWishlisted: !isWishlisted } : pkg
          ),
        }));
        toast.success(`Package ${isWishlisted ? 'removed from' : 'added to'} wishlist`);
      } else {
        toast.error(response.data.message || `Failed to ${action} package to wishlist`);
      }
    } catch (error) {
      console.error(`Error ${isWishlisted ? 'removing' : 'adding'} package to wishlist:`, error);
      toast.error(`${user ? 'Server Error. Try Again Later':'LogIn First to Wishlist Package'}`);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <section className="home-slider-section">
        <Slider className="home-slider" {...sliderSettings}>
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
                  <Link to="/continue-reading" className="button-primary">
                    CONTINUE READING
                  </Link>
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
                  <Link to="/continue-reading" className="button-primary">
                    CONTINUE READING
                  </Link>
                </div>
              </div>
            </div>
            <div className="overlay"></div>
          </div>
        </Slider>
      </section>

      <div className="trip-search-section shape-search-section">
        <div className="slider-shape"></div>
        <div className="container">
          <form action="/tour-packages" method="GET" className="trip-search-inner white-bg d-flex">
            <div className="input-group">
              <label>Search Destination*</label>
              <input type="text" name="destination" placeholder="Enter Destination" />
            </div>
            <div className="input-group">
              <label>Pax Number*</label>
              <input type="number" name="pax" placeholder="No.of People" min="1" />
            </div>
            <div className="input-group width-col-3">
              <label>Checkin Date*</label>
              <i className="far fa-calendar"></i>
              <input
                className="input-date-picker"
                type="text"
                name="checkin"
                placeholder="MM / DD / YY"
                autoComplete="off"
                readOnly
              />
            </div>
            <div className="input-group width-col-3">
              <label>Checkout Date*</label>
              <i className="far fa-calendar"></i>
              <input
                className="input-date-picker"
                type="text"
                name="checkout"
                placeholder="MM / DD / YY"
                autoComplete="off"
                readOnly
              />
            </div>
            <div className="input-group width-col-3">
              <label className="screen-reader-text">Search</label>
              <input type="submit" name="travel-search" value="INQUIRE NOW" />
            </div>
          </form>
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
                  {backendData.destinations.slice(0, 2).map((destination, index) => (
                    <div className="col-sm-6" key={index}>
                      <div className="desti-item overlay-desti-item">
                        <figure className="desti-image" >
                          <img
                            src={destination.image || `/assets/images/img${index + 1}.jpg`}
                            alt={destination.name}
                          />
                        </figure>
                        <div className="meta-cat bg-meta-cat">
                          <Link to={`/tour-packages?destination=${destination.name}`}>
                            {destination.country.toUpperCase()}
                          </Link>
                        </div>
                        <div className="desti-content" style={{bottom: '30px'}}>
                          <h3>
                            <Link to={`/tour-packages?destination=${destination.name}`}>
                              {destination.name}
                            </Link>
                          </h3>
                          <div className="rating-start" title={`Rated 5 out of ${index === 0 ? 4 : 5}`}>
                            <span style={{ width: `${index === 0 ? 53 : 100}%` }}></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-5">
                <div className="row">
                  {backendData.destinations.slice(2, 4).map((destination, index) => (
                    <div className="col-md-6 col-xl-12" key={index}>
                      <div className="desti-item overlay-desti-item">
                        <figure className="desti-image">
                          <img
                            src={destination.image || `/assets/images/img${index + 3}.jpg`}
                            alt={destination.name}
                          />
                        </figure>
                        <div className="meta-cat bg-meta-cat">
                          <Link to={`/tour-packages?destination=${destination.name}`}>
                            {destination.name.toUpperCase()}
                          </Link>
                        </div>
                        <div className="desti-content" style={{bottom: '30px'}}>
                          <h3>
                            <Link to={`/tour-packages?destination=${destination.name}`}>
                              {destination.name}
                            </Link>
                          </h3>
                          <div className="rating-start" title="Rated 5 out of 5">
                            <span style={{ width: `${index === 0 ? 100 : 60}%` }}></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="btn-wrap text-center">
              <Link to="/destination" className="button-primary">
                MORE DESTINATION
              </Link>
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
              {backendData.packages.map((pkg) => (
                <div className="col-lg-4 col-md-6" key={pkg._id}>
                  <div className="package-wrap">
                    <figure className="feature-image">
                      <Link to={`/package-detail/${pkg._id}`}>
                        <img src={`${import.meta.env.VITE_API_URL}/Uploads/gallery/${pkg.featuredImage}`} alt={pkg.title} />
                      </Link>
                    </figure>
                    <div className="package-price">
                      <h6>
                        <span>${pkg.regularPrice.toFixed(2)}</span> / per person
                      </h6>
                    </div>
                    <div className="package-content-wrap">
                      <div className="package-meta text-center">
                        <ul>
                          <li>
                            <i className="far fa-clock"></i> {pkg.duration}
                          </li>
                          <li>
                            <i className="fas fa-user-friends"></i> People: {pkg.groupSize}
                          </li>
                          <li>
                            <i className="fas fa-map-marker-alt"></i> {pkg.destinationCountry}
                          </li>
                        </ul>
                      </div>
                      <div className="package-content">
                        <h3>
                          <Link to={`/package-detail/${pkg._id}`}>{pkg.title}</Link>
                        </h3>
                        <div className="review-area">
                          <span className="review-text">({pkg.reviewCount} reviews)</span>
                          <div className="rating-start" title={`Rated ${pkg.averageRating} out of 5`}>
                            <span style={{ width: `${pkg.averageRating * 20}%` }}></span>
                          </div>
                        </div>
                        <p>
                          {pkg.shortDescription ||
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit luctus nec ullam. Ut elit tellus, luctus nec ullam elit tellpus.'}
                        </p>
                        <div className="btn-wrap">
                          <Link to={`/bookPackage/${pkg._id}`} className=" width-6">
                            Book Now<i className="fas fa-arrow-right"></i>
                          </Link>
                          <a
                            className="wishlist-toggle width-6"
                            data-package-id={pkg._id}
                            data-is-wishlisted={pkg.isWishlisted}
                            onClick={() => handleWishlistToggle(pkg._id, pkg.isWishlisted)}
                          >
                            {  pkg.isWishlisted ? 'Remove' : 'Wish List'}
                            <i className={ pkg.isWishlisted ? 'fas fa-heart' : 'far fa-heart'}></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="btn-wrap text-center">
              <Link to="/tour-packages" className="button-primary">
                VIEW ALL PACKAGES
              </Link>
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
            {[
              { icon: 'icon6.png', title: 'Adventure', destinations: 15 },
              { icon: 'icon10.png', title: 'Trekking', destinations: 12 },
              { icon: 'icon9.png', title: 'Camp Fire', destinations: 7 },
              { icon: 'icon8.png', title: 'Off Road', destinations: 15 },
              { icon: 'icon7.png', title: 'Camping', destinations: 13 },
              { icon: 'icon11.png', title: 'Exploring', destinations: 25 },
            ].map((activity, index) => (
              <div className="col-lg-2 col-md-4 col-sm-6" key={index}>
                <div className="activity-item">
                  <div className="activity-icon">
                    <a href="#">
                      <img src={`/assets/images/${activity.icon}`} alt={activity.title} />
                    </a>
                  </div>
                  <div className="activity-content">
                    <h4>
                      <a href="#">{activity.title}</a>
                    </h4>
                    <p>{activity.destinations} Destination</p>
                  </div>
                </div>
              </div>
            ))}
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
              {backendData.packages
                .filter((pkg) => pkg.discount > 0)
                .slice(0, 3)
                .map((pkg, index) => (
                  <div className="col-md-6 col-lg-4" key={index}>
                    <div className="special-item">
                      <figure className="special-img">
                        <img src={`${import.meta.env.VITE_API_URL}/Uploads/gallery/${pkg.featuredImage}`} alt={pkg.title} />
                      </figure>
                      <div className="badge-dis">
                        <span>
                          <strong>{pkg.discount}%</strong> off
                        </span>
                      </div>
                      <div className="special-content">
                        <div className="meta-cat">
                          <Link to={`/tour-packages?destination=${pkg.destinationCountry}`}>
                            {pkg.destinationCountry.toUpperCase()}
                          </Link>
                        </div>
                        <h3>
                          <Link to={`/tour-packages/${pkg._id}`}>{pkg.title}</Link>
                        </h3>
                        <div className="package-price">
                          Price: <del>${pkg.regularPrice.toFixed(2)}</del>{' '}
                          <ins>${pkg.salePrice.toFixed(2)}</ins>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
          <Slider className="client-wrap client-slider secondary-bg" {...linksSetting}>
            {['logo1.png', 'logo2.png', 'logo3.png', 'logo4.png', 'logo5.png', 'logo2.png'].map(
              (logo, index) => (
                <div className="client-item" key={index}>
                  <figure>
                    <img src={`/assets/images/${logo}`} alt="" />
                  </figure>
                </div>
              )
            )}
          </Slider>
        </div>
      </div>

      {!user && (
        <section className="subscribe-section" style={{ backgroundImage: 'url(/assets/images/img16.jpg)' }}>
          <div className="container">
            <div className="row">
              <div className="col-lg-7">
                <div className="section-heading section-heading-white">
                  <h5 className="dash-style">HOLIDAY PACKAGE OFFER</h5>
                  <h2>HOLIDAY SPECIAL 25% OFF !</h2>
                  <h4>
                    Sign up now to receive hot special offers and information about the best tour
                    packages, updates and discounts !!
                  </h4>
                  <div className="newsletter-form">
                    <form action="/signupUser" method="GET">
                      <input type="email" name="email" placeholder="Your Email Address" required />
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
      )}

      <div className="testimonial-section " style={{marginTop:'8rem',  backgroundImage: 'url(/assets/images/img23.jpg)' }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-10 offset-lg-1">
              <Slider className="testimonial-inner testimonial-slider" {...testimonialSettings}>
                {backendData.testimonials.map((testimonial, index) => (
                  <div className="testimonial-item text-center" key={index}>
                    <figure className="testimonial-img">
                      <img src={testimonial.image} alt={testimonial.name} />
                    </figure>
                    <div className="testimonial-content">
                      <p>{testimonial.content}</p>
                      <cite>
                        {testimonial.name}
                        <span className="company">{testimonial.role}</span>
                      </cite>
                    </div>
                  </div>
                ))}
              </Slider>
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
                <Link to="/careers" className="button-primary">
                  LEARN MORE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;