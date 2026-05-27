import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  ArrowRight,
  ClipboardList,
  ChevronDown,
  Check,
  Pencil
} from 'lucide-react';
import { getAssessment, saveAssessment } from '../services/assessmentService';
import { getSite } from '../services/siteService';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';

const worksheet8bSections = [
  {
    title: 'Organizational (work programming, administration and reporting)',
    questions: [
      '1. Are there clear policies and procedures for preparing annual (or multi-year) workplans, as well as budgets?',
      '2. Are there clear policies or guidelines as to who is responsible for monitoring and reporting requirements (e.g. at the national and/or international level)? Is it clear how such reports are to be compiled and presented?',
      '3. Are there institutional norms and standards for procurement, budgets, financial management and/or auditing?',
      '4. Are there established procedures to identify staff needs, conduct performance appraisals and identify capacity-building needs?',
      '5. Are there clear rules and procedures to ensure ethical conduct standards for staff, contractors and volunteers?'
    ]
  },
  {
    title: 'Communication, education and interpretation',
    questions: [
      '6. Is there a communication strategy or plan about what information is to be communicated to different actors (i.e., managers, rights-holders and stakeholders) and when and how that information can be shared?',
      '7. Is there an awareness and education programme that addresses all audiences (i.e., children, youth, adults, different genders, different language speakers) that contributes to raising understandings of the property and its values?',
      '8. Are the rules on how to use the World Heritage emblem respected, adequately integrated into local contexts, and enforced?',
      '9. Is key information about the management of the property made available to the public - and to rights-holders in particular (e.g. management plan is available online or consultation events are widely communicated through different media)?'
    ]
  },
  {
    title: 'Impact assessment, risk management and climate change mitigation and adaptation',
    questions: [
      '10. Are there clear rules and procedures as to when impact assessment processes should be triggered and how they should be carried out?',
      '11. Is there a disaster risk management plan to assess, mitigate, prepare, respond, and recover from various disasters caused by natural and human-induced hazards - such as earthquakes, floods, fires, vandalism, etc.? Is this plan well integrated into the management planning framework for the property?',
      '12. Is there a climate change mitigation and adaptation strategy? If yes, is this strategy well integrated into the planning framework for the property? Does the climate change mitigation and adaptation strategy align with agreed international and national targets?',
      '13. Is resilience thinking integrated into long-term, planning processes?'
    ]
  },
  {
    title: 'Access, tourism and visitation',
    questions: [
      '14. Is there a tourism strategy or similar instrument to manage visitors, tourism activities and its derived economic, socio-cultural and environmental impacts? If such a strategy exists as a separate instrument, is it well aligned with the management plan for the property?',
      '15. Are visitor numbers and other relevant tourism-related indicators monitored regularly? Is the resulting data and information used to improve visitor management and inform management decisions?',
      '16. How well is the information on the OUV and other important values of the property presented and interpreted to tourists and visitors?'
    ]
  },
  {
    title: 'Research',
    questions: [
      '17. Is there a planned programme of research (or research agenda) for the property which is directed towards management needs and/or improving understanding of OUV and other important values of the property? Is it incorporated into or aligned with the management plan?',
      '18. Are there clear policies as to how external partners and/or institutions can conduct research related to the property and how research findings are to be shared and disseminated?'
    ]
  }
];

const createWorksheet8bRows = () =>
  worksheet8bSections.flatMap((section) =>
    section.questions.map((question) => ({
      section: section.title,
      question,
      response: '',
      recommendations: '',
      saved: false,
    }))
  );

const normalizeWorksheet8bRows = (rows = createWorksheet8bRows()) =>
  createWorksheet8bRows().map((baseRow, index) => {
    const savedRow = rows[index] || {};
    return {
      ...baseRow,
      ...savedRow,
      saved: Boolean(savedRow.saved || savedRow.response || savedRow.recommendations),
    };
  });

export default function Tool8Page() {
  const { id: siteId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [site, setSite] = useState(null);

  const [worksheet8bEditingIndex, setWorksheet8bEditingIndex] = useState(null);
  const [worksheet8bOpenPicker, setWorksheet8bOpenPicker] = useState(null);
  const [worksheet8bDraft, setWorksheet8bDraft] = useState({
    section: '',
    questionIndex: '',
    response: '',
    recommendations: '',
  });

  const [formData, setFormData] = useState({
    worksheet8b: {
      rows: createWorksheet8bRows(),
      analysis: '',
      gaps: '',
      recommendations: '',
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [siteRes, assessmentRes] = await Promise.all([
          getSite(siteId),
          getAssessment(siteId, 8),
        ]);

        setSite(siteRes.data);
        if (assessmentRes.data) {
          setFormData({
            worksheet8b: {
              rows: normalizeWorksheet8bRows(assessmentRes.data.worksheet8b?.rows),
              analysis: assessmentRes.data.worksheet8b?.analysis || '',
              gaps: assessmentRes.data.worksheet8b?.gaps || '',
              recommendations: assessmentRes.data.worksheet8b?.recommendations || '',
            }
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

  const handleWorksheet8bRowChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      worksheet8b: {
        ...prev.worksheet8b,
        rows: prev.worksheet8b.rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
      },
    }));
  };

  const handleWorksheet8bTextareaChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      worksheet8b: { ...prev.worksheet8b, [field]: value },
    }));
  };

  const selectWorksheet8bDraftQuestion = (sectionTitle, index) => {
    setWorksheet8bDraft((prev) => ({ ...prev, section: sectionTitle, questionIndex: String(index) }));
    setWorksheet8bOpenPicker(null);
  };

  const saveWorksheet8bRow = async (index, values) => {
    const nextData = {
      ...formData,
      worksheet8b: {
        ...formData.worksheet8b,
        rows: formData.worksheet8b.rows.map((row, i) =>
          i === index ? { ...row, ...values, saved: true } : row
        ),
      },
    };

    setSaving(true);
    try {
      await saveAssessment({
        siteId,
        toolNumber: 8,
        data: nextData,
        rating: null,
        isCompleted: false,
      });
      setFormData(nextData);
      setWorksheet8bEditingIndex(null);
      setWorksheet8bDraft({ section: '', questionIndex: '', response: '', recommendations: '' });
      toast.success('Row saved successfully');
    } catch (err) {
      toast.error('Failed to save row');
    } finally {
      setSaving(false);
    }
  };

  const onSave = async (isNext = false) => {
    setSaving(true);
    try {
      await saveAssessment({
        siteId,
        toolNumber: 8,
        data: formData,
        rating: null,
        isCompleted: isNext,
      });
      toast.success('Assessment saved successfully');
      if (isNext) navigate(`/sites/${siteId}/tool/9`);
    } catch (err) {
      toast.error('Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  const renderWorksheet8bSection = (section) => {
    const sectionRows = formData.worksheet8b.rows
      .map((row, index) => ({ ...row, index }))
      .filter((row) => row.section === section.title);
    
    const savedRows = sectionRows.filter((row) => row.saved);
    const availableRows = sectionRows.filter((row) => !row.saved);
    
    return (
      <Fragment key={section.title}>
        <tr className="tool-3-section-row">
          <td colSpan="4">{section.title}</td>
        </tr>
        {savedRows.map((row) => (
          <tr key={row.question} className="tool-3-question-row">
            <td className="tool-3-question">
              {row.question}
            </td>
            <td>
              <textarea
                className="table-textarea"
                value={row.response || ''}
                disabled={worksheet8bEditingIndex !== row.index}
                onChange={(e) => handleWorksheet8bRowChange(row.index, 'response', e.target.value)}
              />
            </td>
            <td>
              <textarea
                className="table-textarea"
                value={row.recommendations || ''}
                disabled={worksheet8bEditingIndex !== row.index}
                onChange={(e) => handleWorksheet8bRowChange(row.index, 'recommendations', e.target.value)}
              />
            </td>
            <td className="tool-3-actions-cell">
              {worksheet8bEditingIndex === row.index ? (
                <button
                  className="row-action-btn save"
                  onClick={() => saveWorksheet8bRow(row.index, formData.worksheet8b.rows[row.index])}
                  disabled={saving}
                  title="Save row"
                >
                  <Check size={18} />
                </button>
              ) : (
                <button
                  className="row-action-btn edit"
                  onClick={() => setWorksheet8bEditingIndex(row.index)}
                  title="Edit row"
                >
                  <Pencil size={18} />
                </button>
              )}
            </td>
          </tr>
        ))}

        {availableRows.length > 0 && (
          <tr className="tool-3-question-row">
            <td className="tool-3-question">
              <div className="tool-3-question-picker">
                <button
                  type="button"
                  className="tool-3-question-picker__button"
                  onClick={() => setWorksheet8bOpenPicker(worksheet8bOpenPicker === section.title ? null : section.title)}
                >
                  <span>
                    {worksheet8bDraft.section === section.title && availableRows.find(r => String(r.index) === String(worksheet8bDraft.questionIndex))
                      ? availableRows.find(r => String(r.index) === String(worksheet8bDraft.questionIndex)).question
                      : 'Select question'}
                  </span>
                  <ChevronDown size={16} />
                </button>
                {worksheet8bOpenPicker === section.title && (
                  <div className="tool-3-question-picker__menu">
                    {availableRows.map((row) => (
                      <button
                        key={row.index}
                        type="button"
                        className="tool-3-question-picker__option"
                        onClick={() => selectWorksheet8bDraftQuestion(section.title, row.index)}
                      >
                        <span>{row.question}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </td>
            <td>
              <textarea
                className="table-textarea"
                value={worksheet8bDraft.section === section.title ? worksheet8bDraft.response : ''}
                onChange={(e) =>
                  setWorksheet8bDraft((prev) => ({ ...prev, section: section.title, response: e.target.value }))
                }
              />
            </td>
            <td>
              <textarea
                className="table-textarea"
                value={worksheet8bDraft.section === section.title ? worksheet8bDraft.recommendations : ''}
                onChange={(e) =>
                  setWorksheet8bDraft((prev) => ({
                    ...prev,
                    section: section.title,
                    recommendations: e.target.value,
                  }))
                }
              />
            </td>
            <td className="tool-3-actions-cell">
              <button
                className="row-action-btn save"
                onClick={() =>
                  saveWorksheet8bRow(Number(worksheet8bDraft.questionIndex), {
                    response: worksheet8bDraft.response,
                    recommendations: worksheet8bDraft.recommendations,
                  })
                }
                disabled={saving || worksheet8bDraft.section !== section.title || worksheet8bDraft.questionIndex === ''}
                title="Save row"
              >
                <Check size={18} />
              </button>
            </td>
          </tr>
        )}
      </Fragment>
    );
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <motion.div className="tool-page tool-8-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="tool-header">
        <button className="back-btn" onClick={() => navigate(`/sites/${siteId}`)}>
          <ArrowLeft size={18} />
          Back to Site
        </button>
        <div className="tool-title-group">
          <h1>Tool 8: Management processes</h1>
          <p className="site-name-display">{site?.name}</p>
        </div>
      </div>

      <div className="excel-worksheet tool-8b-worksheet" style={{ borderColor: 'white' }}>
        <div className="table-responsive">
          <table className="worksheet-table structured-tool-table tool-3-table">
            <colgroup>
              <col />
              <col />
              <col />
              <col className="tool-3-actions-col" />
            </colgroup>
            <thead>
              <tr className="worksheet-title-row">
                <th colSpan="4">
                  <div className="worksheet-title-content">
                    <ClipboardList size={18} />
                    <span>Worksheet 8b. Assessment of other important management processes</span>
                  </div>
                </th>
              </tr>
              <tr className="sub-header-row">
                <th>Question</th>
                <th>Response</th>
                <th>Opportunities and recommendations</th>
                <th className="tool-3-actions-header"></th>
              </tr>
            </thead>
            <tbody>
              {worksheet8bSections.map(renderWorksheet8bSection)}
            </tbody>
          </table>
        </div>

        <div className="worksheet-bottom-sections">
          <div className="bottom-section">
            <div className="section-label">Analysis and conclusions</div>
            <textarea
              value={formData.worksheet8b.analysis}
              onChange={(e) => handleWorksheet8bTextareaChange('analysis', e.target.value)}
              placeholder="Enter analysis and conclusions here..."
            />
          </div>
          <div className="bottom-section">
            <div className="section-label">Gaps and challenges</div>
            <textarea
              value={formData.worksheet8b.gaps}
              onChange={(e) => handleWorksheet8bTextareaChange('gaps', e.target.value)}
              placeholder="Enter gaps and challenges here..."
            />
          </div>
          <div className="bottom-section">
            <div className="section-label">Opportunities, recommendations and follow-up actions</div>
            <textarea
              value={formData.worksheet8b.recommendations}
              onChange={(e) => handleWorksheet8bTextareaChange('recommendations', e.target.value)}
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
