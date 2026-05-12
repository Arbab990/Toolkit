import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthLayout from '../components/auth/AuthLayout';
import FormInput from '../components/auth/FormInput';
import PasswordInput from '../components/auth/PasswordInput';
import SubmitButton from '../components/auth/SubmitButton';
import SocialLogin from '../components/auth/SocialLogin';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your account"
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormInput
          label="Email address"
          id="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          icon={Mail}
          error={errors.email}
          autoComplete="email"
        />

        <PasswordInput
          label="Password"
          id="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          icon={Lock}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="auth-form__options">
          <label className="auth-checkbox" htmlFor="remember-me">
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span className="auth-checkbox__mark" />
            <span className="auth-checkbox__label">Remember me</span>
          </label>
          <Link to="/forgot-password" className="auth-form__forgot-link">
            Forgot password?
          </Link>
        </div>

        <SubmitButton loading={loading}>Sign In</SubmitButton>
      </form>

      <SocialLogin />

      <motion.p
        className="auth-form__switch"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        Don't have an account?{' '}
        <Link to="/register" className="auth-form__switch-link">
          Create Account
        </Link>
      </motion.p>
    </AuthLayout>
  );
}
