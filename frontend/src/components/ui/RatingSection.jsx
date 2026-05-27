import { motion } from 'framer-motion';

export const ratingOptions = [
  { value: 'Good', label: 'Good', colorClass: 'good' },
  { value: 'Good with some concerns', label: 'Good with some concerns', colorClass: 'concerns' },
  { value: 'Significant concern', label: 'Significant concern', colorClass: 'significant' },
  { value: 'Critical', label: 'Critical', colorClass: 'critical' },
  { value: 'Data deficient', label: 'Data deficient', colorClass: 'deficient' },
];

export default function RatingSection({ title, rating, onRatingChange }) {
  return (
    <div className="rating-section">
      {title && <h3 className="rating-title">{title}</h3>}
      <div className="rating-options">
        {ratingOptions.map((opt) => (
          <motion.div 
            key={opt.value}
            className={`rating-option ${rating === opt.value ? 'selected' : ''}`}
            onClick={() => onRatingChange(opt.value)}
            whileHover={{ x: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <div className={`rating-dot ${opt.colorClass}`} />
            <span className={`rating-label ${opt.colorClass}`}>{opt.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
