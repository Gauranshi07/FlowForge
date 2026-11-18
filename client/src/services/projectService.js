import { api } from "./api.js";

export const getProjects = async () => {
  const response = await api.get("/projects");
  return response.data.data.projects;
};

export const getProject = async (id) => {
  const response = await api.get(`/projects/${encodeURIComponent(id)}`);
  return response.data.data.project;
};

export const createProject = async (project) => {
  const response = await api.post("/projects", project);
  return response.data.data.project;
};

export const updateProject = async (id, project) => {
  const response = await api.put(
    `/projects/${encodeURIComponent(id)}`,
    project,
  );
  return response.data.data.project;
};

export const deleteProject = async (id) => {
  const response = await api.delete(`/projects/${encodeURIComponent(id)}`);
  return response.data;
};
