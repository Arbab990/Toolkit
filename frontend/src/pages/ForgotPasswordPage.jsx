import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthLayout from '../components/auth/AuthLayout';
import FormInput from '../components/auth/FormInput';
import SubmitButton from '../components/auth/SubmitButton';
import { useToast } from '../context/ToastContext';
import { forgotPassword } from '../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success('Password reset instructions have been sent');
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to send reset email. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle={
        sent
          ? 'Check your email for reset instructions'
          : 'Enter your email to receive reset instructions'
      }
    >
      {!sent ? (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <FormInput
            label="Email address"
            id="forgot-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            icon={Mail}
            error={error}
            autoComplete="email"
          />

          <SubmitButton loading={loading}>Send Reset Link</SubmitButton>
        </form>
      ) : (
        <motion.div
          className="auth-success-message"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="auth-success-message__icon">
            <Mail size={32} />
          </div>
          <p className="auth-success-message__text">
            We have sent password reset instructions to <strong>{email}</strong>.
            Please check your inbox.
          </p>
        </motion.div>
      )}

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
