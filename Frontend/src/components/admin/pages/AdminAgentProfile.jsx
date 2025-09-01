import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { setUser } from '../../../redux/slices/authSlice';
import '../../../styles/custom.scss';

const AdminAgentProfile = () => {
  const { user, userType } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '',
    dateOfBirth: '',
    country: '',
    state: '',
    city: '',
    address: '',
    description: '',
    profilePic: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(!user);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/admin-agent-profile`, { withCredentials: true });
        if (response.data.success && response.data.user) {
         
          setFormData({
            firstName: response.data.user.firstName || '',
            lastName: response.data.user.lastName || '',
            email: response.data.user.email || '',
            phone: response.data.user.phone || '',
            countryCode: response.data.user.countryCode || '',
            dateOfBirth: response.data.user.dateOfBirth ? new Date(response.data.user.dateOfBirth).toISOString().split('T')[0] : '',
            country: response.data.user.country || '',
            state: response.data.user.state || '',
            city: response.data.user.city || '',
            address: response.data.user.address || '',
            description: response.data.user.description || '',
            profilePic: null,
          });
          if (response.data.user.profilePic) {
            setPreviewImage(`${import.meta.env.VITE_API_URL}/Uploads/profiles/${response.data.user.profilePic}`);
          }
        } else {
          toast.error(response.data.message || 'Failed to load profile');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Server error fetching profile');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    if (!user) {
      fetchProfile();
    } else {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        countryCode: user.countryCode || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        country: user.country || '',
        state: user.state || '',
        city: user.city || '',
        address: user.address || '',
        description: user.description || '',
        profilePic: null,
      });
      if (user.profilePic) {
        setPreviewImage(`${import.meta.env.VITE_API_URL}/Uploads/profiles/${user.profilePic}`);
      }
    }
  }, [user, dispatch, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePic: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/admin-agent-profile/update`, data, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        dispatch(setUser({ user: response.data.user, userType: userType }));
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Server error updating profile');
    }
  };

  const toggleEditForm = () => {
    setIsEditing(!isEditing);
  };

  if (isLoading) {
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

  return (
    <div className="db-info-wrap">
        <div className="custom">
      <div className="profile-row">
        <div className="profile-full-width">
          <div className="dashboard-box table-opp-color-box shadow-sm">
            <h4 className="adminagent-profile-title">Profile Management</h4>
            <p className="adminagent-profile-subtitle">View and update your profile information</p>

            {/* Profile View Section */}
            <div className={`adminagent-profile-view-section ${isEditing ? 'adminagent-hidden' : ''}`}>
              <div className="adminagent-profile-view-card">
                <div className="adminagent-profile-flex-container">
                  <div className="adminagent-avatar-section">
                    {user.profilePic ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}/Uploads/profiles/${user.profilePic}`}
                        alt="Profile Picture"
                        className="adminagent-avatar-img"
                      />
                    ) : (
                      <i className="fas fa-user adminagent-avatar-icon"></i>
                    )}
                  </div>
                  <div className="adminagent-profile-info-section">
                    <h3 className="adminagent-profile-title adminagent-profile-name">
                      {user.firstName} {user.lastName}
                    </h3>
                    <div className="adminagent-profile-info-grid">
                      <div className="adminagent-info-group">
                        <div className="adminagent-info-label">
                          <i className="fas fa-envelope adminagent-icon-primary"></i>Email
                        </div>
                        <div className="adminagent-info-value">{user.email}</div>
                      </div>
                      <div className="adminagent-info-group">
                        <div className="adminagent-info-label">
                          <i className="fas fa-phone adminagent-icon-primary"></i>Phone
                        </div>
                        <div className="adminagent-info-value">{user.phone}</div>
                      </div>
                      {userType !== 'admin' && (
                        <>
                          <div className="adminagent-info-group">
                            <div className="adminagent-info-label">
                              <i className="fas fa-globe adminagent-icon-primary"></i>Country Code
                            </div>
                            <div className="adminagent-info-value">{user.countryCode || 'Not set'}</div>
                          </div>
                          <div className="adminagent-info-group">
                            <div className="adminagent-info-label">
                              <i className="fas fa-calendar-alt adminagent-icon-primary"></i>Date of Birth
                            </div>
                            <div className="adminagent-info-value">
                              {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not set'}
                            </div>
                          </div>
                          <div className="adminagent-info-group">
                            <div className="adminagent-info-label">
                              <i className="fas fa-map-marker-alt adminagent-icon-primary"></i>Country
                            </div>
                            <div className="adminagent-info-value">{user.country || 'Not set'}</div>
                          </div>
                          <div className="adminagent-info-group">
                            <div className="adminagent-info-label">
                              <i className="fas fa-map adminagent-icon-primary"></i>State
                            </div>
                            <div className="adminagent-info-value">{user.state || 'Not set'}</div>
                          </div>
                          <div className="adminagent-info-group">
                            <div className="adminagent-info-label">
                              <i className="fas fa-city adminagent-icon-primary"></i>City
                            </div>
                            <div className="adminagent-info-value">{user.city || 'Not set'}</div>
                          </div>
                          <div className="adminagent-info-group">
                            <div className="adminagent-info-label">
                              <i className="fas fa-home adminagent-icon-primary"></i>Address
                            </div>
                            <div className="adminagent-info-value">{user.address || 'Not set'}</div>
                          </div>
                          <div className="adminagent-info-group">
                            <div className="adminagent-info-label">
                              <i className="fas fa-info-circle adminagent-icon-primary"></i>Description
                            </div>
                            <div className="adminagent-info-value">{user.description || 'Not set'}</div>
                          </div>
                          <div className="adminagent-info-group">
                            <div className="adminagent-info-label">
                              <i className="fas fa-user-tie adminagent-icon-primary"></i>Admin
                            </div>
                            <div className="adminagent-info-value">
                              {user.admin ? `${user.admin.firstName} ${user.admin.lastName}` : 'Not assigned'}
                            </div>
                          </div>
                        </>
                      )}
                      <div className="adminagent-info-group">
                        <div className="adminagent-info-label">
                          <i className="fas fa-user-shield adminagent-icon-primary"></i>Role
                        </div>
                        <div className="adminagent-info-value">
                          <span className="adminagent-profile-badge">{userType === 'admin' ? 'Admin' : 'Agent'}</span>
                        </div>
                      </div>
                      <div className="adminagent-info-group">
                        <div className="adminagent-info-label">
                          <i className="fas fa-clock adminagent-icon-primary"></i>Last Updated
                        </div>
                        <div className="adminagent-info-value">
                          {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Not set'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="adminagent-profile-edit-btn" onClick={toggleEditForm}>
                    <i className="fas fa-edit adminagent-icon-btn"></i>Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Edit Section */}
            <div className={`adminagent-profile-edit-section ${isEditing ? '' : 'adminagent-hidden'}`}>
              <div className="adminagent-profile-edit-card">
                <h5 className="adminagent-profile-edit-title">Edit Profile</h5>
                <form onSubmit={handleSubmit}>
                  <div className="adminagent-profile-form-grid">
                    <div className="form-field">
                      <div className="adminagent-form-group">
                        <label htmlFor="firstName" className="adminagent-form-label">First Name *</label>
                        <div className="adminagent-input-container">
                          <span className="adminagent-input-icon"><i className="fas fa-user adminagent-icon-primary"></i></span>
                          <input
                            type="text"
                            name="firstName"
                            id="firstName"
                            className="adminagent-form-input"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-field">
                      <div className="adminagent-form-group">
                        <label htmlFor="lastName" className="adminagent-form-label">Last Name *</label>
                        <div className="adminagent-input-container">
                          <span className="adminagent-input-icon"><i className="fas fa-user adminagent-icon-primary"></i></span>
                          <input
                            type="text"
                            name="lastName"
                            id="lastName"
                            className="adminagent-form-input"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-field">
                      <div className="adminagent-form-group">
                        <label htmlFor="email" className="adminagent-form-label">Email *</label>
                        <div className="adminagent-input-container">
                          <span className="adminagent-input-icon"><i className="fas fa-envelope adminagent-icon-primary"></i></span>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            className="adminagent-form-input"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-field">
                      <div className="adminagent-form-group">
                        <label htmlFor="phone" className="adminagent-form-label">Phone *</label>
                        <div className="adminagent-input-container">
                          <span className="adminagent-input-icon"><i className="fas fa-phone adminagent-icon-primary"></i></span>
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            className="adminagent-form-input"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    {userType !== 'admin' && (
                      <>
                        <div className="form-field">
                          <div className="adminagent-form-group">
                            <label htmlFor="countryCode" className="adminagent-form-label">Country Code *</label>
                            <div className="adminagent-input-container">
                              <span className="adminagent-input-icon"><i className="fas fa-globe adminagent-icon-primary"></i></span>
                              <input
                                type="text"
                                name="countryCode"
                                id="countryCode"
                                className="adminagent-form-input"
                                value={formData.countryCode}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                        </div>
                        <div className="form-field">
                          <div className="adminagent-form-group">
                            <label htmlFor="dateOfBirth" className="adminagent-form-label">Date of Birth</label>
                            <div className="adminagent-input-container">
                              <span className="adminagent-input-icon"><i className="fas fa-calendar-alt adminagent-icon-primary"></i></span>
                              <input
                                type="date"
                                name="dateOfBirth"
                                id="dateOfBirth"
                                className="adminagent-form-input"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="form-field">
                          <div className="adminagent-form-group">
                            <label htmlFor="country" className="adminagent-form-label">Country</label>
                            <div className="adminagent-input-container">
                              <span className="adminagent-input-icon"><i className="fas fa-map-marker-alt adminagent-icon-primary"></i></span>
                              <input
                                type="text"
                                name="country"
                                id="country"
                                className="adminagent-form-input"
                                value={formData.country}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="form-field">
                          <div className="adminagent-form-group">
                            <label htmlFor="state" className="adminagent-form-label">State</label>
                            <div className="adminagent-input-container">
                              <span className="adminagent-input-icon"><i className="fas fa-map adminagent-icon-primary"></i></span>
                              <input
                                type="text"
                                name="state"
                                id="state"
                                className="adminagent-form-input"
                                value={formData.state}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="form-field">
                          <div className="adminagent-form-group">
                            <label htmlFor="city" className="adminagent-form-label">City</label>
                            <div className="adminagent-input-container">
                              <span className="adminagent-input-icon"><i className="fas fa-city adminagent-icon-primary"></i></span>
                              <input
                                type="text"
                                name="city"
                                id="city"
                                className="adminagent-form-input"
                                value={formData.city}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="form-field">
                          <div className="adminagent-form-group">
                            <label htmlFor="address" className="adminagent-form-label">Address</label>
                            <div className="adminagent-input-container">
                              <span className="adminagent-input-icon"><i className="fas fa-home adminagent-icon-primary"></i></span>
                              <input
                                type="text"
                                name="address"
                                id="address"
                                className="adminagent-form-input"
                                value={formData.address}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="adminagent-form-field-full">
                          <div className="adminagent-form-group">
                            <label htmlFor="description" className="adminagent-form-label">Description</label>
                            <div className="adminagent-input-container">
                              <span className="adminagent-input-icon"><i className="fas fa-info-circle adminagent-icon-primary"></i></span>
                              <textarea
                                name="description"
                                id="description"
                                className="adminagent-form-input adminagent-form-textarea"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="5"
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    <div className="adminagent-form-field-full">
                      <div className="adminagent-form-group">
                        <label htmlFor="profilePic" className="adminagent-form-label">Profile Picture</label>
                        <input
                          type="file"
                          name="profilePic"
                          id="profilePic"
                          className="adminagent-form-input"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </div>
                      {previewImage && (
                        <div className="adminagent-profile-pic-preview">
                          <div className="adminagent-form-group">
                            <label className="adminagent-form-label">Current Profile Picture</label>
                            <div>
                              <img
                                src={previewImage}
                                alt="Profile Picture Preview"
                                className="adminagent-preview-img"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="adminagent-form-actions">
                    <button type="submit" className="adminagent-btn-save">
                      <i className="fas fa-save adminagent-icon-btn"></i>Save Changes
                    </button>
                    <button type="button" className="adminagent-btn-cancel" onClick={toggleEditForm}>
                      <i className="fas fa-times adminagent-icon-btn"></i>Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default AdminAgentProfile;
