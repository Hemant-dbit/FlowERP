import { create } from 'zustand'

import {
  addProjectMemberApi,
  createProjectApi,
  deleteProjectApi,
  getMyProjectsApi,
  getProjectDetailApi,
  getProjectsApi,
  removeProjectMemberApi,
  updateProjectApi,
} from '../api/projectsApi'

const initialState = {
  loading: false,
  saving: false,
  projects: [],
  selectedProject: null,
  error: null,
}

function getErrorMessage(error, fallback) {
  const data = error?.response?.data

  if (typeof data?.detail === 'string') {
    return data.detail
  }

  if (typeof data === 'string') {
    return data
  }

  if (data && typeof data === 'object') {
    const firstKey = Object.keys(data)[0]
    const firstValue = data[firstKey]

    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return `${firstKey}: ${firstValue[0]}`
    }

    if (typeof firstValue === 'string') {
      return `${firstKey}: ${firstValue}`
    }
  }

  return error?.message || fallback
}

const useProjectsStore = create((set, get) => ({
  ...initialState,

  clearError: () => set({ error: null }),

  clearSelectedProject: () => set({ selectedProject: null }),

  fetchProjects: async ({ mine = false } = {}) => {
    set({ loading: true, error: null })
    try {
      const projects = mine ? await getMyProjectsApi() : await getProjectsApi()
      set({ loading: false, projects: Array.isArray(projects) ? projects : [] })
    } catch (error) {
      set({
        loading: false,
        projects: [],
        error: getErrorMessage(error, 'Failed to load projects'),
      })
    }
  },

  fetchProjectDetail: async (projectId) => {
    set({ loading: true, error: null })
    try {
      const project = await getProjectDetailApi(projectId)
      set({ loading: false, selectedProject: project })
    } catch (error) {
      set({
        loading: false,
        selectedProject: null,
        error: getErrorMessage(error, 'Failed to load project detail'),
      })
    }
  },

  createProject: async (payload) => {
    set({ saving: true, error: null })
    try {
      const project = await createProjectApi(payload)
      set((state) => ({
        saving: false,
        projects: [project, ...state.projects],
      }))
      return { ok: true, data: project }
    } catch (error) {
      set({
        saving: false,
        error: getErrorMessage(error, 'Failed to create project'),
      })
      return { ok: false, error }
    }
  },

  updateProject: async (projectId, payload) => {
    set({ saving: true, error: null })
    try {
      const updated = await updateProjectApi(projectId, payload)
      set((state) => ({
        saving: false,
        projects: state.projects.map((project) =>
          project.id === updated.id ? { ...project, ...updated } : project
        ),
        selectedProject:
          state.selectedProject?.id === updated.id
            ? { ...state.selectedProject, ...updated }
            : state.selectedProject,
      }))
      return { ok: true, data: updated }
    } catch (error) {
      set({
        saving: false,
        error: getErrorMessage(error, 'Failed to update project'),
      })
      return { ok: false, error }
    }
  },

  deleteProject: async (projectId) => {
    set({ saving: true, error: null })
    try {
      await deleteProjectApi(projectId)
      set((state) => ({
        saving: false,
        projects: state.projects.filter((project) => project.id !== projectId),
        selectedProject: state.selectedProject?.id === projectId ? null : state.selectedProject,
      }))
      return { ok: true }
    } catch (error) {
      set({
        saving: false,
        error: getErrorMessage(error, 'Failed to delete project'),
      })
      return { ok: false, error }
    }
  },

  addMember: async (projectId, userId) => {
    set({ saving: true, error: null })
    try {
      await addProjectMemberApi(projectId, userId)
      await get().fetchProjectDetail(projectId)
      set({ saving: false })
      return { ok: true }
    } catch (error) {
      set({
        saving: false,
        error: getErrorMessage(error, 'Failed to add project member'),
      })
      return { ok: false, error }
    }
  },

  removeMember: async (projectId, userId) => {
    set({ saving: true, error: null })
    try {
      await removeProjectMemberApi(projectId, userId)
      await get().fetchProjectDetail(projectId)
      set({ saving: false })
      return { ok: true }
    } catch (error) {
      set({
        saving: false,
        error: getErrorMessage(error, 'Failed to remove project member'),
      })
      return { ok: false, error }
    }
  },
}))

export default useProjectsStore
