import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  ArrowRight,
  Plus,
  Trash2,
  Building2,
  ClipboardList,
  KeyRound,
  GitBranch,
  MessageSquare,
  Users,
  Handshake,
  Check,
  Pencil,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { getAssessment, saveAssessment } from '../services/assessmentService';
import { getSite } from '../services/siteService';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';

const columns = [
  {
    key: 'managers',
    label: 'Group or institution recognized as managers',
    hint: 'List the name of the institution or group in this column',
    icon: Building2,
  },
  {
    key: 'role',
    label: 'Specific role, mandate and responsibilities to manage the property',
    hint: 'Describe briefly the specific role(s)/mandate(s)/responsibilities for managing the property and buffer zone',
    icon: ClipboardList,
  },
  {
    key: 'powers',
    label: "Key instruments and powers at the managers' disposal to implement mandate",
    hint: "Record the specific legal, regulatory or customary instruments at the managers' disposal; briefly summarize the managers' key powers",
    icon: KeyRound,
  },
  {
    key: 'involvement',
    label: 'Extent of involvement in the decision-making processes',
    hint: 'Record the extent to which the manager is in charge of developing, coordinating and taking decisions about the management of the property and buffer zone',
    icon: GitBranch,
  },
  {
    key: 'comments',
    label: 'Comments/ explanation',
    hint: '',
    icon: MessageSquare,
  },
];

const createRow = () => columns.reduce((row, column) => ({ ...row, [column.key]: '' }), {});
const createRows = () => [createRow()];

const worksheet4bAspects = [
  'Existence of platforms, agreements, contracts, procedures and financial resources for coordination and collaboration',
  'Sharing of relevant information between managers',
  'Alignment of related policies and plans',
  'Coordination - ability to work together in a planned and organized way',
  'Collaboration - ability to work together based on shared objectives, joint projects and planning and monitoring mechanisms',
];

const createWorksheet4bRows = () =>
  worksheet4bAspects.map((aspect) => ({
    aspect,
    strengths: '',
    challenges: '',
    comments: '',
    saved: false,
  }));

const worksheet4cQuestions = [
  'What are the main issues affecting the group?',
  'To what extent is the group aware of its rights (including rights over certain heritage resources and their use), obligations or influence in relation to the property and its buffer zone(s)?',
  "How and to what extent are the group's rights and knowledge recognized and respected by managers, as well as by other rights-holder groups?",
  "What are the nature and extent of any negative effects on the property's attributes, authenticity and integrity deriving from this group's interaction with the property?",
  "Does the management of the property and its buffer zone(s) negatively affect or undermine the group's practices or beliefs (including access to resources)? If yes, what are the negative effects on this group?",
  "What is the nature and extent of any positive effects of the group and its practices on the property's attributes, authenticity and integrity?",
  'What are the direct benefits generated from the property to the group? To what extent is the group dependent on the property for economic or other benefits?',
  "What is the group's willingness and capacity to participate in decision-making processes regarding the management of property and its buffer zone(s)? Under what terms or conditions?",
  "What is the group's relative political or cultural leverage or influence on the management of the property and its buffer zone(s)?",
  "How and to what degree is the group organized regarding engagement with and participation in management? Are there specific mechanisms that facilitate the group's engagement?",
  'Describe the nature and extent to which the group contributes to decision-making in relation to site management. Are there formal or informal management agreements or arrangements in place in this regard?',
  'Describe the actual engagement of the group in the management of the property.',
  "Based on the information above, provide a brief overview of the group's engagement with, and capacity to participate in, the governance and management of the property.",
];

const createWorksheet4cRows = () =>
  worksheet4cQuestions.map((question) => ({
    question,
    group1: '',
    group2: '',
    group3: '',
    comments: '',
    saved: false,
  }));

const normalizeWorksheet4bRows = (rows = createWorksheet4bRows()) =>
  createWorksheet4bRows().map((baseRow, index) => {
    const savedRow = rows[index] || {};
    return {
      ...baseRow,
      ...savedRow,
      saved: Boolean(savedRow.saved || savedRow.strengths || savedRow.challenges || savedRow.comments),
    };
  });

const normalizeWorksheet4cRows = (rows = createWorksheet4cRows()) =>
  createWorksheet4cRows().map((baseRow, index) => {
    const savedRow = rows[index] || {};
    return {
      ...baseRow,
      ...savedRow,
      saved: Boolean(savedRow.saved || savedRow.group1 || savedRow.group2 || savedRow.group3 || savedRow.comments),
    };
  });

export default function Tool4Page() {
  const { id: siteId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [site, setSite] = useState(null);
  const [worksheet4bEditingIndex, setWorksheet4bEditingIndex] = useState(null);
  const [worksheet4bPickerOpen, setWorksheet4bPickerOpen] = useState(false);
  const [worksheet4cEditingIndex, setWorksheet4cEditingIndex] = useState(null);
  const [worksheet4cPickerOpen, setWorksheet4cPickerOpen] = useState(false);
  const [worksheet4bDraft, setWorksheet4bDraft] = useState({
    rowIndex: '',
    strengths: '',
    challenges: '',
    comments: '',
  });
  const [worksheet4cDraft, setWorksheet4cDraft] = useState({
    rowIndex: '',
    group1: '',
    group2: '',
    group3: '',
    comments: '',
  });
  const [formData, setFormData] = useState({
    rows: createRows(),
    analysis: '',
    gaps: '',
    recommendations: '',
    worksheet4b: {
      rows: createWorksheet4bRows(),
      analysis: '',
      gaps: '',
      recommendations: '',
    },
    worksheet4c: {
      rows: createWorksheet4cRows(),
      analysis: '',
      gaps: '',
      recommendations: '',
    },
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
            worksheet4b: {
              rows: normalizeWorksheet4bRows(assessmentRes.data.worksheet4b?.rows),
              analysis: assessmentRes.data.worksheet4b?.analysis || '',
              gaps: assessmentRes.data.worksheet4b?.gaps || '',
              recommendations: assessmentRes.data.worksheet4b?.recommendations || '',
            },
            worksheet4c: {
              rows: normalizeWorksheet4cRows(assessmentRes.data.worksheet4c?.rows),
              analysis: assessmentRes.data.worksheet4c?.analysis || '',
              gaps: assessmentRes.data.worksheet4c?.gaps || '',
              recommendations: assessmentRes.data.worksheet4c?.recommendations || '',
            },
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

  const handleWorksheet4bRowChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      worksheet4b: {
        ...prev.worksheet4b,
        rows: prev.worksheet4b.rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
      },
    }));
  };

  const handleWorksheet4bTextareaChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      worksheet4b: {
        ...prev.worksheet4b,
        [field]: value,
      },
    }));
  };

  const handleWorksheet4cRowChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      worksheet4c: {
        ...prev.worksheet4c,
        rows: prev.worksheet4c.rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
      },
    }));
  };

  const handleWorksheet4cTextareaChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      worksheet4c: {
        ...prev.worksheet4c,
        [field]: value,
      },
    }));
  };

  const saveData = async (nextData, isCompleted = false) => {
    await saveAssessment({
      siteId,
      toolNumber: 4,
      data: nextData,
      rating: null,
      isCompleted,
    });
  };

  const saveWorksheet4bRow = async (index, values) => {
    const nextData = {
      ...formData,
      worksheet4b: {
        ...formData.worksheet4b,
        rows: formData.worksheet4b.rows.map((row, i) =>
          i === index ? { ...row, ...values, saved: true } : row
        ),
      },
    };

    setSaving(true);
    try {
      await saveData(nextData);
      setFormData(nextData);
      setWorksheet4bEditingIndex(null);
      setWorksheet4bDraft({ rowIndex: '', strengths: '', challenges: '', comments: '' });
      toast.success('Row saved successfully');
    } catch (err) {
      toast.error('Failed to save row');
    } finally {
      setSaving(false);
    }
  };

  const saveWorksheet4cRow = async (index, values) => {
    const nextData = {
      ...formData,
      worksheet4c: {
        ...formData.worksheet4c,
        rows: formData.worksheet4c.rows.map((row, i) =>
          i === index ? { ...row, ...values, saved: true } : row
        ),
      },
    };

    setSaving(true);
    try {
      await saveData(nextData);
      setFormData(nextData);
      setWorksheet4cEditingIndex(null);
      setWorksheet4cDraft({ rowIndex: '', group1: '', group2: '', group3: '', comments: '' });
      toast.success('Row saved successfully');
    } catch (err) {
      toast.error('Failed to save row');
    } finally {
      setSaving(false);
    }
  };

  const addRow = () => {
    setFormData((prev) => ({ ...prev, rows: [...prev.rows, createRow()] }));
  };

  const removeRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      rows: prev.rows.length > 1 ? prev.rows.filter((_, i) => i !== index) : prev.rows,
    }));
  };

  const onSave = async (isNext = false) => {
    setSaving(true);
    try {
      await saveData(formData, isNext);
      toast.success('Assessment saved successfully');
      if (isNext) navigate(`/sites/${siteId}/tool/5`);
    } catch (err) {
      toast.error('Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const savedWorksheet4bRows = formData.worksheet4b.rows
    .map((row, index) => ({ ...row, index }))
    .filter((row) => row.saved);
  const availableWorksheet4bRows = formData.worksheet4b.rows
    .map((row, index) => ({ ...row, index }))
    .filter((row) => !row.saved);
  const selectedWorksheet4bRow = availableWorksheet4bRows.find(
    (row) => String(row.index) === String(worksheet4bDraft.rowIndex)
  );
  const savedWorksheet4cRows = formData.worksheet4c.rows
    .map((row, index) => ({ ...row, index }))
    .filter((row) => row.saved);
  const availableWorksheet4cRows = formData.worksheet4c.rows
    .map((row, index) => ({ ...row, index }))
    .filter((row) => !row.saved);
  const selectedWorksheet4cRow = availableWorksheet4cRows.find(
    (row) => String(row.index) === String(worksheet4cDraft.rowIndex)
  );

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
            <colgroup>
              <col className="tool-4-narrow-col" />
              <col span="5" />
              <col className="tool-4-narrow-col" />
            </colgroup>
            <thead>
              <tr className="worksheet-title-row">
                <th colSpan="7">
                  <div className="worksheet-title-content">
                    <Users size={18} />
                    <span>Worksheet 4a. Assessment of roles and responsibilities of managers</span>
                  </div>
                </th>
              </tr>
              <tr className="sub-header-row">
                <th className="no-col">S.No.</th>
                {columns.map((column) => (
                  <th key={column.key}>
                    <div className="th-content">
                      <column.icon size={18} />
                      <span>{column.label}</span>
                    </div>
                  </th>
                ))}
                <th className="action-col"></th>
              </tr>
            </thead>
            <tbody>
              <tr className="tool-4-hint-row">
                <td className="row-no"></td>
                {columns.map((column) => (
                  <td key={column.key}>{column.hint}</td>
                ))}
                <td className="delete-row-cell"></td>
              </tr>
              {formData.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="tool-4-data-row">
                  <td className="row-no">
                    <div className="numbered-circle">{rowIndex + 1}</div>
                  </td>
                  {columns.map((column) => (
                    <td key={column.key}>
                      <textarea
                        className="table-textarea"
                        value={row[column.key] || ''}
                        onChange={(e) => handleRowChange(rowIndex, column.key, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="delete-row-cell">
                    <button className="row-action-btn delete" onClick={() => removeRow(rowIndex)}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="add-row-container">
                <td colSpan="7">
                  <button className="add-row-btn" onClick={addRow}>
                    <Plus size={14} /> Add Row
                  </button>
                </td>
              </tr>
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

      <div className="excel-worksheet tool-4b-worksheet" style={{ borderColor: 'white', marginTop: '32px' }}>
        <div className="table-responsive">
          <table className="worksheet-table structured-tool-table tool-4b-table">
            <colgroup>
              <col />
              <col />
              <col />
              <col />
              <col className="tool-4b-actions-col" />
            </colgroup>
            <thead>
              <tr className="worksheet-title-row">
                <th colSpan="5">
                  <div className="worksheet-title-content">
                    <Handshake size={18} />
                    <span>Worksheet 4b. Assessment of coordination and collaboration between managers</span>
                  </div>
                </th>
              </tr>
              <tr className="sub-header-row">
                <th>Aspects/themes</th>
                <th>Strengths</th>
                <th>Challenges</th>
                <th>Comments/Explanation</th>
                <th className="tool-4b-actions-header"></th>
              </tr>
            </thead>
            <tbody>
              {savedWorksheet4bRows.map((row) => (
                <tr key={row.aspect} className="tool-4b-data-row">
                  <td className="tool-4b-aspect">{row.aspect}</td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={row.strengths}
                      disabled={worksheet4bEditingIndex !== row.index}
                      onChange={(e) => handleWorksheet4bRowChange(row.index, 'strengths', e.target.value)}
                    />
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={row.challenges}
                      disabled={worksheet4bEditingIndex !== row.index}
                      onChange={(e) => handleWorksheet4bRowChange(row.index, 'challenges', e.target.value)}
                    />
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={row.comments}
                      disabled={worksheet4bEditingIndex !== row.index}
                      onChange={(e) => handleWorksheet4bRowChange(row.index, 'comments', e.target.value)}
                    />
                  </td>
                  <td className="tool-4b-actions-cell">
                    {worksheet4bEditingIndex === row.index ? (
                      <button
                        className="row-action-btn save"
                        onClick={() => saveWorksheet4bRow(row.index, formData.worksheet4b.rows[row.index])}
                        disabled={saving}
                        title="Save row"
                      >
                        <Check size={18} />
                      </button>
                    ) : (
                      <button
                        className="row-action-btn edit"
                        onClick={() => setWorksheet4bEditingIndex(row.index)}
                        title="Edit row"
                      >
                        <Pencil size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {availableWorksheet4bRows.length > 0 && (
                <tr className="tool-4b-data-row">
                  <td className="tool-4b-aspect">
                    <div className="tool-3-question-picker">
                      <button
                        type="button"
                        className="tool-3-question-picker__button"
                        onClick={() => setWorksheet4bPickerOpen((open) => !open)}
                      >
                        <span>{selectedWorksheet4bRow?.aspect || 'Select aspect/theme'}</span>
                        <ChevronDown size={16} />
                      </button>
                      {worksheet4bPickerOpen && (
                        <div className="tool-3-question-picker__menu">
                          {availableWorksheet4bRows.map((row) => (
                            <button
                              key={row.index}
                              type="button"
                              className="tool-3-question-picker__option"
                              onClick={() => {
                                setWorksheet4bDraft((prev) => ({ ...prev, rowIndex: String(row.index) }));
                                setWorksheet4bPickerOpen(false);
                              }}
                            >
                              <span>{row.aspect}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={worksheet4bDraft.strengths}
                      onChange={(e) =>
                        setWorksheet4bDraft((prev) => ({ ...prev, strengths: e.target.value }))
                      }
                    />
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={worksheet4bDraft.challenges}
                      onChange={(e) =>
                        setWorksheet4bDraft((prev) => ({ ...prev, challenges: e.target.value }))
                      }
                    />
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={worksheet4bDraft.comments}
                      onChange={(e) =>
                        setWorksheet4bDraft((prev) => ({ ...prev, comments: e.target.value }))
                      }
                    />
                  </td>
                  <td className="tool-4b-actions-cell">
                    <button
                      className="row-action-btn save"
                      onClick={() =>
                        saveWorksheet4bRow(Number(worksheet4bDraft.rowIndex), {
                          strengths: worksheet4bDraft.strengths,
                          challenges: worksheet4bDraft.challenges,
                          comments: worksheet4bDraft.comments,
                        })
                      }
                      disabled={saving || worksheet4bDraft.rowIndex === ''}
                      title="Save row"
                    >
                      <Check size={18} />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="worksheet-bottom-sections">
          <div className="bottom-section">
            <div className="section-label">Analysis and conclusions</div>
            <textarea
              value={formData.worksheet4b.analysis}
              onChange={(e) => handleWorksheet4bTextareaChange('analysis', e.target.value)}
              placeholder="Enter analysis and conclusions here..."
            />
          </div>
          <div className="bottom-section">
            <div className="section-label">Gaps and challenges</div>
            <textarea
              value={formData.worksheet4b.gaps}
              onChange={(e) => handleWorksheet4bTextareaChange('gaps', e.target.value)}
              placeholder="Enter gaps and challenges here..."
            />
          </div>
          <div className="bottom-section">
            <div className="section-label">Opportunities, recommendations and follow-up actions</div>
            <textarea
              value={formData.worksheet4b.recommendations}
              onChange={(e) => handleWorksheet4bTextareaChange('recommendations', e.target.value)}
              placeholder="Enter opportunities and recommendations here..."
            />
          </div>
        </div>
      </div>

      <div className="excel-worksheet tool-4c-worksheet" style={{ borderColor: 'white', marginTop: '32px' }}>
        <div className="table-responsive">
          <table className="worksheet-table structured-tool-table tool-4c-table">
            <colgroup>
              <col />
              <col />
              <col />
              <col />
              <col />
              <col className="tool-4c-actions-col" />
            </colgroup>
            <thead>
              <tr className="worksheet-title-row">
                <th colSpan="6">
                  <div className="worksheet-title-content">
                    <UserCheck size={18} />
                    <span>Worksheet 4c. Assessment of rights-holders' engagement in management</span>
                  </div>
                </th>
              </tr>
              <tr className="sub-header-row">
                <th>Question</th>
                <th>Insert name of rights-holder group</th>
                <th>Insert name of rights-holder group</th>
                <th>Insert name of rights-holder group</th>
                <th>Comments/ Explanation</th>
                <th className="tool-4c-actions-header"></th>
              </tr>
            </thead>
            <tbody>
              {savedWorksheet4cRows.map((row) => (
                <tr key={row.question} className="tool-4c-data-row">
                  <td className="tool-4c-question">
                    <strong>{row.index + 1}.</strong> {row.question}
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={row.group1}
                      disabled={worksheet4cEditingIndex !== row.index}
                      onChange={(e) => handleWorksheet4cRowChange(row.index, 'group1', e.target.value)}
                    />
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={row.group2}
                      disabled={worksheet4cEditingIndex !== row.index}
                      onChange={(e) => handleWorksheet4cRowChange(row.index, 'group2', e.target.value)}
                    />
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={row.group3}
                      disabled={worksheet4cEditingIndex !== row.index}
                      onChange={(e) => handleWorksheet4cRowChange(row.index, 'group3', e.target.value)}
                    />
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={row.comments}
                      disabled={worksheet4cEditingIndex !== row.index}
                      onChange={(e) => handleWorksheet4cRowChange(row.index, 'comments', e.target.value)}
                    />
                  </td>
                  <td className="tool-4c-actions-cell">
                    {worksheet4cEditingIndex === row.index ? (
                      <button
                        className="row-action-btn save"
                        onClick={() => saveWorksheet4cRow(row.index, formData.worksheet4c.rows[row.index])}
                        disabled={saving}
                        title="Save row"
                      >
                        <Check size={18} />
                      </button>
                    ) : (
                      <button
                        className="row-action-btn edit"
                        onClick={() => setWorksheet4cEditingIndex(row.index)}
                        title="Edit row"
                      >
                        <Pencil size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {availableWorksheet4cRows.length > 0 && (
                <tr className="tool-4c-data-row">
                  <td className="tool-4c-question">
                    <div className="tool-3-question-picker">
                      <button
                        type="button"
                        className="tool-3-question-picker__button"
                        onClick={() => setWorksheet4cPickerOpen((open) => !open)}
                      >
                        <span>
                          {selectedWorksheet4cRow
                            ? `${selectedWorksheet4cRow.index + 1}. ${selectedWorksheet4cRow.question}`
                            : 'Select question'}
                        </span>
                        <ChevronDown size={16} />
                      </button>
                      {worksheet4cPickerOpen && (
                        <div className="tool-3-question-picker__menu">
                          {availableWorksheet4cRows.map((row) => (
                            <button
                              key={row.index}
                              type="button"
                              className="tool-3-question-picker__option"
                              onClick={() => {
                                setWorksheet4cDraft((prev) => ({ ...prev, rowIndex: String(row.index) }));
                                setWorksheet4cPickerOpen(false);
                              }}
                            >
                              <strong>{row.index + 1}.</strong>
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
                      value={worksheet4cDraft.group1}
                      onChange={(e) => setWorksheet4cDraft((prev) => ({ ...prev, group1: e.target.value }))}
                    />
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={worksheet4cDraft.group2}
                      onChange={(e) => setWorksheet4cDraft((prev) => ({ ...prev, group2: e.target.value }))}
                    />
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={worksheet4cDraft.group3}
                      onChange={(e) => setWorksheet4cDraft((prev) => ({ ...prev, group3: e.target.value }))}
                    />
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={worksheet4cDraft.comments}
                      onChange={(e) => setWorksheet4cDraft((prev) => ({ ...prev, comments: e.target.value }))}
                    />
                  </td>
                  <td className="tool-4c-actions-cell">
                    <button
                      className="row-action-btn save"
                      onClick={() =>
                        saveWorksheet4cRow(Number(worksheet4cDraft.rowIndex), {
                          group1: worksheet4cDraft.group1,
                          group2: worksheet4cDraft.group2,
                          group3: worksheet4cDraft.group3,
                          comments: worksheet4cDraft.comments,
                        })
                      }
                      disabled={saving || worksheet4cDraft.rowIndex === ''}
                      title="Save row"
                    >
                      <Check size={18} />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="worksheet-bottom-sections">
          <div className="bottom-section">
            <div className="section-label">Analysis and conclusions</div>
            <textarea
              value={formData.worksheet4c.analysis}
              onChange={(e) => handleWorksheet4cTextareaChange('analysis', e.target.value)}
              placeholder="Enter analysis and conclusions here..."
            />
          </div>
          <div className="bottom-section">
            <div className="section-label">Gaps and challenges</div>
            <textarea
              value={formData.worksheet4c.gaps}
              onChange={(e) => handleWorksheet4cTextareaChange('gaps', e.target.value)}
              placeholder="Enter gaps and challenges here..."
            />
          </div>
          <div className="bottom-section">
            <div className="section-label">Opportunities, recommendations and follow-up actions</div>
            <textarea
              value={formData.worksheet4c.recommendations}
              onChange={(e) => handleWorksheet4cTextareaChange('recommendations', e.target.value)}
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
