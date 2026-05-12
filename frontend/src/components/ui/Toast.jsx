import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ICON_MAP = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

export default function Toast({ message, type = 'info', onClose }) {
  const Icon = ICON_MAP[type] || Info;

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      className={`toast toast--${type}`}
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <Icon className="toast__icon" />
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={onClose} aria-label="Close notification">
        <X size={16} />
      </button>
    </motion.div>
  );
}
