import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function AgentAdd() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      countryCode: '',
      phone: '',
      city: '',
      country: '',
      password: '',
      confirmPassword: '',
      email: '',
      confirmEmail: '',
    });
    const [loading, setLoading] = useState(false);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (formData.email !== formData.confirmEmail) {
        toast.error('Emails do not match');
        return;
      }
      setLoading(true);
  

      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/add-agent`, formData, {
          withCredentials: true,
        });

        const result = response.data;
        if (result.success) {
          toast.success(result.message);
          navigate(result.redirect || '/db-admin-created-agents');
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error('Error adding agent:', error);
        toast.error(error.response?.data?.message || 'Failed to add agent');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="db-info-wrap">
        <div className="row">
          <div className="col-lg-12">
            <div className="dashboard-box">
              <h4>Add New Agent</h4>
              <p>Veniam. Aenean beatae nonummy tenetur beatae? Molestias similique! Semper? Laudantium.</p>
              <form className="form-horizontal" onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label htmlFor="firstName">First name</label>
                      <input
                        name="firstName"
                        id="firstName"
                        className="form-control"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label htmlFor="lastName">Last name</label>
                      <input
                        name="lastName"
                        id="lastName"
                        className="form-control"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label htmlFor="countryCode">Country Code</label>
                      <input
                        name="countryCode"
                        id="countryCode"
                        className="form-control"
                        type="text"
                        value={formData.countryCode}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label htmlFor="phone">Phone</label>
                      <input
                        name="phone"
                        id="phone"
                        className="form-control"
                        type="text"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input
                        name="city"
                        id="city"
                        className="form-control"
                        type="text"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label htmlFor="country">Country</label>
                      <input
                        name="country"
                        id="country"
                        className="form-control"
                        type="text"
                        value={formData.country}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <input
                        name="password"
                        id="password"
                        className="form-control"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirm Password</label>
                      <input
                        name="confirmPassword"
                        id="confirmPassword"
                        className="form-control"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        name="email"
                        id="email"
                        className="form-control"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label htmlFor="confirmEmail">Confirm Email</label>
                      <input
                        name="confirmEmail"
                        id="confirmEmail"
                        className="form-control"
                        type="email"
                        value={formData.confirmEmail}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <br />
                <input type="submit" value="Submit" disabled={loading} />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

export default AgentAdd;
