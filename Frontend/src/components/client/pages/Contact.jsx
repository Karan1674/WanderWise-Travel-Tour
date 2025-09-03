import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

function Contact() {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    message: '',
  });


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.email || !formData.message) {
        toast.error('Name, email, and message are required');
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/client/contact`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setFormData((prev) => ({ ...prev, number: '', message: '' }));
      } else {
        toast.error(response.data.message || 'Failed to submit enquiry');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Server error');
    }
  };


  return (
    <>
      <section className="inner-banner-wrap">
        <div className="inner-baner-container" style={{ backgroundImage: 'url(/assets/images/inner-banner.jpg)' }}>
          <div className="container">
            <div className="inner-banner-content">
              <h1 className="inner-title">Contact Us</h1>
            </div>
          </div>
        </div>
        <div className="inner-shape"></div>
      </section>
      <div className="contact-page-section">
        <div className="contact-form-inner">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <div className="contact-from-wrap">
                  <div className="section-heading">
                    <h5 className="dash-style">GET IN TOUCH</h5>
                    <h2>CONTACT US TO GET MORE INFO</h2>
                    <p>
                      Aperiam sociosqu urna praesent, tristique, corrupti condimentum asperiores platea ipsum ad
                      arcu. Nostrud. Esse? Aut nostrum, ornare quas provident laoreet nesciunt odio
                      voluptates etiam, omnis.
                    </p>
                  </div>
                  <form className="contact-from" id="contact-form" onSubmit={handleSubmit}>
                    <p>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        placeholder="Your Name*"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </p>
                    <p>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Your Email*"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </p>
                    <p>
                      <input
                        type="text"
                        name="number"
                        id="number"
                        placeholder="Your Phone Number"
                        value={formData.number}
                        onChange={handleInputChange}
                      />
                    </p>
                    <p>
                      <textarea
                        rows="8"
                        name="message"
                        id="message"
                        placeholder="Your Message*"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </p>
                    <p>
                      <input type="submit" value="SUBMIT MESSAGE" />
                    </p>
                  </form>
                </div>
              </div>
              <div className="col-md-6">
                <div className="contact-detail-wrap">
                  <h3>Need help ?? Feel free to contact us !</h3>
                  <p>
                    Penatibus numquam? Non? Aliqua tempore est deserunt sequi itaque, nascetur,
                    consequuntur conubianigp, explicabo? Primis convallis ullam. Egestas deserunt eius
                    molestias app incididunt.
                  </p>
                  <p>
                    Nostra doloribus blandit et semper ultrices, quibusdam dignissimos! Netus recusandae,
                    rerum cupidatat. Perferendis aptent wisi.
                  </p>
                  <div className="details-list">
                    <ul>
                      <li>
                        <span className="icon">
                          <i className="fas fa-map-signs"></i>
                        </span>
                        <div className="details-content">
                          <h4>Location Address</h4>
                          <span>411 D Avenue, San Francisco, CS 91950</span>
                        </div>
                      </li>
                      <li>
                        <span className="icon">
                          <i className="fas fa-envelope-open-text"></i>
                        </span>
                        <div className="details-content">
                          <h4>Email Address</h4>
                          <span>domain@company.com</span>
                        </div>
                      </li>
                      <li>
                        <span className="icon">
                          <i className="fas fa-phone-volume"></i>
                        </span>
                        <div className="details-content">
                          <h4>Phone Number</h4>
                          <span>Telephone: 619-270-8578 / Mobile: +(911) 1987 123 88</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="contct-social social-links">
                    <h3>Follow us on social media..</h3>
                    <ul>
                      <li>
                        <a href="#">
                          <i className="fab fa-facebook-f" aria-hidden="true"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fab fa-twitter" aria-hidden="true"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fab fa-instagram" aria-hidden="true"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fab fa-linkedin" aria-hidden="true"></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="map-section">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d317838.95217734354!2d-0.27362819527326965!3d51.51107287614788!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604c7c7eb9be3%3A0x3918653583725b56!2sRiverside%20Building%2C%20County%20Hall%2C%20Westminster%20Bridge%20Rd%2C%20London%20SE1%207JA%2C%20UK!5e0!3m2!1sen!2snp!4v1632135241093!5m2!1sen!2snp"
            height="400"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </>
  );
}

export default Contact;