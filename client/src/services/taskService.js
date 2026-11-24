import { api } from "./api.js";

export const getTasks = async (filters = {}) => {
  const response = await api.get("/tasks", { params: filters });
  return response.data.data.tasks;
};

export const getTask = async (id) => {
  const response = await api.get(`/tasks/${encodeURIComponent(id)}`);
  return response.data.data.task;
};

export const createTask = async (task) => {
  const response = await api.post("/tasks", task);
  return response.data.data.task;
};

export const updateTask = async (id, task) => {
  const response = await api.put(
    `/tasks/${encodeURIComponent(id)}`,
    task,
  );
  return response.data.data.task;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${encodeURIComponent(id)}`);
  return response.data;
};
