import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { setUser } from '../../../redux/slices/authSlice';
import axios from 'axios';

function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    profilePic: null,
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'profilePic') {
      setFormData({ ...formData, profilePic: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData();
    for (const key in formData) {
      form.append(key, formData[key]);
    }

    try {
    
      const response = await  axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signupUser`,form, {
        withCredentials: true,
      });
    
  
      const data = await response.data;

      if (data.success) {
        dispatch(setUser({ user: null, userType: null }));
        toast[data.type](data.message);
        navigate(data.redirect || '/login');
      } else {
        toast[data.type](data.message);
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ backgroundImage: `url('/assets/images/bg.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="bg-white p-4 p-md-5 rounded shadow w-100" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit} encType="multipart/form-data" id="signup-form">
          <div className="text-center mb-4">
            <Link to="/">
              <img src="/assets/images/logoImage1.png" alt="Logo" className="img-fluid" style={{ maxHeight: '60px' }} />
            </Link>
          </div>
          <div id="form-error" className="text-danger text-center mb-3" style={{ display: 'none' }}></div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                className="form-control"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                className="form-control"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="row mb-4">
            <div className="col-md-6">
              <label htmlFor="phone" className="form-label">Phone</label>
              <input
                type="tel"
                name="phone"
                id="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="profilePic" className="form-label">Profile Picture (Optional)</label>
              <input
                type="file"
                name="profilePic"
                id="profilePic"
                className="form-control"
                style={{ height: '45px' }}
                onChange={handleChange}
                accept="image/*"
              />
            </div>
          </div>
          <div className="form-group">
            <button type="submit" className="button-primary w-100" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </div>
          <p className="text-center">
            <span>Already have an account?</span>
            <Link to="/login" className="btn btn-link p-0">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;