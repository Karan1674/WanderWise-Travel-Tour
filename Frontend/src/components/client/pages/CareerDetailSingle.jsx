import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../layouts/Loader';

function CareerDetailSingle() {
  const { user, userType } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [career, setCareer] = useState(null);
  const [application, setApplication] = useState(null);
  const [formData, setFormData] = useState({ cv: null });
  const [fileName, setFileName] = useState('Choose file');

  useEffect(() => {
    const fetchCareer = async () => {
      try {
        if (!user || userType !== 'User') {
          toast.error('Unauthorized access');
          navigate('/login');
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/client/careers/${id}`, {
          withCredentials: true,
        });

        if (response.data.success) {
          setCareer(response.data.career);
          setApplication(response.data.application);
        } else {
          toast.error(response.data.message || 'Failed to load career');
          navigate('/careers');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Server error');
        navigate('/careers');
      } finally {
        setLoading(false);
      }
    };

    fetchCareer();
  }, [navigate, user, userType, id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ cv: file });
    setFileName(file ? file.name : 'Choose file');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.cv) {
        toast.error('Please upload a CV');
        return;
      }

      const form = new FormData();
      form.append('cv', formData.cv);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/client/careers/${id}/apply`,
        form,
        { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setApplication(response.data.application);
        setFormData({ cv: null });
        setFileName('Choose file');
      } else {
        toast.error(response.data.message || 'Failed to submit application');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Server error');
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!career || !user) {
    return null; // Redirect handled by useEffect
  }

  return (
    <>
      <section className="inner-banner-wrap">
        <div className="inner-baner-container" style={{ backgroundImage: 'url(/assets/images/inner-banner.jpg)' }}>
          <div className="container">
            <div className="inner-banner-content">
              <h1 className="inner-title">Career Detail</h1>
            </div>
          </div>
        </div>
        <div className="inner-shape"></div>
      </section>
      <div className="career-detail-section">
        <div className="career-detail-inner">
          <div className="container">
            <div className="row">
              <div className="col-lg-8">
                <div className="job-description">
                  <ul>
                    <li>
                      <span>Post :</span>
                      <h4>{career.title}</h4>
                    </li>
                    <li>
                      <span>Time :</span>
                      <h4>{career.employmentType}</h4>
                    </li>
                    <li>
                      <span>Salary :</span>
                      <h4>{career.salary}</h4>
                    </li>
                    <li>
                      <span>No. of Vacancy :</span>
                      <h4>{career.vacancies}</h4>
                    </li>
                  </ul>
                  <figure className="job-imgage">
                    <img src={`${import.meta.env.VITE_API_URL}/Uploads/career/${career.image}`} alt={career.title} />
                  </figure>
                </div>
                <div className="tab-container">
                  <ul className="nav nav-tabs" id="myTab" role="tablist" style={{listStyle:'none'}}>
                    <li className="nav-item">
                      <a
                        className="nav-link active"
                        id="overview-tab"
                        data-toggle="tab"
                        href="#overview"
                        role="tab"
                        aria-controls="overview"
                        aria-selected="true"
                      >
                        Job Description
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className="nav-link"
                        id="experience-tab"
                        data-toggle="tab"
                        href="#experience"
                        role="tab"
                        aria-controls="experience"
                        aria-selected="false"
                      >
                        Experience & Overview
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className="nav-link"
                        id="requirement-tab"
                        data-toggle="tab"
                        href="#requirement"
                        role="tab"
                        aria-controls="requirement"
                        aria-selected="false"
                      >
                        Requirement
                      </a>
                    </li>
                  </ul>
                  <div className="tab-content" id="myTabContent">
                    <div className="tab-pane fade show active" id="overview" role="tabpanel" aria-labelledby="overview-tab">
                      <div className="overview-content" dangerouslySetInnerHTML={{ __html: career.description }} />
                    </div>
                    <div className="tab-pane" id="experience" role="tabpanel" aria-labelledby="experience-tab">
                      <div className="experience-content">
                        <h5>#OVERVIEW</h5>
                        <div dangerouslySetInnerHTML={{ __html: career.overview }} />
                        <h5 style={{ marginTop: '50px' }}>#EXPERIENCE</h5>
                        <div dangerouslySetInnerHTML={{ __html: career.experience }} />
                      </div>
                    </div>
                    <div className="tab-pane" id="requirement" role="tabpanel" aria-labelledby="requirement-tab">
                      <div className="requirement-content" dangerouslySetInnerHTML={{ __html: career.requirements }} />
                    </div>
                  </div>
                </div>
                {application && (
                  <div className="application-status mt-4 p-3 bg-light border">
                    <p className="mb-0" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '5px' }}>
                      <strong>Your Application Status:</strong>
                      <span
                        className={`text-white p-2 px-4 badge ${
                          application.status === 'pending'
                            ? 'bg-warning'
                            : application.status === 'accepted'
                            ? 'bg-success'
                            : 'bg-danger'
                        }`}
                      >
                        {application.status}
                      </span>
                    </p>
                  </div>
                )}
              </div>
              <div className="col-lg-4 order-lg-first">
                <div className="sidebar">
                  <div className="widget-bg sidebar-list">
                    <h4 className="bg-title">How To Apply?</h4>
                    <ul>
                      <li>
                        <i className="fas fa-minus"></i>Nunc expedita montes minima.
                      </li>
                      <li>
                        <i className="fas fa-minus"></i>Animi atque ornare iaculis.
                      </li>
                      <li>
                        <i className="fas fa-minus"></i>Sociosqu scelerisque adipisci.
                      </li>
                      <li>
                        <i className="fas fa-minus"></i>Purus eveniet incidi dunt.
                      </li>
                      <li>
                        <i className="fas fa-minus"></i>Animi atque ornare iaculis.
                      </li>
                    </ul>
                  </div>
                  <div className="widget-bg faq-widget">
                    <h4 className="bg-title">Frequently Asked Questions</h4>
                    <div className="accordion" id="accordionOne">
                      {[
                        {
                          id: 'One',
                          question: 'When the Announcements?',
                          answer:
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
                        },
                        {
                          id: 'Two',
                          question: 'Can I Apply After Rejection?',
                          answer:
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
                        },
                        {
                          id: 'Three',
                          question: 'Where to Interview?',
                          answer:
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
                        },
                      ].map((faq, index) => (
                        <div className="card" key={index}>
                          <div className="card-header" id={`heading${faq.id}`}>
                            <button
                              className="btn btn-link collapsed"
                              type="button"
                              data-toggle="collapse"
                              data-target={`#collapse${faq.id}`}
                              aria-expanded={index === 0 ? 'true' : 'false'}
                              aria-controls={`collapse${faq.id}`}
                            >
                              {faq.question}
                            </button>
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
                  <div className="widget-bg upload-widget text-center">
                    <div className="widget-icon">
                      <i className="fas fa-file-invoice"></i>
                    </div>
                    <h3>Send us your C.V.</h3>
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                      <div className="file-upload-wrapper">
                        <input
                          type="file"
                          name="cv"
                          id="cv"
                          accept=".pdf,.doc,.docx,image/*"
                          onChange={handleFileChange}
                          required
                        />
                        <span className="file-upload-text">{fileName}</span>
                      </div>
                      <p>
                        <input type="submit" value="SUBMIT APPLICATION" className="button-primary" />
                      </p>
                    </form>
                    <span className="or-style">OR</span>
                    <p>
                      Send your CV to <a href="mailto:domain123@gmail.com">domain123@gmail.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="secondary-callback secondary-overlay" style={{ backgroundImage: 'url(/assets/images/img16.jpg)' }}>
          <div className="container">
            <div className="section-heading">
              <div className="row">
                <div className="col-lg-7">
                  <div className="heading-inner">
                    <h5 className="dash-style">INVOLVE TODAY</h5>
                    <h2>TRUSTED BY MORE THAN 65,000 PEOPLE</h2>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec
                      ullamcorper mattis, pulvinar dapibus leo. Eaque adipiscing, luctus eleifend
                      temporibus occaecat luctus eleifend tempo ribus.
                    </p>
                    <a href="/careers" className="button-primary">
                      JOINS US NOW
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
   
  
  
   .file-upload-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    border: 1px solid #ced4da;
    border-radius: 4px;
    padding: 0.75rem;
    background: #fff;
}

.file-upload-wrapper input[type="file"] {
    opacity: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    cursor: pointer;
}

.file-upload-text {
    color: #666;
    font-size: 1rem;
}
      `}</style>
    </>
  );
}

export default CareerDetailSingle;