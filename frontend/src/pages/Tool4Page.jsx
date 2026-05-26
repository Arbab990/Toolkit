import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, ArrowRight } from 'lucide-react';
import { getAssessment, saveAssessment } from '../services/assessmentService';
import { getSite } from '../services/siteService';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';

const columns = [
  {
    key: 'managers',
    label: 'Group or institution recognized as managers',
    hint: 'List the name of the institution or group in this column',
  },
  {
    key: 'role',
    label: 'Specific role, mandate and responsibilities to manage the property',
    hint: 'Describe briefly the specific role(s)/mandate(s)/responsibilities for managing the property and buffer zone',
  },
  {
    key: 'powers',
    label: "Key instruments and powers at the managers' disposal to implement mandate",
    hint: "Record the specific legal, regulatory or customary instruments at the managers' disposal; briefly summarize the managers' key powers",
  },
  {
    key: 'involvement',
    label: 'Extent of involvement in the decision-making processes',
    hint: 'Record the extent to which the manager is in charge of developing, coordinating and taking decisions about the management of the property and buffer zone',
  },
  {
    key: 'comments',
    label: 'Comments/ explanation',
    hint: '',
  },
];

const createRows = () =>
  Array.from({ length: 6 }, () =>
    columns.reduce((row, column) => ({ ...row, [column.key]: '' }), {})
  );

export default function Tool4Page() {
  const { id: siteId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [site, setSite] = useState(null);
  const [formData, setFormData] = useState({
    rows: createRows(),
    analysis: '',
    gaps: '',
    recommendations: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [siteRes, assessmentRes] = await Promise.all([
          getSite(siteId),
          getAssessment(siteId, 4),
        ]);

        setSite(siteRes.data);
        if (assessmentRes.data) {
          setFormData({
            rows: assessmentRes.data.rows || createRows(),
            analysis: assessmentRes.data.analysis || '',
            gaps: assessmentRes.data.gaps || '',
            recommendations: assessmentRes.data.recommendations || '',
          });
        }
      } catch (err) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [siteId]);

  const handleRowChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      rows: prev.rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    }));
  };

  const handleTextareaChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onSave = async (isNext = false) => {
    setSaving(true);
    try {
      await saveAssessment({
        siteId,
        toolNumber: 4,
        data: formData,
        rating: null,
        isCompleted: isNext,
      });
      toast.success('Assessment saved successfully');
      if (isNext) navigate(`/sites/${siteId}`);
    } catch (err) {
      toast.error('Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <motion.div className="tool-page tool-4-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="tool-header">
        <button className="back-btn" onClick={() => navigate(`/sites/${siteId}`)}>
          <ArrowLeft size={18} />
          Back to Site
        </button>
        <div className="tool-title-group">
          <h1>Worksheet 4a. Assessment of roles and responsibilities of managers</h1>
          <p className="site-name-display">{site?.name}</p>
        </div>
      </div>

      <div className="excel-worksheet" style={{ borderColor: 'white' }}>
        <div className="table-responsive">
          <table className="worksheet-table structured-tool-table tool-4-table">
            <thead>
              <tr className="worksheet-title-row">
                <th colSpan="5">Worksheet 4a. Assessment of roles and responsibilities of managers</th>
              </tr>
              <tr className="sub-header-row">
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="tool-4-hint-row">
                {columns.map((column) => (
                  <td key={column.key}>{column.hint}</td>
                ))}
              </tr>
              {formData.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="tool-4-data-row">
                  {columns.map((column) => (
                    <td key={column.key}>
                      <textarea
                        className="table-textarea"
                        value={row[column.key] || ''}
                        onChange={(e) => handleRowChange(rowIndex, column.key, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="worksheet-bottom-sections">
          <div className="bottom-section">
            <div className="section-label">Analysis and conclusions</div>
            <textarea
              value={formData.analysis}
              onChange={(e) => handleTextareaChange('analysis', e.target.value)}
              placeholder="Enter analysis and conclusions here..."
            />
          </div>
          <div className="bottom-section">
            <div className="section-label">Gaps and challenges</div>
            <textarea
              value={formData.gaps}
              onChange={(e) => handleTextareaChange('gaps', e.target.value)}
              placeholder="Enter gaps and challenges here..."
            />
          </div>
          <div className="bottom-section">
            <div className="section-label">Opportunities, recommendations and follow-up actions</div>
            <textarea
              value={formData.recommendations}
              onChange={(e) => handleTextareaChange('recommendations', e.target.value)}
              placeholder="Enter opportunities and recommendations here..."
            />
          </div>
        </div>
      </div>

      <div className="tool-footer">
        <button className="btn-save" onClick={() => onSave(false)} disabled={saving}>
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Progress'}
        </button>
        <button className="btn-save-next" onClick={() => onSave(true)} disabled={saving}>
          Save & Next
          <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}
