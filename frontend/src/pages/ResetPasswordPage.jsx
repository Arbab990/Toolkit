import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthLayout from '../components/auth/AuthLayout';
import PasswordInput from '../components/auth/PasswordInput';
import SubmitButton from '../components/auth/SubmitButton';
import { useToast } from '../context/ToastContext';
import { resetPassword } from '../services/authService';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await resetPassword(token, formData.password);
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to reset password. Token may be invalid or expired.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your new password below"
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <PasswordInput
          label="New password"
          id="password"
          placeholder="Enter new password"
          value={formData.password}
          onChange={handleChange}
          icon={Lock}
          error={errors.password}
          autoComplete="new-password"
        />

        <PasswordInput
          label="Confirm new password"
          id="confirmPassword"
          placeholder="Confirm new password"
          value={formData.confirmPassword}
          onChange={handleChange}
          icon={Lock}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <SubmitButton loading={loading}>Reset Password</SubmitButton>
      </form>

      <motion.div
        className="auth-form__back"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <Link to="/login" className="auth-form__back-link">
          <ArrowLeft size={16} />
          Back to Sign In
        </Link>
      </motion.div>
    </AuthLayout>
  );
}
