import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { setUser } from '../../../redux/slices/authSlice';
import axios from 'axios';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/loginUserOrAdmin`,formData, {
        withCredentials: true, 
      });
    
      const data = await response.data;
      console.log(response)
      if (data.success) {
        dispatch(setUser({ user: data.user, userType: data.role }));
        toast[data.type](data.message);
        data.role === 'User' ? '/UserDashboard' : '/dashboard'
        navigate(data.redirect);
      } 
      else{
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
    <div className="login-page" style={{ backgroundImage: `url(/assets/images/bg.jpg)` }}>
      <div className="login-from-wrap">
        <form className="login-from" onSubmit={handleSubmit}>
          <h1 className="site-title">
            <Link to="/">
              <img src="/assets/images/logoImage1.png" alt="Logo" />
            </Link>
          </h1>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              className="validate"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
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
          <Link to="/forgot-password" className="for-pass">Forgot Password?</Link>
          <div className="form-group">
            <button type="submit" className="button-primary w-100" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
          <p className="d-flex justify-content-between align-items-center gap-2">
            <span>Don't have an account?</span>
            <Link to="/signup" className="btn btn-link p-0">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;