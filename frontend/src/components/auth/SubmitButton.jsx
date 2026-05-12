import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import Spinner from '../ui/Spinner';

export default function SubmitButton({
  children,
  loading = false,
  icon: Icon = LogIn,
  ...props
}) {
  return (
    <motion.button
      className="auth-submit-btn"
      type="submit"
      disabled={loading}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      {...props}
    >
      {loading ? (
        <Spinner size={20} color="#ffffff" />
      ) : (
        <Icon size={18} />
      )}
      <span>{loading ? 'Please wait...' : children}</span>
    </motion.button>
  );
}
