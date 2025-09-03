import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../layouts/Loader';

function Testimonials() {
  const { user, userType } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        if (!user || userType !== 'User') {
          toast.error('Unauthorized access');
          navigate('/');
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/client/testimonials`, {
          withCredentials: true,
        });

        if (response.data.success) {
          setTestimonials(response.data.testimonials);
        } else {
          toast.error(response.data.message || 'Failed to load testimonials');
          navigate('/');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Server error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [navigate, user, userType]);

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return null; // Redirect handled by useEffect
  }

  return (
    <>
      <section className="inner-banner-wrap">
        <div className="inner-baner-container" style={{ backgroundImage: 'url(/assets/images/inner-banner.jpg)' }}>
          <div className="container">
            <div className="inner-banner-content">
              <h1 className="inner-title">Testimonial</h1>
            </div>
          </div>
        </div>
        <div className="inner-shape"></div>
      </section>
      <div className="testimonial-page-section">
        <div className="container">
          {testimonials && testimonials.length > 0 ? (
            <div className="row">
              {testimonials.map((testimonial) => (
                <div className="col-lg-4 col-md-6" key={testimonial._id}>
                  <div className="testimonial-item text-center">
                    <figure className="testimonial-img">
                      <img src={testimonial.image} alt={testimonial.name} />
                    </figure>
                    <div className="testimonial-content">
                      <p>{testimonial.content}</p>
                      <div className="start-wrap">
                        <div
                          className="rating-start"
                          title={`Rated ${(testimonial.rating / 20).toFixed(1)} out of 5`}
                        >
                          <span style={{ width: `${testimonial.rating}%` }}></span>
                        </div>
                      </div>
                      <h3>{testimonial.name}</h3>
                      <span>{testimonial.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center">No testimonials available.</p>
          )}
        </div>
      </div>
      
    </>
  );
}

export default Testimonials;