import axios from 'axios';
import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

function ResetPassword() {
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const token = params.get('token');
  const type = params.get('type');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password?token=${token}&type=${type}`,formData, {
        withCredentials: true, 
      });

      const data = await response.data;
      
      if (data.success) {
        toast[data.type](data.message);
        navigate(data.redirect || '/login');
    
      } else {
        toast[data.type](data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url(/assets/images/bg.jpg)` }}>
      <div className="login-from-wrap">
        <form className="login-from" onSubmit={handleSubmit}>
          <h1 className="site-title">
            <Link to="/">
              <img src="/assets/images/logoImage1.png" alt="Logo" />
            </Link>
          </h1>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              name="password"
              id="password"
              className="validate"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              className="validate"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <button type="submit" className="button-primary w-100" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
          <Link to="/login" className="for-pass">Back to Login</Link>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;