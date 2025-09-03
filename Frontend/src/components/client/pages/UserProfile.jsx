import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../layouts/Loader';
import { setUser } from '../../../redux/slices/authSlice';

function UserProfile() {
  const { user, userType } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profilePic: null,
  });


  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!user || userType !== 'User') {
          toast.error('Unauthorized access');
          navigate('/login');
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/client/user-profile`, {
          withCredentials: true,
        });

        if (response.data.success) {
          dispatch(setUser({ user: response.data.user, userType: 'User' }));
          setFormData({
            firstName: response.data.user.firstName || '',
            lastName: response.data.user.lastName || '',
            email: response.data.user.email || '',
            phone: response.data.user.phone || '',
            profilePic: response.data.user.profilePic || '',
          });
        } else {
          toast.error(response.data.message || 'Failed to load profile');
          navigate('/login');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Server error');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, userType, dispatch]);

  const toggleEditForm = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, profilePic: file }));

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append('firstName', formData.firstName);
      form.append('lastName', formData.lastName);
      form.append('email', formData.email);
      form.append('phone', formData.phone);
      if (formData.profilePic) {
        form.append('profilePic', formData.profilePic);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/client/user-profile/update`,
        form,
        { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        setUser(response.data.user);
        dispatch(setUser({ user: response.data.user, userType: 'User' }));
        setFormData({
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          email: response.data.user.email,
          phone: response.data.user.phone,
          profilePic: response.data.user.profilePic,
        });
        toast.success(response.data.message);
        setIsEditing(false);
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Server error');
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return null; // Fallback handled by navigate('/login')
  }

  return (
    <>
      <section className="inner-banner-wrap">
        <div className="inner-baner-container" style={{ backgroundImage: 'url(/assets/images/inner-banner.jpg)' }}>
          <div className="container">
            <div className="inner-banner-content">
              <h1 className="inner-title">My Profile</h1>
            </div>
          </div>
        </div>
        <div className="inner-shape"></div>
      </section>
      <div className="profile-section">
        <div className="container">
          <div className="dashboard-box table-opp-color-box">
            <div className="profile-view-section" style={{ display: isEditing ? 'none' : 'block', opacity: isEditing ? 0 : 1 }}>
              <div className="profile-view-card">
                <div className="profile-flex-container">
                  <div className="avatar-section">
                    {user.profilePic ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}/Uploads/profiles/${user.profilePic}`}
                        alt="Profile Picture"
                        className="avatar-img"
                      />
                    ) : (
                      <i className="fas fa-user avatar-icon"></i>
                    )}
                  </div>
                  <div className="profile-info-section">
                    <h3 className="profile-title profile-name">
                      {user.firstName} {user.lastName}
                    </h3>
                    <div className="profile-info-grid">
                      <div className="info-card">
                        <div className="info-card-header">
                          <i className="fas fa-envelope icon-primary"></i>
                          <span className="info-label">Email</span>
                        </div>
                        <div className="info-card-content">{user.email}</div>
                      </div>
                      <div className="info-card">
                        <div className="info-card-header">
                          <i className="fas fa-phone icon-primary"></i>
                          <span className="info-label">Phone</span>
                        </div>
                        <div className="info-card-content">{user.phone}</div>
                      </div>
                      <div className="info-card">
                        <div className="info-card-header">
                          <i className="fas fa-clock icon-primary"></i>
                          <span className="info-label">Last Updated</span>
                        </div>
                        <div className="info-card-content">
                          {new Date(user.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="profile-edit-btn" onClick={toggleEditForm}>
                    <i className="fas fa-edit icon-btn"></i>Edit Profile
                  </button>
                </div>
              </div>
            </div>
            <div className="profile-edit-section" style={{ display: isEditing ? 'block' : 'none', opacity: isEditing ? 1 : 0 }}>
              <div className="profile-edit-card">
                <div className="profile-edit-body">
                  <h3 className="profile-edit-title">Edit Profile</h3>
                  <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="profile-form-grid">
                      <div className="form-field">
                        <div className="form-group">
                          <label htmlFor="firstName" className="form-label">
                            First Name *
                          </label>
                          <div className="input-container">
                            <span className="input-icon">
                              <i className="fas fa-user icon-primary"></i>
                            </span>
                            <input
                              type="text"
                              name="firstName"
                              id="firstName"
                              className="form-input"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="form-field">
                        <div className="form-group">
                          <label htmlFor="lastName" className="form-label">
                            Last Name *
                          </label>
                          <div className="input-container">
                            <span className="input-icon">
                              <i className="fas fa-user icon-primary"></i>
                            </span>
                            <input
                              type="text"
                              name="lastName"
                              id="lastName"
                              className="form-input"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="form-field">
                        <div className="form-group">
                          <label htmlFor="email" className="form-label">
                            Email *
                          </label>
                          <div className="input-container">
                            <span className="input-icon">
                              <i className="fas fa-envelope icon-primary"></i>
                            </span>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              className="form-input"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="form-field">
                        <div className="form-group">
                          <label htmlFor="phone" className="form-label">
                            Phone *
                          </label>
                          <div className="input-container">
                            <span className="input-icon">
                              <i className="fas fa-phone icon-primary"></i>
                            </span>
                            <input
                              type="tel"
                              name="phone"
                              id="phone"
                              className="form-input"
                              value={formData.phone}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="form-field-full form-field">
                
  <div className="form-group">
    <label htmlFor="profilePic" className="form-label ">
      Profile Picture
    </label>


    <input
      type="file"
      name="profilePic"
      id="profilePic"
      accept="image/*"
      onChange={handleFileChange}
      className="form-input"
    />
  </div>


                        {(user.profilePic) && (
                          <div className="form-field">
                            <div>
                              <label className="form-label">Current Profile Picture</label>
                              <div>
                                <img
                                  src={`${import.meta.env.VITE_API_URL}/Uploads/profiles/${user.profilePic}`}
                                  alt="Current Profile Picture"
                                  className="preview-img"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn-save">
                        <i className="fas fa-save icon-btn"></i>Save Changes
                      </button>
                      <button type="button" className="btn-cancel" onClick={toggleEditForm}>
                        <i className="fas fa-times icon-btn"></i>Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .profile-view-section {
          background-color: #f9fafb;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 40px;
          transition: opacity 0.3s ease;
        }

        .profile-view-card {
          border-radius: 10px;
          padding: 25px;
        }

        .profile-flex-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        @media (min-width: 768px) {
          .profile-flex-container {
            flex-direction: row;
            align-items: flex-start;
          }
        }

        .avatar-section {
          text-align: center;
          margin-bottom: 15px;
        }

        .avatar-img {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 50%;
          border: 3px solid #2563eb;
        }

        .avatar-icon {
          font-size: 60px;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #e5e7eb;
          border-radius: 50%;
          border: 3px solid #2563eb;
        }

        .profile-info-section {
          flex-grow: 1;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .profile-title {
          font-size: 1.8rem;
          color: #111827;
          font-weight: 600;
          margin-bottom: 20px;
          text-align: center;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }

        @media (min-width: 768px) {
          .profile-title {
            text-align: left;
          }
        }

        .profile-info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 768px) {
          .profile-info-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .info-card {
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease, background-color 0.2s ease;
        }

        .info-card:hover {
          background-color: #eff6ff;
          transform: translateY(-2px);
        }

        .info-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .info-label {
          font-size: 0.95rem;
          color: #374151;
          font-weight: 600;
        }

        .info-card-content {
          font-size: 1rem;
          color: #111827;
          font-weight: 400;
          word-break: break-word;
          line-height: 1.5;
        }

        .icon-primary {
          color: #2563eb;
          font-size: 1.2rem;
        }

        .profile-edit-btn {
          background-color: #2563eb;
          color: #ffffff;
          border: none;
          padding: 10px 20px;
          font-size: 1.2rem !important;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
        }

        @media (min-width: 768px) {
          .profile-edit-btn {
            margin-top: 0;
          }
        }

        .profile-edit-btn:hover {
          background-color: #1e40af;
        }

        .profile-edit-section {
          background-color: #f9fafb;
          border-radius: 12px;
          padding: 50px;
          margin-bottom: 50px;
          transition: opacity 0.3s ease;
        }

        .profile-edit-card {
          background: #ffffff;
          border-radius: 10px;
          padding: 25px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .profile-edit-title {
          font-size: 1.6rem;
          font-weight: 600;
          color: #2563eb;
          margin-bottom: 20px;
        }

        .profile-form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        @media (min-width: 768px) {
          .profile-form-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .form-field-full {
          grid-column: 1 / -1;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 1rem;
          color: #111827;
          font-weight: 500;
        }

        .input-container {
          display: flex;
          align-items: center;
          border: 1px solid ;
          border-radius: 8px;
          overflow: hidden;
        }

        .input-icon {
          background-color: #e5e7eb;
          padding: 15px;
          display: flex;
          align-items: center;
        }

        .form-input {
          border: 1px solid;
          padding: 12px;
          font-size: 1rem;
          width: 100%;
          background-color: #ffffff;
        }

        .form-input:focus {
          outline: none;
          box-shadow: 0 0 5px rgba(37, 99, 235, 0.3);
        }

        .preview-img {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #e5e7eb;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .btn-save {
            background-color: #16a34a;
            color: #ffffff;
            border: none;
            padding: 10px 20px;
            font-size: 1.2rem !important;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn-save:hover {
            background-color: #15803d;
        }

        .btn-cancel {
            background-color: transparent;
            color: #6b7280;
            border: 1px solid #6b7280;
            padding: 10px 20px;
            font-size: 1.2rem !important;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn-cancel:hover {
            background-color: #6b7280;
            color: #ffffff;
        }

        .icon-btn {
            font-size: 1rem;
        }


      `}</style>
    </>
  );
}

export default UserProfile;