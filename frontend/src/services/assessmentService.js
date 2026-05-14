import api from './authService';

const IS_BYPASS = import.meta.env.VITE_AUTH_BYPASS === 'true';

const getLocalAssessments = () => {
  const data = localStorage.getItem('mock_assessments');
  return data ? JSON.parse(data) : [];
};

const saveLocalAssessments = (data) => {
  localStorage.setItem('mock_assessments', JSON.stringify(data));
};

export const saveAssessment = async (assessmentData) => {
  if (IS_BYPASS) {
    const assessments = getLocalAssessments();
    const index = assessments.findIndex(a => a.siteId === assessmentData.siteId && a.toolNumber === assessmentData.toolNumber);
    
    if (index !== -1) {
      assessments[index] = assessmentData;
    } else {
      assessments.push(assessmentData);
    }
    
    saveLocalAssessments(assessments);

    // Update mock site progress for realism
    const sitesStr = localStorage.getItem('mock_sites');
    if (sitesStr) {
      const sites = JSON.parse(sitesStr);
      const siteIdx = sites.findIndex(s => s._id === assessmentData.siteId);
      if (siteIdx !== -1) {
        const siteAssessments = assessments.filter(a => a.siteId === assessmentData.siteId);
        const uniqueTools = [...new Set(siteAssessments.map(a => a.toolNumber))].length;
        sites[siteIdx].progress = Number(((uniqueTools / 12) * 100).toFixed(2));
        const today = new Date();
        sites[siteIdx].lastAssessment = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
        localStorage.setItem('mock_sites', JSON.stringify(sites));
      }
    }

    return { success: true, data: assessmentData };
  }

  const { data } = await api.post('/assessments', assessmentData);
  return data;
};

export const getAssessment = async (siteId, toolNumber) => {
  if (IS_BYPASS) {
    const assessments = getLocalAssessments();
    const assessment = assessments.find(a => a.siteId === siteId && a.toolNumber === toolNumber);
    return { 
      success: true, 
      data: assessment ? assessment.data : null,
      isCompleted: assessment ? assessment.isCompleted : false,
      rating: assessment ? assessment.rating : null
    };
  }

  const { data } = await api.get(`/assessments/${siteId}/${toolNumber}`);
  return data;
};
