import { Fragment, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, ArrowRight, Check, Pencil, ChevronDown } from 'lucide-react';
import { getAssessment, saveAssessment } from '../services/assessmentService';
import { getSite } from '../services/siteService';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';

const sections = [
  {
    title: 'World Heritage property',
    questions: [
      'Were the boundaries of the property defined in relation to the identification and mapping of the attributes that convey its Outstanding Universal Value? What other considerations were used to determine the boundaries?',
      'Are the boundaries and size of the property adequate to protect those attributes identified in response to Question 1? Do the boundaries and size of the property ensure functional, spatial and/or visual connectivity between the attributes?',
      'Are the boundaries and size of the property adequate to protect other important values of the property? (If not, respond to this question together with Question 9 below in relation to the buffer zone(s)).',
      'If there are other designations (at the international, national or local levels), are there issues deriving from different boundaries associated with those other designations?',
      'Are the boundaries of the World Heritage property well known to, and easily identified by, managers and rights-holders?',
      'Are there unresolved issues or grievances related to the delineation of the World Heritage property?',
    ],
  },
  {
    title: 'Buffer zone (if applicable)',
    questions: [
      'Is the purpose of the buffer zone(s) clear? Are the boundaries of the buffer zone(s) legally recognized?',
      'Are the boundaries of the buffer zone(s) adequate to provide an added layer of protection to the property?',
      'Was the buffer zone(s) defined in relation to the protection of other important values (that is, in addition to its purpose as an added layer of protection to the property)?',
      'Is the buffer zone(s) large enough to address threats originating from external interactions that may negatively affect the property?',
      'Are the boundaries of the buffer zone(s) well known to, and easily identified by, managers and rights-holders?',
      'Is the buffer zone(s) defined to ensure connectivity with the wider setting, as well as supporting the delivery of services and benefits?',
    ],
  },
  {
    title: 'Interactions with the wider setting',
    questions: [
      'Have large-scale spatial and functional dynamics important to maintain the values and integrity of the property been identified?',
      'Has consideration been given to the importance of identifying and/or defining the wider setting and context of the property in relation to large-scale spatial and functional dynamics?',
      'Have factors originating beyond the property and its buffer zone(s) been sufficiently identified?',
    ],
  },
];

const createRows = () =>
  sections.flatMap((section) =>
    section.questions.map((question) => ({
      section: section.title,
      question,
      response: '',
      recommendations: '',
      saved: false,
    }))
  );

const worldHeritageCount = sections[0].questions.length;
const bufferZoneStart = worldHeritageCount;
const bufferZoneCount = sections[1].questions.length;
const widerSettingStart = bufferZoneStart + bufferZoneCount;
const widerSettingCount = sections[2].questions.length;

const normalizeRows = (rows = createRows()) =>
  createRows().map((baseRow, index) => {
    const savedRow = rows[index] || {};
    return {
      ...baseRow,
      ...savedRow,
      saved: Boolean(savedRow.saved || savedRow.response || savedRow.recommendations),
    };
  });

export default function Tool3Page() {
  const { id: siteId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [site, setSite] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [openPicker, setOpenPicker] = useState(null);
  const [draftRow, setDraftRow] = useState({
    section: '',
    questionIndex: '',
    response: '',
    recommendations: '',
  });
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
          getAssessment(siteId, 3),
        ]);

        setSite(siteRes.data);
        if (assessmentRes.data) {
          setFormData({
            rows: normalizeRows(assessmentRes.data.rows),
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

  const selectDraftQuestion = (section, index) => {
    setDraftRow((prev) => ({ ...prev, section, questionIndex: String(index) }));
    setOpenPicker(null);
  };

  const saveData = async (nextData, isCompleted = false) => {
    await saveAssessment({
      siteId,
      toolNumber: 3,
      data: nextData,
      rating: null,
      isCompleted,
    });
  };

  const saveWorldHeritageRow = async (index, values) => {
    const nextData = {
      ...formData,
      rows: formData.rows.map((row, i) =>
        i === index ? { ...row, ...values, saved: true } : row
      ),
    };

    setSaving(true);
    try {
      await saveData(nextData);
      setFormData(nextData);
      setEditingIndex(null);
      setDraftRow({ section: '', questionIndex: '', response: '', recommendations: '' });
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
      await saveData(formData, isNext);
      toast.success('Assessment saved successfully');
      if (isNext) navigate(`/sites/${siteId}/tool/4`);
    } catch (err) {
      toast.error('Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  let rowIndex = worldHeritageCount;
  const worldRows = formData.rows.slice(0, worldHeritageCount);
  const savedWorldRows = worldRows
    .map((row, index) => ({ ...row, index }))
    .filter((row) => row.saved);
  const availableWorldRows = worldRows
    .map((row, index) => ({ ...row, index }))
    .filter((row) => !row.saved);
  const bufferRows = formData.rows.slice(bufferZoneStart, widerSettingStart);
  const savedBufferRows = bufferRows
    .map((row, index) => ({ ...row, index: bufferZoneStart + index }))
    .filter((row) => row.saved);
  const availableBufferRows = bufferRows
    .map((row, index) => ({ ...row, index: bufferZoneStart + index }))
    .filter((row) => !row.saved);
  const widerRows = formData.rows.slice(widerSettingStart, widerSettingStart + widerSettingCount);
  const savedWiderRows = widerRows
    .map((row, index) => ({ ...row, index: widerSettingStart + index }))
    .filter((row) => row.saved);
  const availableWiderRows = widerRows
    .map((row, index) => ({ ...row, index: widerSettingStart + index }))
    .filter((row) => !row.saved);

  const renderQuestionPicker = (sectionKey, label, rows) => {
    const selected =
      draftRow.section === sectionKey
        ? rows.find((row) => String(row.index) === String(draftRow.questionIndex))
        : null;

    return (
      <div className="tool-3-question-picker">
        <button
          type="button"
          className="tool-3-question-picker__button"
          onClick={() => setOpenPicker(openPicker === sectionKey ? null : sectionKey)}
        >
          <span>{selected ? `${selected.index + 1}. ${selected.question}` : label}</span>
          <ChevronDown size={16} />
        </button>
        {openPicker === sectionKey && (
          <div className="tool-3-question-picker__menu">
            {rows.map((row) => (
              <button
                key={row.index}
                type="button"
                className="tool-3-question-picker__option"
                onClick={() => selectDraftQuestion(sectionKey, row.index)}
              >
                <strong>{row.index + 1}.</strong>
                <span>{row.question}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div className="tool-page tool-3-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="tool-header">
        <button className="back-btn" onClick={() => navigate(`/sites/${siteId}`)}>
          <ArrowLeft size={18} />
          Back to Site
        </button>
        <div className="tool-title-group">
          <h1>Worksheet 3. Assessment of boundaries, buffer zones and the wider setting</h1>
          <p className="site-name-display">{site?.name}</p>
        </div>
      </div>

      <div className="excel-worksheet" style={{ borderColor: 'white' }}>
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
                <th colSpan="4">Worksheet 3. Assessment of boundaries, buffer zones and the wider setting</th>
              </tr>
              <tr className="sub-header-row">
                <th>Question</th>
                <th>Response/Explanation</th>
                <th>Recommendations</th>
                <th className="tool-3-actions-header"></th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <Fragment key={section.title}>
                  <tr className="tool-3-section-row">
                    <td colSpan="4">{section.title}</td>
                  </tr>
                  {section.title === 'World Heritage property' ? (
                    <>
                      {savedWorldRows.map((row) => (
                        <tr key={row.question} className="tool-3-question-row">
                          <td className="tool-3-question">
                            <strong>{row.index + 1}.</strong> {row.question}
                          </td>
                          <td>
                            <textarea
                              className="table-textarea"
                              value={row.response || ''}
                              disabled={editingIndex !== row.index}
                              onChange={(e) => handleRowChange(row.index, 'response', e.target.value)}
                            />
                          </td>
                          <td>
                            <textarea
                              className="table-textarea"
                              value={row.recommendations || ''}
                              disabled={editingIndex !== row.index}
                              onChange={(e) => handleRowChange(row.index, 'recommendations', e.target.value)}
                            />
                          </td>
                          <td className="tool-3-actions-cell">
                            {editingIndex === row.index ? (
                              <button
                                className="row-action-btn save"
                                onClick={() => saveWorldHeritageRow(row.index, formData.rows[row.index])}
                                disabled={saving}
                                title="Save row"
                              >
                                <Check size={18} />
                              </button>
                            ) : (
                              <button
                                className="row-action-btn edit"
                                onClick={() => setEditingIndex(row.index)}
                                title="Edit row"
                              >
                                <Pencil size={18} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}

                      {availableWorldRows.length > 0 && (
                        <tr className="tool-3-question-row">
                          <td className="tool-3-question">
                            {renderQuestionPicker('world', 'Select property question', availableWorldRows)}
                          </td>
                          <td>
                            <textarea
                              className="table-textarea"
                              value={draftRow.section === 'world' ? draftRow.response : ''}
                              onChange={(e) =>
                                setDraftRow((prev) => ({ ...prev, section: 'world', response: e.target.value }))
                              }
                            />
                          </td>
                          <td>
                            <textarea
                              className="table-textarea"
                              value={draftRow.section === 'world' ? draftRow.recommendations : ''}
                              onChange={(e) =>
                                setDraftRow((prev) => ({
                                  ...prev,
                                  section: 'world',
                                  recommendations: e.target.value,
                                }))
                              }
                            />
                          </td>
                          <td className="tool-3-actions-cell">
                            <button
                              className="row-action-btn save"
                              onClick={() =>
                                saveWorldHeritageRow(Number(draftRow.questionIndex), {
                                  response: draftRow.response,
                                  recommendations: draftRow.recommendations,
                                })
                              }
                              disabled={saving || draftRow.section !== 'world' || draftRow.questionIndex === ''}
                              title="Save row"
                            >
                              <Check size={18} />
                            </button>
                          </td>
                        </tr>
                      )}
                    </>
                  ) : section.title === 'Buffer zone (if applicable)' ? (
                    <>
                      {savedBufferRows.map((row) => (
                        <tr key={row.question} className="tool-3-question-row">
                          <td className="tool-3-question">
                            <strong>{row.index + 1}.</strong> {row.question}
                          </td>
                          <td>
                            <textarea
                              className="table-textarea"
                              value={row.response || ''}
                              disabled={editingIndex !== row.index}
                              onChange={(e) => handleRowChange(row.index, 'response', e.target.value)}
                            />
                          </td>
                          <td>
                            <textarea
                              className="table-textarea"
                              value={row.recommendations || ''}
                              disabled={editingIndex !== row.index}
                              onChange={(e) => handleRowChange(row.index, 'recommendations', e.target.value)}
                            />
                          </td>
                          <td className="tool-3-actions-cell">
                            {editingIndex === row.index ? (
                              <button
                                className="row-action-btn save"
                                onClick={() => saveWorldHeritageRow(row.index, formData.rows[row.index])}
                                disabled={saving}
                                title="Save row"
                              >
                                <Check size={18} />
                              </button>
                            ) : (
                              <button
                                className="row-action-btn edit"
                                onClick={() => setEditingIndex(row.index)}
                                title="Edit row"
                              >
                                <Pencil size={18} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}

                      {availableBufferRows.length > 0 && (
                        <tr className="tool-3-question-row">
                          <td className="tool-3-question">
                            {renderQuestionPicker('buffer', 'Select buffer zone question', availableBufferRows)}
                          </td>
                          <td>
                            <textarea
                              className="table-textarea"
                              value={draftRow.section === 'buffer' ? draftRow.response : ''}
                              onChange={(e) =>
                                setDraftRow((prev) => ({ ...prev, section: 'buffer', response: e.target.value }))
                              }
                            />
                          </td>
                          <td>
                            <textarea
                              className="table-textarea"
                              value={draftRow.section === 'buffer' ? draftRow.recommendations : ''}
                              onChange={(e) =>
                                setDraftRow((prev) => ({
                                  ...prev,
                                  section: 'buffer',
                                  recommendations: e.target.value,
                                }))
                              }
                            />
                          </td>
                          <td className="tool-3-actions-cell">
                            <button
                              className="row-action-btn save"
                              onClick={() =>
                                saveWorldHeritageRow(Number(draftRow.questionIndex), {
                                  response: draftRow.response,
                                  recommendations: draftRow.recommendations,
                                })
                              }
                              disabled={saving || draftRow.section !== 'buffer' || draftRow.questionIndex === ''}
                              title="Save row"
                            >
                              <Check size={18} />
                            </button>
                          </td>
                        </tr>
                      )}
                    </>
                  ) : section.title === 'Interactions with the wider setting' ? (
                    <>
                      {savedWiderRows.map((row) => (
                        <tr key={row.question} className="tool-3-question-row">
                          <td className="tool-3-question">
                            <strong>{row.index + 1}.</strong> {row.question}
                          </td>
                          <td>
                            <textarea
                              className="table-textarea"
                              value={row.response || ''}
                              disabled={editingIndex !== row.index}
                              onChange={(e) => handleRowChange(row.index, 'response', e.target.value)}
                            />
                          </td>
                          <td>
                            <textarea
                              className="table-textarea"
                              value={row.recommendations || ''}
                              disabled={editingIndex !== row.index}
                              onChange={(e) => handleRowChange(row.index, 'recommendations', e.target.value)}
                            />
                          </td>
                          <td className="tool-3-actions-cell">
                            {editingIndex === row.index ? (
                              <button
                                className="row-action-btn save"
                                onClick={() => saveWorldHeritageRow(row.index, formData.rows[row.index])}
                                disabled={saving}
                                title="Save row"
                              >
                                <Check size={18} />
                              </button>
                            ) : (
                              <button
                                className="row-action-btn edit"
                                onClick={() => setEditingIndex(row.index)}
                                title="Edit row"
                              >
                                <Pencil size={18} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}

                      {availableWiderRows.length > 0 && (
                        <tr className="tool-3-question-row">
                          <td className="tool-3-question">
                            {renderQuestionPicker('wider', 'Select wider setting question', availableWiderRows)}
                          </td>
                          <td>
                            <textarea
                              className="table-textarea"
                              value={draftRow.section === 'wider' ? draftRow.response : ''}
                              onChange={(e) =>
                                setDraftRow((prev) => ({ ...prev, section: 'wider', response: e.target.value }))
                              }
                            />
                          </td>
                          <td>
                            <textarea
                              className="table-textarea"
                              value={draftRow.section === 'wider' ? draftRow.recommendations : ''}
                              onChange={(e) =>
                                setDraftRow((prev) => ({
                                  ...prev,
                                  section: 'wider',
                                  recommendations: e.target.value,
                                }))
                              }
                            />
                          </td>
                          <td className="tool-3-actions-cell">
                            <button
                              className="row-action-btn save"
                              onClick={() =>
                                saveWorldHeritageRow(Number(draftRow.questionIndex), {
                                  response: draftRow.response,
                                  recommendations: draftRow.recommendations,
                                })
                              }
                              disabled={saving || draftRow.section !== 'wider' || draftRow.questionIndex === ''}
                              title="Save row"
                            >
                              <Check size={18} />
                            </button>
                          </td>
                        </tr>
                      )}
                    </>
                  ) : section.questions.map((question) => {
                    const currentIndex = rowIndex + bufferZoneCount;
                    rowIndex += 1;
                    const row = formData.rows[currentIndex] || {};
                    return (
                      <tr key={question} className="tool-3-question-row">
                        <td className="tool-3-question">
                          <strong>{currentIndex + 1}.</strong> {question}
                        </td>
                        <td>
                          <textarea
                            className="table-textarea"
                            value={row.response || ''}
                            onChange={(e) => handleRowChange(currentIndex, 'response', e.target.value)}
                          />
                        </td>
                        <td>
                          <textarea
                            className="table-textarea"
                            value={row.recommendations || ''}
                            onChange={(e) => handleRowChange(currentIndex, 'recommendations', e.target.value)}
                          />
                        </td>
                        <td className="tool-3-actions-cell"></td>
                      </tr>
                    );
                  })}
                </Fragment>
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
