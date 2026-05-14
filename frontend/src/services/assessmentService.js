import api from './authService';

export const saveAssessment = async (assessmentData) => {
  const { data } = await api.post('/assessments', assessmentData);
  return data;
};

export const getAssessment = async (siteId, toolNumber) => {
  const { data } = await api.get(`/assessments/${siteId}/${toolNumber}`);
  return data;
};
