import api from './api';

export const getPrograms = () => {
  return api.get('/programs/');
};

export const getProgram = (id) => {
  return api.get(`/programs/${id}/`);
};

export const createProgram = (programData) => {
  return api.post('/programs/', programData);
};

export const updateProgram = (id, programData) => {
  return api.put(`/programs/${id}/`, programData);
};

export const deleteProgram = (id) => {
  return api.delete(`/programs/${id}/`);
};
