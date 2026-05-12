import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PasswordInput({
  label,
  id,
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  ...props
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className={`form-input-wrapper${error ? ' form-input-wrapper--error' : ''}`}>
        {Icon && (
          <span className="form-input-icon">
            <Icon size={18} />
          </span>
        )}
        <input
          className="form-input"
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...props}
        />
        <button
          type="button"
          className="form-input-toggle"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <motion.p
          className="form-error"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
