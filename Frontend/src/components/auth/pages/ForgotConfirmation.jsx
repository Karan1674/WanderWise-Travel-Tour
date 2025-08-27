import { useLocation, Link } from 'react-router-dom';

function ForgotConfirmation() {
  const { state } = useLocation();
  const { email, resetUrl } = state || {};

  return (
    <div className="login-page" style={{ backgroundImage: `url(/assets/images/bg.jpg)` }}>
      <div className="login-from-wrap">
        <h1 className="site-title">
          <Link to="/">
            <img src="/assets/images/logoImage1.png" alt="Logo" />
          </Link>
        </h1>
        <div className="form-group">
          <p>Password reset link generated for {email || 'your email'}:</p>
          <p><a href={resetUrl}>{resetUrl}</a></p>
          <p>Click the link above to reset your password. This link will expire in 1 hour.</p>
        </div>
        <div className="form-group">
          <Link to="/login" className="button-primary w-100 text-center">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotConfirmation;