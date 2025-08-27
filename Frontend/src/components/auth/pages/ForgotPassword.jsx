import axios from 'axios';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgetPassword`,{email}, {
        withCredentials: true, 
      });
    

      const data = await response.data;

      if (data.success) {
        toast[data.type](data.message);
        navigate('/forgot-confirmation', { state: { email, resetUrl: data.resetUrl } });
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <button type="submit" className="button-primary w-100" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
          <Link to="/login" className="for-pass">Login</Link>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;