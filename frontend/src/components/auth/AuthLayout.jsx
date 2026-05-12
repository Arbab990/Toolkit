import { motion } from 'framer-motion';
import { Leaf, BarChart3, Shield, ClipboardCheck } from 'lucide-react';

const features = [
  {
    icon: ClipboardCheck,
    title: 'Comprehensive Assessments',
    description:
      'Evaluate heritage sites with guided tools and structured frameworks.',
  },
  {
    icon: BarChart3,
    title: 'Data-Driven Decisions',
    description:
      'Track progress, analyze data, and make informed management decisions.',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description:
      'Your data is secure and accessible anytime, anywhere.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const formVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="auth-layout" id="auth-layout">
      {/* Left branding panel */}
      <motion.div
        className="auth-brand"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="auth-brand__content">
          <motion.div className="auth-brand__logo" variants={itemVariants}>
            <div className="auth-brand__logo-icon">
              <Leaf />
            </div>
            <div className="auth-brand__logo-text">
              <span className="auth-brand__name">EOH 2.0</span>
              <span className="auth-brand__tagline-small">Heritage Management</span>
            </div>
          </motion.div>

          <motion.div className="auth-brand__hero" variants={itemVariants}>
            <h1 className="auth-brand__heading">
              Protect. Preserve. Plan.
            </h1>
            <p className="auth-brand__subheading">
              Manage heritage sites{'\n'}for a sustainable future.
            </p>
          </motion.div>

          <motion.ul className="auth-brand__features" variants={containerVariants}>
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.li
                  key={feature.title}
                  className="auth-brand__feature"
                  variants={itemVariants}
                >
                  <div className="auth-brand__feature-icon">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="auth-brand__feature-title">{feature.title}</h3>
                    <p className="auth-brand__feature-desc">{feature.description}</p>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>

        <div className="auth-brand__image-overlay" />
        <img
          src="/images/auth-bg.png"
          alt="Heritage landscape"
          className="auth-brand__image"
        />
      </motion.div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <motion.div
          className="auth-form-container"
          initial="hidden"
          animate="visible"
          variants={formVariants}
        >
          <div className="auth-form-header">
            <h2 className="auth-form-header__title">{title}</h2>
            {subtitle && (
              <p className="auth-form-header__subtitle">{subtitle}</p>
            )}
          </div>

          {children}
        </motion.div>

        <motion.div
          className="auth-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="auth-footer__security">
            <Shield size={16} />
            <div>
              <span className="auth-footer__security-title">Secure authentication</span>
              <span className="auth-footer__security-text">
                Your data is protected with enterprise-grade security.
              </span>
            </div>
          </div>
          <div className="auth-footer__help">
            Need help?{' '}
            <a href="#" className="auth-footer__link">Contact Support</a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
