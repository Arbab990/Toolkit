import { motion } from 'framer-motion';

export default function FormInput({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  ...props
}) {
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
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...props}
        />
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
