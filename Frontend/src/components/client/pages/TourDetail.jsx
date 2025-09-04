import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Loader from '../layouts/Loader';
import '../../../styles/custom.scss';

function TourDetail() {
  const { user, userType } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState({ package: null, user: null, reviews: [], reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    packageId: id,
    name: user ? `${user.firstName} ${user.lastName}` : '',
    email: user ? user.email : '',
    subject: '',
    comment: '',
    rating: 0,
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const ratingLabelsRef = useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/client/package-detail/${id}`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setData(response.data);
          setFormData((prev) => ({
            ...prev,
            packageId: id,
            name: response.data.user ? `${response.data.user.firstName} ${response.data.user.lastName}` : '',
            email: response.data.user ? response.data.user.email : '',
          }));
        } else {
          toast.error(response.data.message || 'Failed to load package details');
          navigate('/tour-packages');
        }
      } catch (error) {
        console.error('Error fetching package details:', error);
        toast.error(error.response?.data?.message || 'Server error');
        navigate('/tour-packages');
      } finally {
        setLoading(false);
      }
    };

    if (user && userType === 'User') {
      fetchData();
    } else {
      toast.error('Unauthorized access');
      navigate('/login');
    }
  }, [navigate, user, userType, id]);

  useEffect(() => {
    const ratingInputs = document.querySelectorAll('.package-rate input[type="radio"]');
    const ratingLabels = document.querySelectorAll('.package-rate label');
    ratingLabelsRef.current = Array.from(ratingLabels);

    const updateStarRating = (upToIndex) => {
      ratingLabelsRef.current.forEach((label, index) => {
        label.classList.toggle('filled', index <= upToIndex);
      });
    };

    // Apply initial rating
    updateStarRating(formData.rating - 1);

    ratingInputs.forEach((input, index) => {
      const handleChange = () => {
        updateStarRating(index);
        handleRatingChange(parseInt(input.value));
      };
      input.addEventListener('change', handleChange);
    });

    ratingLabels.forEach((label, index) => {
      label.addEventListener('mouseenter', () => updateStarRating(index));
      label.addEventListener('mouseleave', () => updateStarRating(formData.rating - 1));
    });

    return () => {
      ratingInputs.forEach((input) => {
        input.removeEventListener('change', () => { });
      });
      ratingLabels.forEach((label) => {
        label.removeEventListener('mouseenter', () => { });
        label.removeEventListener('mouseleave', () => { });
      });
    };
  }, [formData.rating]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!formData.rating) {
      setMessage({ text: 'Please select a rating', type: 'error' });
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/client/review/${id}`,
        { ...formData, rating: parseInt(formData.rating) },
        { withCredentials: true }
      );
      if (response.status === 201) {
        toast.success(response.data.message);
        setData((prev) => ({
          ...prev,
          reviews: [...prev.reviews, response.data.review],
          reviewCount: prev.reviewCount + 1,
        }));
        setFormData((prev) => ({ ...prev, subject: '', comment: '', rating: 0 }));
        setMessage({ text: response.data.message, type: 'success' });
        ratingLabelsRef.current.forEach((label) => label.classList.remove('filled'));
      } else {
        setMessage({ text: response.data.message || 'Failed to submit review', type: 'error' });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setMessage({ text: 'Error submitting review', type: 'error' });
    }

    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleAddToCart = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/client/packageCart/add`,
        { packageId: id, quantity: 1 },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success('Successfully added to cart');
      } else {
        toast.error(response.data.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error adding to cart');
    }
  };

  if (loading) {
    return <Loader />;
  }

  const { package: pkg, reviews, reviewCount } = data;

  if (!pkg) {
    return (
      <div className="single-tour-section">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h3>Package Not Found</h3>
              <p>The requested package is not available or is not active. Please explore other packages.</p>
              <Link to="/tour-packages" className="button-primary">
                View All Packages
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : '0';

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="custom">
      <section className="inner-banner-wrap">
        <div className="inner-baner-container" style={{ backgroundImage: 'url(/assets/images/inner-banner.jpg)' }}>
          <div className="container">
            <div className="inner-banner-content">
              <h1 className="inner-title">{pkg.title || 'Package Not Found'}</h1>
            </div>
          </div>
        </div>
        <div className="inner-shape"></div>
      </section>

      <div className="single-tour-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="single-tour-inner">
                <h2>{pkg.title || 'Untitled Package'}</h2>
                <figure className="feature-image">
                  <img
                    src={pkg.featuredImage ? `${import.meta.env.VITE_API_URL}/Uploads/gallery/${pkg.featuredImage}` : '/assets/images/default.jpg'}
                    alt={pkg.title || 'Package Image'}
                  />
                  <div className="package-meta text-center">
                    <ul>
                      <li>
                        <i className="far fa-clock"></i>
                        {pkg.tripDuration?.days || 0} days / {pkg.tripDuration?.nights || 0} night
                      </li>
                      <li>
                        <i className="fas fa-user-friends"></i>
                        People: {pkg.groupSize || 'N/A'}
                      </li>
                      <li>
                        <i className="fas fa-map-marked-alt"></i>
                        {pkg.destinationCountry || 'N/A'}
                      </li>
                    </ul>
                  </div>
                </figure>
                <div className="tab-container">
                  <ul className="nav nav-tabs" id="myTab" role="tablist" style={{ listStyle: 'none' }}>
                    <li className="nav-item">
                      <a
                        className="nav-link active"
                        id="overview-tab"
                        data-bs-toggle="tab"
                        href="#overview"
                        role="tab"
                        aria-controls="overview"
                        aria-selected="true"
                      >
                        DESCRIPTION
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className="nav-link"
                        id="program-tab"
                        data-bs-toggle="tab"
                        href="#program"
                        role="tab"
                        aria-controls="program"
                        aria-selected="false"
                      >
                        PROGRAM
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className="nav-link"
                        id="itinerary-overview-tab"
                        data-bs-toggle="tab"
                        href="#itinerary-overview"
                        role="tab"
                        aria-controls="itinerary-overview"
                        aria-selected="false"
                      >
                        ITINERARY
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className="nav-link"
                        id="additional-info-tab"
                        data-bs-toggle="tab"
                        href="#additional-info"
                        role="tab"
                        aria-controls="additional-info"
                        aria-selected="false"
                      >
                        ADDITIONAL INFO
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className="nav-link"
                        id="review-tab"
                        data-bs-toggle="tab"
                        href="#review"
                        role="tab"
                        aria-controls="review"
                        aria-selected="false"
                      >
                        REVIEW
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className="nav-link"
                        id="map-tab"
                        data-bs-toggle="tab"
                        href="#map"
                        role="tab"
                        aria-controls="map"
                        aria-selected="false"
                      >
                        MAP
                      </a>
                    </li>
                  </ul>
                  <div className="tab-content" id="myTabContent">
                    <div className="tab-pane fade show active" id="overview" role="tabpanel" aria-labelledby="overview-tab">
                      <div className="overview-content">
                        <p>{pkg.description || 'No description available.'}</p>
                      </div>
                    </div>
                    <div className="tab-pane fade" id="program" role="tabpanel" aria-labelledby="program-tab">
                      <div className="itinerary-content">
                        <h3>
                          Program Overview <span>({pkg.tripDuration?.days || 4} days)</span>
                        </h3>
                        <p>
                          {pkg.programDescription ||
                            'Dolores maiores dicta dolore. Natoque placeat libero sunt sagittis debitis? Egestas non non qui quos, semper aperiam lacinia eum nam! Pede beatae. Soluta, convallis irure accusamus voluptatum ornare saepe cupidatat.'}
                        </p>
                      </div>
                      <div className="itinerary-timeline-wrap">
                        {pkg.programDays && pkg.programDays.length > 0 ? (
                          <ul>
                            {pkg.programDays.map((day, index) => (
                              <li key={index}>
                                <div class="timeline-content" style={{width:'100%'}}>
                                  <div class="day-count">Day <span>{day.day}</span></div>
                                  <h4>{day.title}</h4>
                                  <p>{day.description}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted">No Programs scheduled for the day.</p>
                        )}
                      </div>
                    </div>
                    <div className="tab-pane fade" id="itinerary-overview" role="tabpanel" aria-labelledby="itinerary-overview-tab">
                      <div className="itinerary-content">
                        <h3 className="mb-3">
                          Detailed Itinerary <span className="text-muted fs-5">({pkg.tripDuration?.days || 0} days)</span>
                        </h3>
                        <p className="text-muted mb-4">
                          {pkg.itineraryDescription || 'Explore the highlights of this amazing journey.'}
                        </p>
                      </div>
                      <div className="itinerary-timeline-wrap w-100">
                        {pkg.itineraryDays && pkg.itineraryDays.length > 0 ? (
                          <div className="accordion accordion-flush" id="itineraryAccordion">
                            {pkg.itineraryDays.map((day, index) => (
                              <div className="tour-accordion-item" key={index}>
                                <div
                                  className="tour-accordion-header"
                                  id={`dayHeading${index}`}
                                  data-bs-toggle="collapse"
                                  data-bs-target={`#dayCollapse${index}`}
                                  aria-expanded={index === 0 ? 'true' : 'false'}
                                  aria-controls={`dayCollapse${index}`}
                                >
                                  <h3>
                                    <i className="fas fa-calendar-day"></i> Day {day.day || index + 1}
                                    <i className="fas fa-chevron-down toggle-icon"></i>
                                  </h3>
                                </div>
                                <div
                                  id={`dayCollapse${index}`}
                                  className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                                  aria-labelledby={`dayHeading${index}`}
                                  data-bs-parent="#itineraryAccordion"
                                >
                                  <div className="tour-accordion-body">
                                    {day.activities && day.activities.length > 0 ? (
                                      <div className="tour-timeline">
                                        {day.activities.map((activity, idx) => (
                                          <div className="tour-timeline-item" key={idx}>
                                            <div className="tour-activity-card">
                                              <h5>
                                                <i className="fas fa-map-pin"></i>
                                                {activity.title || 'Activity'}
                                              </h5>
                                              <p className="activity-subtitle">{activity.sub_title || 'No subtitle'}</p>
                                              <p className="activity-time">
                                                <i className="far fa-clock"></i>
                                                {activity.start_time || 'N/A'} - {activity.end_time || 'N/A'}
                                              </p>
                                              {activity.type && (
                                                <span className="activity-type">
                                                  <i className="fas fa-tag"></i>
                                                  {activity.type}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-muted">No activities scheduled for this day.</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted">No itinerary details available.</p>
                        )}
                      </div>
                    </div>
                    <div className="tab-pane fade" id="additional-info" role="tabpanel" aria-labelledby="additional-info-tab">
                      <div className="additional-info-content">
                        <h3 className="mb-4">Additional Information</h3>
                        <div className="accordion accordion-flush" id="additionalInfoAccordion">
                          {pkg.inclusions && pkg.inclusions.length > 0 && (
                            <div className="tour-accordion-item">
                              <div
                                className="tour-accordion-header"
                                id="inclusionsHeading"
                                data-bs-toggle="collapse"
                                data-bs-target="#inclusionsCollapse"
                                aria-expanded="true"
                                aria-controls="inclusionsCollapse"
                              >
                                <h3>
                                  <i className="fas fa-check-circle"></i> Inclusions
                                  <i className="fas fa-chevron-down toggle-icon"></i>
                                </h3>
                              </div>
                              <div
                                id="inclusionsCollapse"
                                className="accordion-collapse collapse show"
                                aria-labelledby="inclusionsHeading"
                                data-bs-parent="#additionalInfoAccordion"
                              >
                                <div className="tour-accordion-body">
                                  <ul className="info-list">
                                    {pkg.inclusions.map((item, idx) => (
                                      <li key={idx}>
                                        <i className="fas fa-check"></i>
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                          {pkg.exclusions && pkg.exclusions.length > 0 && (
                            <div className="tour-accordion-item">
                              <div
                                className="tour-accordion-header"
                                id="exclusionsHeading"
                                data-bs-toggle="collapse"
                                data-bs-target="#exclusionsCollapse"
                                aria-expanded="false"
                                aria-controls="exclusionsCollapse"
                              >
                                <h3>
                                  <i className="fas fa-times-circle"></i> Exclusions
                                  <i className="fas fa-chevron-down toggle-icon"></i>
                                </h3>
                              </div>
                              <div
                                id="exclusionsCollapse"
                                className="accordion-collapse collapse"
                                aria-labelledby="exclusionsHeading"
                                data-bs-parent="#additionalInfoAccordion"
                              >
                                <div className="tour-accordion-body">
                                  <ul className="info-list">
                                    {pkg.exclusions.map((item, idx) => (
                                      <li key={idx}>
                                        <i className="fas fa-times"></i>
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                          {pkg.highlights && pkg.highlights.length > 0 && (
                            <div className="tour-accordion-item">
                              <div
                                className="tour-accordion-header"
                                id="highlightsHeading"
                                data-bs-toggle="collapse"
                                data-bs-target="#highlightsCollapse"
                                aria-expanded="false"
                                aria-controls="highlightsCollapse"
                              >
                                <h3>
                                  <i className="fas fa-star"></i> Highlights
                                  <i className="fas fa-chevron-down toggle-icon"></i>
                                </h3>
                              </div>
                              <div
                                id="highlightsCollapse"
                                className="accordion-collapse collapse"
                                aria-labelledby="highlightsHeading"
                                data-bs-parent="#additionalInfoAccordion"
                              >
                                <div className="tour-accordion-body">
                                  <ul className="info-list">
                                    {pkg.highlights.map((highlight, idx) => (
                                      <li key={idx}>
                                        <i className="fas fa-star"></i>
                                        {highlight}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="tour-accordion-item">
                            <div
                              className="tour-accordion-header"
                              id="detailsHeading"
                              data-bs-toggle="collapse"
                              data-bs-target="#detailsCollapse"
                              aria-expanded="false"
                              aria-controls="detailsCollapse"
                            >
                              <h3>
                                <i className="fas fa-info-circle"></i> Details
                                <i className="fas fa-chevron-down toggle-icon"></i>
                              </h3>
                            </div>
                            <div
                              id="detailsCollapse"
                              className="accordion-collapse collapse"
                              aria-labelledby="detailsHeading"
                              data-bs-parent="#additionalInfoAccordion"
                            >
                              <div className="tour-accordion-body">
                                <ul className="info-list">
                                  <li>
                                    <i className="fas fa-info-circle"></i>
                                    <strong>Type:</strong> {pkg.packageType || 'N/A'}
                                  </li>
                                  <li>
                                    <i className="fas fa-info-circle"></i>
                                    <strong>Category:</strong> {pkg.category || 'N/A'}
                                  </li>
                                  <li>
                                    <i className="fas fa-info-circle"></i>
                                    <strong>Difficulty Level:</strong> {pkg.difficultyLevel || 'N/A'}
                                  </li>
                                  <li>
                                    <i className="fas fa-info-circle"></i>
                                    <strong>Group Size:</strong> {pkg.groupSize || 'N/A'}
                                  </li>
                                  <li>
                                    <i className="fas fa-info-circle"></i>
                                    <strong>Destination:</strong>{' '}
                                    {pkg.destinationAddress ? `${pkg.destinationAddress}, ${pkg.destinationCountry}` : pkg.destinationCountry || 'N/A'}
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          {pkg.multipleDepartures && pkg.multipleDepartures.length > 0 && (
                            <div className="tour-accordion-item">
                              <div
                                className="tour-accordion-header"
                                id="departuresHeading"
                                data-bs-toggle="collapse"
                                data-bs-target="#departuresCollapse"
                                aria-expanded="false"
                                aria-controls="departuresCollapse"
                              >
                                <h3>
                                  <i className="fas fa-calendar-alt"></i> Departure Dates And Locations
                                  <i className="fas fa-chevron-down toggle-icon"></i>
                                </h3>
                              </div>
                              <div
                                id="departuresCollapse"
                                className="accordion-collapse collapse"
                                aria-labelledby="departuresHeading"
                                data-bs-parent="#additionalInfoAccordion"
                              >
                                <div className="tour-accordion-body">
                                  <ul className="info-list">
                                    {pkg.multipleDepartures.map((departure, idx) => (
                                      <li key={idx}>
                                        <i className="fas fa-calendar-check"></i>
                                        {new Date(departure.dateTime).toDateString()} - {departure.location}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                          {pkg.quote && (
                            <div className="tour-accordion-item">
                              <div
                                className="tour-accordion-header"
                                id="quoteHeading"
                                data-bs-toggle="collapse"
                                data-bs-target="#quoteCollapse"
                                aria-expanded="false"
                                aria-controls="quoteCollapse"
                              >
                                <h3>
                                  <i className="fas fa-quote-left"></i> Quote
                                  <i className="fas fa-chevron-down toggle-icon"></i>
                                </h3>
                              </div>
                              <div
                                id="quoteCollapse"
                                className="accordion-collapse collapse"
                                aria-labelledby="quoteHeading"
                                data-bs-parent="#additionalInfoAccordion"
                              >
                                <div className="tour-accordion-body">
                                  <blockquote className="quote-block">
                                    <p>{pkg.quote}</p>
                                  </blockquote>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="tab-pane fade" id="review" role="tabpanel" aria-labelledby="review-tab">
                      <div className="summary-review">
                        <div className="review-score">
                          <span id="average-rating">{averageRating}</span>
                        </div>
                        <div className="review-score-content">
                          <h3>
                            {averageRating >= 4 ? 'Excellent' : averageRating >= 3 ? 'Good' : 'Average'}
                            <span id="review-count">( Based on {reviewCount} reviews )</span>
                          </h3>
                          <p>Tincidunt iaculis pede mus lobortis hendrerit eveniet impedit aenean mauris qui, pharetra rem doloremque laboris euismod deserunt non, cupiditate, vestibulum.</p>
                        </div>
                      </div>
                      <div className="comment-area">
                        <h3 className="comment-title" id="review-title">{reviewCount} Reviews</h3>
                        <div className="comment-area-inner">
                          <ol id="review-list">
                            {reviews.length > 0 ? (
                              reviews.map((review, index) => (
                                <li key={index}>
                                  <figure className="comment-thumb">
                                    <img
                                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60&q=80"
                                      alt="User Avatar"
                                    />
                                  </figure>
                                  <div className="comment-content">
                                    <div className="comment-header">
                                      <h5 className="author-name">{review.name || 'Anonymous'}</h5>
                                      <span className="post-on">{new Date(review.date).toDateString()}</span>
                                      <div className="rating-wrap">
                                        <div className="rating-start" title={`Rated ${review.rating} out of 5`}>
                                          {[...Array(5)].map((_, i) => (
                                            <i
                                              key={i}
                                              className={`fas fa-star ${i < review.rating ? 'filled' : ''}`}
                                            ></i>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                    <p>{review.comment || 'No comment provided.'}</p>
                                  </div>
                                </li>
                              ))
                            ) : (
                              <li>
                                <div className="comment-content">
                                  <div className="comment-header">
                                    <h5 className="author-name">No Reviews Yet</h5>
                                    <span className="post-on">N/A</span>
                                  </div>
                                  <p>Be the first to leave a review for this package!</p>
                                </div>
                              </li>
                            )}
                          </ol>
                        </div>
                        <div className="comment-form-wrap">
                          <h3 className="comment-title">Leave a Review</h3>
                          {message.text && (
                            <div className={`review-message mb-3 ${message.type === 'success' ? 'success' : 'error'}`} role="alert">
                              {message.text}
                            </div>
                          )}
                          <form onSubmit={handleSubmitReview} className="comment-form" id="review-form">
                            <input type="hidden" name="packageId" value={pkg._id} />
                            <div className="full-width rate-wrap">
                              <label>Your rating</label>
                              <div className="package-rate" aria-label="Select a rating from 1 to 5 stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <div key={star}>
                                    <input
                                      type="radio"
                                      id={`star${star}`}
                                      name="rating"
                                      value={star}
                                      onChange={() => handleRatingChange(star)}
                                    />
                                    <label
                                      htmlFor={`star${star}`}
                                      className={`fas fa-star ${formData.rating >= star ? 'filled' : ''}`}
                                    ></label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <p>
                              <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Name"
                                required
                                readOnly={!!user}
                              />
                            </p>
                            <p>
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Email"
                                required
                                readOnly={!!user}
                              />
                            </p>
                            <p>
                              <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                placeholder="Subject"
                                required
                              />
                            </p>
                            <p>
                              <textarea
                                rows="6"
                                name="comment"
                                value={formData.comment}
                                onChange={handleInputChange}
                                placeholder="Your review"
                                required
                              ></textarea>
                            </p>
                            <p>
                              <input type="submit" value="Submit" />
                            </p>
                          </form>
                        </div>
                      </div>
                    </div>
                    <div className="tab-pane fade" id="map" role="tabpanel" aria-labelledby="map-tab">
                      <div className="map-area">
                        <iframe
                          src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2000!2d${pkg.longitude || 0}!3d${pkg.latitude || 0}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${pkg.latitude || 0}%2C${pkg.longitude || 0}!5e0!3m2!1sen!2snp!4v1579777829477!5m2!1sen!2snp`}
                          width="100%"
                          height="450"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                        ></iframe>
                      </div>
                    </div>
                  </div>
                </div>
                {pkg.gallery && pkg.gallery.length > 0 && (
                  <div className="single-tour-gallery">
                    <h3>GALLERY / PHOTOS</h3>
                    <Slider className="single-tour-slider" {...sliderSettings}>
                      {pkg.gallery.map((image, index) => (
                        <div className="single-tour-item" key={index}>
                          <figure className="feature-image">
                            <img
                              src={image ? `${import.meta.env.VITE_API_URL}/Uploads/gallery/${image}` : '/assets/images/default.jpg'}
                              alt={pkg.title || 'Gallery Image'}
                            />
                          </figure>
                        </div>
                      ))}
                    </Slider>
                  </div>
                )}
              </div>
            </div>
            <div className="col-lg-4">
              <aside className="sidebar">
                <div className="package-price">
                  <h5 className="price">
                    <span>${pkg.salePrice || pkg.regularPrice || 'N/A'}</span> / per person
                  </h5>
                  {pkg.discount && pkg.salePrice < pkg.regularPrice && (
                    <p className="text-muted">
                      Regular Price: <span className="text-decoration-line-through">${pkg.regularPrice}</span> ({pkg.discount}% OFF)
                    </p>
                  )}
                  <div className="start-wrap">
                    <div className="rating-start rating-data" title={`Rated ${averageRating} out of 5`}>
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fas fa-star ${i < Math.round(averageRating) ? 'filled' : ''}`}
                        ></i>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="widget-bg quote-wrap">
                  <h4 className="bg-title">Plan Your Adventure</h4>
                  <blockquote>
                    "Travel is the only thing you buy that makes you richer."
                  </blockquote>
                  <cite>– Anonymous</cite>
                  <div className="button-group">
                    <Link to={`/bookPackage/${pkg._id}`} className="button-primary book-now">
                      Book Now
                    </Link>
                    <button type="button" onClick={handleAddToCart} className="button-primary add-to-cart">
                      Add to Cart
                    </button>
                  </div>
                </div>
                <div className="widget-bg information-content text-center">
                  <h5>TRAVEL TIPS</h5>
                  <h3>NEED TRAVEL RELATED TIPS & INFORMATION</h3>
                  <p>Mollit voluptatem perspiciatis convallis elementum corporis quo veritatis aliquid blandit.</p>
                </div>
                <div className="travel-package-content text-center" style={{ backgroundImage: 'url(/assets/images/img11.jpg)' }}>
                  <h5>MORE PACKAGES</h5>
                  <h3>OTHER TRAVEL PACKAGES</h3>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                  <ul>
                    <li>
                      <Link to="/tour-packages">
                        <i className="far fa-arrow-alt-circle-right"></i>Vacation packages
                      </Link>
                    </li>
                    <li>
                      <Link to="/tour-packages">
                        <i className="far fa-arrow-alt-circle-right"></i>Honeymoon packages
                      </Link>
                    </li>
                    <li>
                      <Link to="/tour-packages">
                        <i className="far fa-arrow-alt-circle-right"></i>New year packages
                      </Link>
                    </li>
                    <li>
                      <Link to="/tour-packages">
                        <i className="far fa-arrow-alt-circle-right"></i>Weekend packages
                      </Link>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      {!user && (
        <section className="subscribe-section" style={{ backgroundImage: 'url(/assets/images/img16.jpg)' }}>
          <div className="container">
            <div className="row">
              <div className="col-lg-7">
                <div className="section-heading section-heading-white">
                  <h5 className="dash-style">HOLIDAY PACKAGE OFFER</h5>
                  <h2>HOLIDAY SPECIAL {pkg && pkg.discount ? pkg.discount + '% OFF' : '25% OFF'}!</h2>
                  <h4>Sign up now to receive hot special offers and information about the best tour packages, updates, and discounts!</h4>
                  <div className="newsletter-form">
                    <form action="/subscribe" method="POST">
                      <input type="email" name="email" placeholder="Your Email Address" required />
                      <input type="submit" name="signup" value="SIGN UP NOW!" />
                    </form>
                  </div>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      )}
    </div>
  );
}

export default TourDetail;