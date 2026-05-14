import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SitesTable({ sites, onDelete }) {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState(null);

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <section className="sites-table-section" id="all-sites-table">
      <h2 className="sites-table-section__title">All Sites</h2>
      <div className="sites-table-wrapper">
        <table className="sites-table">
          <thead>
            <tr>
              <th>Site Name</th>
              <th>Last Assessment</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site, index) => (
              <tr 
                key={site._id || index} 
                id={`table-row-${index}`}
                onClick={() => navigate(`/sites/${site._id}`)}
                className="clickable-row"
              >
                <td data-label="Site Name" style={{ fontWeight: 600 }}>{site.name}</td>
                <td data-label="Last Assessment">{site.lastAssessment || 'Not assessed'}</td>
                <td data-label="Status">
                  {(() => {
                    let statusLabel = 'Not Assessed';
                    let statusClass = 'status-badge--not-assessed';

                    if (site.progress === 100) {
                      statusLabel = 'Completed';
                      statusClass = 'status-badge--completed';
                    } else if (site.progress > 0) {
                      statusLabel = 'Partially Assessed';
                      statusClass = 'status-badge--partially-assessed';
                    }

                    return (
                      <span className={`status-badge ${statusClass}`}>
                        {statusLabel}
                      </span>
                    );
                  })()}
                </td>
                <td data-label="Actions" style={{ textAlign: 'right' }}>
                  <button 
                    className="delete-row-btn"
                    onClick={(e) => handleDeleteClick(e, site._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="modal-overlay" onClick={() => setDeleteId(null)}>
            <motion.div 
              className="confirm-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="confirm-modal__icon">
                <AlertTriangle size={32} color="#ef4444" />
              </div>
              <h3>Remove Site?</h3>
              <p>Are you sure you want to remove this site? This action will delete all its records and cannot be undone.</p>
              
              <div className="confirm-modal__actions">
                <motion.button 
                  className="btn-confirm-yes"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmDelete}
                >
                  Yes, Remove
                </motion.button>
                <motion.button 
                  className="btn-confirm-no"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteId(null)}
                >
                  No, Cancel
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
