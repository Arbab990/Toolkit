import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

export default function ComingSoonPage({ title }) {
  return (
    <motion.div
      className="coming-soon-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-header__title">{title}</h1>
          <p className="page-header__subtitle">This section is coming soon.</p>
        </div>
      </div>

      <div className="coming-soon-card">
        <div className="coming-soon-card__icon">
          <Clock />
        </div>
        <h2>Coming soon</h2>
        <p>We are preparing this workspace for a future update.</p>
      </div>
    </motion.div>
  );
}
