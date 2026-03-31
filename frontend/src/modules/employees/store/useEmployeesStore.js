import { create } from 'zustand';

import {
  createEmployeeApi,
  deleteEmployeeApi,
  getEmployeeDetailApi,
  getEmployeesApi,
  getMyEmployeeProfileApi,
  updateEmployeeApi,
} from '../api/employeesApi';

const initialState = {
  loading: false,
  saving: false,
  employees: [],
  selectedEmployee: null,
  myProfile: null,
  error: null,
};

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;

  if (typeof data?.detail === 'string') return data.detail;
  if (typeof data?.error === 'string') return data.error;
  if (typeof data === 'string') return data;

  if (data && typeof data === 'object') {
    const firstKey = Object.keys(data)[0];
    const firstValue = data[firstKey];
    if (Array.isArray(firstValue) && firstValue.length > 0) return `${firstKey}: ${firstValue[0]}`;
    if (typeof firstValue === 'string') return `${firstKey}: ${firstValue}`;
  }

  return error?.message || fallback;
}

function normalizeCollection(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

const useEmployeesStore = create((set, get) => ({
  ...initialState,

  clearError: () => set({ error: null }),
  clearSelectedEmployee: () => set({ selectedEmployee: null }),

  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getEmployeesApi();
      set({ loading: false, employees: normalizeCollection(response) });
    } catch (error) {
      set({
        loading: false,
        employees: [],
        error: getErrorMessage(error, 'Failed to load employees'),
      });
    }
  },

  fetchEmployeeDetail: async (employeeId) => {
    set({ loading: true, error: null });
    try {
      const employee = await getEmployeeDetailApi(employeeId);
      set({ loading: false, selectedEmployee: employee });
      return { ok: true, data: employee };
    } catch (error) {
      set({
        loading: false,
        selectedEmployee: null,
        error: getErrorMessage(error, 'Failed to load employee detail'),
      });
      return { ok: false, error };
    }
  },

  fetchMyProfile: async () => {
    try {
      const profile = await getMyEmployeeProfileApi();
      set({ myProfile: profile });
      return { ok: true, data: profile };
    } catch (error) {
      if (error?.response?.status === 404) {
        set({ myProfile: null });
        return { ok: false, notFound: true };
      }

      set({ myProfile: null, error: getErrorMessage(error, 'Failed to load your profile') });
      return { ok: false, error };
    }
  },

  createEmployee: async (payload) => {
    set({ saving: true, error: null });
    try {
      const created = await createEmployeeApi(payload);
      set((state) => ({ saving: false, employees: [created, ...state.employees] }));
      await get().fetchEmployees();
      return { ok: true, data: created };
    } catch (error) {
      set({ saving: false, error: getErrorMessage(error, 'Failed to create employee') });
      return { ok: false, error };
    }
  },

  updateEmployee: async (employeeId, payload) => {
    set({ saving: true, error: null });
    try {
      const updated = await updateEmployeeApi(employeeId, payload);
      set((state) => ({
        saving: false,
        employees: state.employees.map((employee) =>
          employee.id === updated.id ? { ...employee, ...updated } : employee
        ),
        selectedEmployee:
          state.selectedEmployee?.id === updated.id
            ? { ...state.selectedEmployee, ...updated }
            : state.selectedEmployee,
      }));
      await get().fetchEmployees();
      return { ok: true, data: updated };
    } catch (error) {
      set({ saving: false, error: getErrorMessage(error, 'Failed to update employee') });
      return { ok: false, error };
    }
  },

  deleteEmployee: async (employeeId) => {
    set({ saving: true, error: null });
    try {
      await deleteEmployeeApi(employeeId);
      set((state) => ({
        saving: false,
        employees: state.employees.filter((employee) => employee.id !== employeeId),
        selectedEmployee: state.selectedEmployee?.id === employeeId ? null : state.selectedEmployee,
      }));
      return { ok: true };
    } catch (error) {
      set({ saving: false, error: getErrorMessage(error, 'Failed to delete employee') });
      return { ok: false, error };
    }
  },
}));

export default useEmployeesStore;
