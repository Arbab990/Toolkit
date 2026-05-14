import api from './authService';

export const createSite = async (formData) => {
  const { data } = await api.post('/sites', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const getSites = async () => {
  const { data } = await api.get('/sites');
  return data;
};

export const getSite = async (id) => {
  const { data } = await api.get(`/sites/${id}`);
  return data;
};

export const deleteSite = async (id) => {
  const { data } = await api.delete(`/sites/${id}`);
  return data;
};
