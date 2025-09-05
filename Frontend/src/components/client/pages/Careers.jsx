import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../layouts/Loader';

function Careers() {
  const { user, userType } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [careers, setCareers] = useState([]);
  const [formData, setFormData] = useState({
    careerId: '',
    cv: null,
  });
  const [fileName, setFileName] = useState('Choose file');

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        if (!user || userType !== 'User') {
          toast.error('Unauthorized access');
          navigate('/login');
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/client/careers`, {
          withCredentials: true,
        });

        if (response.data.success) {
          setCareers(response.data.careers);
        } else {
          toast.error(response.data.message || 'Failed to load careers');
          navigate('/login');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Server error');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchCareers();
  }, [navigate, user, userType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, cv: file }));
    setFileName(file ? file.name : 'Choose file');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.careerId) {
        toast.error('Please select a career');
        return;
      }
      if (!formData.cv) {
        toast.error('Please upload a CV');
        return;
      }

      const form = new FormData();
      form.append('careerId', formData.careerId);
      form.append('cv', formData.cv);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/client/careers/apply`,
        form,
        { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({ careerId: '', cv: null });
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

  if (!user) {
    return null; // Redirect handled by useEffect
  }

  return (
    <>
      <section className="inner-banner-wrap">
        <div className="inner-baner-container" style={{ backgroundImage: 'url(/assets/images/inner-banner.jpg)' }}>
          <div className="container">
            <div className="inner-banner-content">
              <h1 className="inner-title">Career</h1>
            </div>
          </div>
        </div>
        <div className="inner-shape"></div>
      </section>
      <div className="carrer-page-section">
        <div className="container">
          <div className="vacancy-section">
            <div className="section-heading text-center">
              <div className="row">
                <div className="col-lg-8 offset-lg-2">
                  <h5 className="dash-style">VACANCY / CAREERS</h5>
                  <h2>LET'S JOIN WITH US!</h2>
                  <p>
                    Mollit voluptatem perspiciatis convallis elementum corporis quo veritatis aliquid
                    blandit, blandit torquent, odit placeat. Adipiscing repudiandae eius cursus? Nostrum
                    magnis maxime curae placeat.
                  </p>
                </div>
              </div>
            </div>
            <div className="vacancy-container">
              <div className="row">
                <div className="col-lg-7">
                  <div className="vacancy-content-wrap">
                    <div className="row">
                      {careers.length > 0 ? (
                        careers.map((career) => (
                          <div className="col-md-6" key={career._id}>
                            <div className="vacancy-content">
                              <h5>{career.employmentType}</h5>
                              <h3>{career.title}</h3>
                              <p>{career.shortDescription}</p>
                              <Link to={`/careers/${career._id}`} className="button-primary">
                                APPLY NOW
                              </Link>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-12">
                          <p>No careers available at the moment.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-lg-5">
                  <div className="vacancy-form">
                    <h3>JOIN OUR TEAM</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus</p>
                    <form onSubmit={handleSubmit} encType="multipart/form-data" className="form-improved">
                      <div className="form-group">
                        <label htmlFor="careerId" className="form-label" style={{color: '#fff'}}>
                          Select Position
                        </label>
                        <select
                          name="careerId"
                          id="careerId"
                          className="form-control"
                          value={formData.careerId}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select a Career</option>
                          {careers.map((career) => (
                            <option key={career._id} value={career._id}>
                              {career.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="cv" className="form-label" style={{color: '#fff'}}>
                          Upload CV (PDF, DOC, DOCX)
                        </label>
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
                      </div>
                      <div className="form-group mt-5">
                        <input type="submit" value="SEND APPLICATION" className="button-primary" />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="about-service-wrap">
            <div className="section-heading">
              <div className="row no-gutters align-items-end">
                <div className="col-lg-6">
                  <h5 className="dash-style">OUR BENEFITS</h5>
                  <h2>OUR TRAVEL AGENCY HAS BEEN BEST AMONG OTHERS SINCE 1982</h2>
                </div>
                <div className="col-lg-6">
                  <div className="section-disc">
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec
                      ullamcorper mattis, pulvinar dapibus leo. Placeat nostrud natus tempora justo.
                      Laboriosam, eget mus nostrud natus tempora.
                    </p>
                    <p>
                      Lorem ipsum dolor sit amet, consec tetur adipiscing eliting dolor sit amet. Placeat
                      nostrud natus tempora justo nostrud natus tempora.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="about-service-container">
              <div className="row">
                {[
                  { icon: 'icon19.png', title: 'Award winning', desc: 'Lorem ipsum dolor sit amet, consec teturing.' },
                  { icon: 'icon20.png', title: 'Well allowance', desc: 'Lorem ipsum dolor sit amet, consec teturing.' },
                  { icon: 'icon21.png', title: 'Full Insurance', desc: 'Lorem ipsum dolor sit amet, consec teturing.' },
                ].map((service, index) => (
                  <div className="col-lg-4" key={index}>
                    <div className="about-service">
                      <div className="about-service-icon">
                        <img src={`/assets/images/${service.icon}`} alt="" />
                      </div>
                      <div className="about-service-content">
                        <h4>{service.title}</h4>
                        <p>{service.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
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

export default Careers;