import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../layouts/Loader';

function Faq() {
  const { user,userType } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    message: '',
  });

  useEffect(() => {
    const fetchFaqData = async () => {
      try {
        if (!user || userType !== 'User') {
          toast.error('Unauthorized access');
          navigate('/login');
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/client/faq`, {
          withCredentials: true,
        });

        if (response.data.success) {
          setAnsweredQuestions(response.data.answeredQuestions);
        } else {
          toast.error(response.data.message || 'Failed to load FAQ page');
          navigate('/');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Server error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchFaqData();
  }, [navigate, user, userType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.email || !formData.message || !formData.number) {
        toast.error('Please fill in all required fields');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please provide a valid email address');
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/client/faq/submit`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({ name: '', email: '', number: '', message: '' });
      } else {
        toast.error(response.data.message || 'Failed to submit question');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Server error');
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return null; // Redirect handled by useEffect
  }

  const staticFaqs = [
    {
      id: 'One',
      question: 'HOW WE BECAME BEST AMONG OTHERS?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
    },
    {
      id: 'Two',
      question: 'WHAT WE OFFER TO YOU?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
    },
    {
      id: 'Three',
      question: 'HOW WE PROVIDE SERVICES FOR YOU?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
    },
    {
      id: 'Four',
      question: 'ARE WE AFFORDABLE TO HIRE?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
    },
  ];

  const staticFaqs2 = [
    {
      id: 'One',
      question: 'HOW DO YOU MANAGE TO TRAVEL THE WORLD?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
    },
    {
      id: 'Two',
      question: 'HOW DID YOU MANAGE YOUR CLIENTS?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
    },
    {
      id: 'Three',
      question: 'HOW TO TRAVEL WITH YOUR TIPS?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
    },
    {
      id: 'Four',
      question: 'WHAT LOW BUDGET DESTINATIONS DO YOU RECOMMEND?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullacmcorper mattis, pulvinar dapibus leo.',
    },
  ];

  return (
    <>
      <section className="inner-banner-wrap">
        <div className="inner-baner-container" style={{ backgroundImage: 'url(/assets/images/inner-banner.jpg)' }}>
          <div className="container">
            <div className="inner-banner-content">
              <h1 className="inner-title">Faq</h1>
            </div>
          </div>
        </div>
        <div className="inner-shape"></div>
      </section>
      <div className="faq-page-section">
        <div className="container">
          <div className="faq-page-container">
            <div className="row">
              <div className="col-lg-6">
                <div className="faq-content-wrap">
                  <div className="section-heading">
                    <h5 className="dash-style">ANY QUESTIONS</h5>
                    <h2>FREQUENTLY ASKED QUESTIONS</h2>
                    <p>
                      Aperiam sociosqu urna praesent, tristique, corrupti condimentum asperiores platea ipsum ad
                      arcu. Nostrud. Esse? Aut nostrum, ornare quas provident laoreet nesciunt odio
                      voluptates etiam, omnis.
                    </p>
                  </div>
                  <div className="accordion" id="accordionOne">
                    {staticFaqs.map((faq, index) => (
                      <div className="card" key={faq.id}>
                        <div className="card-header" id={`heading${faq.id}`}>
                          <h4 className="mb-0">
                            <button
                              className={`btn btn-link ${index === 0 ? '' : 'collapsed'}`}
                              type="button"
                              data-toggle="collapse"
                              data-target={`#collapse${faq.id}`}
                              aria-expanded={index === 0 ? 'true' : 'false'}
                              aria-controls={`collapse${faq.id}`}
                            >
                              {faq.question}
                            </button>
                          </h4>
                        </div>
                        <div
                          id={`collapse${faq.id}`}
                          className={`collapse ${index === 0 ? 'show' : ''}`}
                          aria-labelledby={`heading${faq.id}`}
                          data-parent="#accordionOne"
                        >
                          <div className="card-body">{faq.answer}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="qsn-form-container">
                  <h3>STILL HAVE A QUESTION?</h3>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper</p>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <input
                        type="text"
                        name="name"
                        placeholder="Your Name*"
                        className="form-control"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="email"
                        name="email"
                        placeholder="Your Email*"
                        className="form-control"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="number"
                        name="number"
                        placeholder="Your Number*"
                        className="form-control"
                        value={formData.number}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <textarea
                        name="message"
                        rows="8"
                        placeholder="Enter your message*"
                        className="form-control"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <input type="submit" value="SUBMIT QUESTIONS" className="btn btn-primary" />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="faq-page-container">
            <div className="row">
              <div className="col-lg-5">
                <div className="faq-testimonial">
                  <figure className="faq-image">
                    <img src="/assets/images/img37.jpg" alt="" />
                  </figure>
                  <div className="testimonial-content">
                    <span className="quote-icon">
                      <i className="fas fa-quote-left"></i>
                    </span>
                    <p>
                      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec
                      ullamcorper mattis, pulvinar dapibus leo."
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-lg-7">
                <div className="faq-content-wrap pl-20">
                  <div className="section-heading">
                    <h5 className="dash-style">QUESTIONS/ANSWERS</h5>
                    <h2>BENEFITS & WHAT WE DO?</h2>
                  </div>
                  <div className="accordion" id="accordionTwo">
                    {staticFaqs2.map((faq, index) => (
                      <div className="card" key={faq.id}>
                        <div className="card-header" id={`heading${faq.id}`}>
                          <h4 className="mb-0">
                            <button
                              className={`btn btn-link ${index === 0 ? '' : 'collapsed'}`}
                              type="button"
                              data-toggle="collapse"
                              data-target={`#collapse${faq.id}`}
                              aria-expanded={index === 0 ? 'true' : 'false'}
                              aria-controls={`collapse${faq.id}`}
                            >
                              {faq.question}
                            </button>
                          </h4>
                        </div>
                        <div
                          id={`collapse${faq.id}`}
                          className={`collapse ${index === 0 ? 'show' : ''}`}
                          aria-labelledby={`heading${faq.id}`}
                          data-parent="#accordionTwo"
                        >
                          <div className="card-body">{faq.answer}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {answeredQuestions.length > 0 && (
            <div className="faq-page-container">
              <div className="row">
                <div className="col-lg-7">
                  <div className="faq-content-wrap pl-20">
                    <div className="section-heading">
                      <h5 className="dash-style">QUESTIONS/ANSWERS</h5>
                      <h2>USER QUESTIONS & OUR ANSWERS</h2>
                    </div>
                    <div className="accordion" id="accordionAnswered">
                      {answeredQuestions.map((question, index) => (
                        <div className="card" key={question._id}>
                          <div className="card-header" id={`answeredHeading${index}`}>
                            <h4 className="mb-0">
                              <button
                                className="btn btn-link collapsed"
                                type="button"
                                data-toggle="collapse"
                                data-target={`#answeredCollapse${index}`}
                                aria-expanded="false"
                                aria-controls={`answeredCollapse${index}`}
                              >
                                {question.message}
                              </button>
                            </h4>
                          </div>
                          <div
                            id={`answeredCollapse${index}`}
                            className="collapse"
                            aria-labelledby={`answeredHeading${index}`}
                            data-parent="#accordionAnswered"
                          >
                            <div className="card-body">{question.answer}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-lg-5">
                  <div className="faq-testimonial">
                    <figure className="faq-image">
                      <img src="/assets/images/img37.jpg" alt="" />
                    </figure>
                    <div className="testimonial-content">
                      <span className="quote-icon">
                        <i className="fas fa-quote-left"></i>
                      </span>
                      <p>
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec
                        ullamcorper mattis, pulvinar dapibus leo."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Faq;