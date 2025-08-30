import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function AgentEdit() {
  const { userType } = useSelector((state) => state.auth);
  const { allAgents } = useSelector((state) => state.agents);
  const navigate = useNavigate();
  const location = useLocation();
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    day: '',
    month: '',
    year: '',
    countryCode: '',
    phone: '',
    country: '',
    state: '',
    city: '',
    address: '',
    description: '',
    isActive: 'true',
    profilePic: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const editAgentId = queryParams.get('editAgentId');
  

  useEffect(() => {
    const fetchAgent = async () => {
      if (!editAgentId) {
        toast.error('No agent ID provided');
        navigate('/db-admin-created-agents');
        return;
      }

      if (userType !== 'admin') {
        navigate('/');
        return;
      }

      console.log('allAgents:', allAgents); // Debug
      const agent = allAgents.find((a) => a._id === editAgentId);
      if (agent) {
        console.log('Agent found in allAgents:', agent); // Debug
        setAgentData(agent);
        setFormData({
          firstName: agent.firstName || '',
          lastName: agent.lastName || '',
          email: agent.email || '',
          day: agent.dateOfBirth ? new Date(agent.dateOfBirth).getDate().toString() : '',
          month: agent.dateOfBirth ? new Date(agent.dateOfBirth).toLocaleString('en-US', { month: 'long' }) : '',
          year: agent.dateOfBirth ? new Date(agent.dateOfBirth).getFullYear().toString() : '',
          countryCode: agent.countryCode || '',
          phone: agent.phone || '',
          country: agent.country || '',
          state: agent.state || '',
          city: agent.city || '',
          address: agent.address || '',
          description: agent.description || '',
          isActive: agent.isActive ? 'true' : 'false',
          profilePic: null,
        });
        setLoading(false);
      } 
   
    };

    fetchAgent();
  }, [editAgentId, userType, navigate, allAgents]);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'profilePic' && formData[key]) {
        formDataToSend.append('profilePic', formData[key]);
      } else if (formData[key] !== null && formData[key] !== '') {
        if (key === 'isActive') {
          formDataToSend.append(key, formData[key] === 'true');
        } else if (key === 'dateOfBirth' && formData.day && formData.month && formData.year) {
          const monthIndex = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ].indexOf(formData.month);
          if (monthIndex !== -1) {
            const date = new Date(formData.year, monthIndex, formData.day);
            formDataToSend.append('dateOfBirth', date.toISOString());
          }
        } else if (!['day', 'month', 'year'].includes(key)) {
          formDataToSend.append(key, formData[key]);
        }
      }
    });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/update-agent/${editAgentId}`,
        formDataToSend,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      const data = response.data;
      if (data.success) {
        toast.success(data.message || 'Agent updated successfully');
        navigate(-1);
      } else {
        toast.error(data.message || 'Failed to update agent');
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error(error.response?.data?.message || 'Failed to update agent');
    } finally {
      setSubmitting(false);
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = Array.from({ length: 2025 - 1900 + 1 }, (_, i) => 2025 - i);

  if (loading) {
    return (
      <div className="db-info-wrap">
        <div
          className="d-flex justify-content-center align-items-center flex-column"
          style={{ height: '100vh', backgroundColor: '#f9f9f9' }}
        >
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
          <p className="mt-3 fw-semibold text-dark fs-5">Loading, please wait...</p>
        </div>
      </div>
    );
  }

  if (!agentData) {
    return null;
  }

  return (
    <div className="db-info-wrap">
      <div className="row">
        <div className="col-lg-12">
          <div className="dashboard-box user-form-wrap">
            <h4>Agent Edit Details</h4>
            <form className="form-horizontal" onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      name="firstName"
                      className="form-control"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      type="text"
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      name="lastName"
                      className="form-control"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      type="text"
                      required
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleInputChange}
                      type="email"
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <label>Date of Birth</label>
                  <div className="row">
                    <div className="col-sm-4">
                      <div className="form-group">
                        <select name="day" value={formData.day} onChange={handleInputChange} className="form-control">
                          <option value="">Day</option>
                          {days.map((day) => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="form-group">
                        <select name="month" value={formData.month} onChange={handleInputChange} className="form-control">
                          <option value="">Month</option>
                          {months.map((month) => (
                            <option key={month} value={month}>{month}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="form-group">
                        <select name="year" value={formData.year} onChange={handleInputChange} className="form-control">
                          <option value="">Year</option>
                          {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Country Code</label>
                    <select name="countryCode" value={formData.countryCode} onChange={handleInputChange} className="form-control">
                      <option value="">Select Country Code</option>
                      <option value="+91">+91</option>
                      <option value="+977">+977</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      name="phone"
                      id="input-phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleInputChange}
                      type="text"
                    />
                  </div>
                </div>
                <div className="col-12">
                  <h4>Contact Details</h4>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Country</label>
                    <select name="country" value={formData.country} onChange={handleInputChange} className="form-control">
                      <option value="">Select Country</option>
                      <option value="India">India</option>
                      <option value="Italy">Italy</option>
                      <option value="Japan">Japan</option>
                    </select>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>State</label>
                    <select name="state" value={formData.state} onChange={handleInputChange} className="form-control">
                      <option value="">Select State</option>
                      <option value="Punjab">Punjab</option>
                      <option value="New York">New York</option>
                      <option value="Mexico">Mexico</option>
                    </select>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>City</label>
                    <select name="city" value={formData.city} onChange={handleInputChange} className="form-control">
                      <option value="">Select City</option>
                      <option value="Nawashahar">Nawashahar</option>
                      <option value="Tokyo">Tokyo</option>
                      <option value="Paris">Paris</option>
                    </select>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Address</label>
                    <input
                      name="address"
                      className="form-control"
                      value={formData.address}
                      onChange={handleInputChange}
                      type="text"
                    />
                  </div>
                </div>
                <div className="col-12">
                  <h4>Upload Profile Photo</h4>
                </div>
                <div className="col-sm-6">
                  <div className="upload-input">
                    <div className="form-group">
                      <span className="upload-btn block mb-2">Upload an image</span>
                      <input
                        type="file"
                        name="profilePic"
                        id="profilePic"
                        onChange={handleInputChange}
                        accept="image/*"
                        className="custom-file-input"
                      />
                    </div>
                    {agentData.profilePic && (
                      <div className="current-img">
                        <p className="mb-1">Current Image</p>
                        <img
                          src={`${import.meta.env.VITE_API_URL}/Uploads/profiles/${agentData.profilePic}`}
                          alt="Profile Picture"
                          style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-12">
                  <h4>Describe Yourself</h4>
                </div>
                <div className="col-sm-12">
                  <div className="form-group">
                    <label>Please Tell Us About You</label>
                    <textarea
                      className="form-control"
                      id="message"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder=""
                      rows="4"
                    ></textarea>
                  </div>
                </div>
                <div className="col-12">
                  <h4>Status Of Agent</h4>
                </div>
                <div className="col-sm-12">
                  <div className="form-group">
                    <label>Status</label>
                    <select name="isActive" value={formData.isActive} onChange={handleInputChange} className="form-control">
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>
              </div>
              <button type="submit" className="button-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className=" btn-secondary ml-2"
                style={{padding: '15px 30px',    fontSize: '16px'}}
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentEdit;
