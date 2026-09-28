import { apiClient } from './client';
import type {
  Alert,
  Case,
  Customer,
  DashboardStats,
  Employee,
  Transaction,
  Investigation,
} from '../types';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

/* ── Auth ── */
export const login = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  const form = new URLSearchParams();
  form.append('username', username);
  form.append('password', password);

  const res = await apiClient.post<LoginResponse>('/api/v1/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return res.data;
};

/* ── Dashboard ── */
export const getDashboard = async (): Promise<DashboardStats> => {
  const res = await apiClient.get<DashboardStats>('/api/v1/dashboard/');
  return res.data;
};

/* ── Alerts ── */
export const getAlerts = async (): Promise<Alert[]> => {
  const res = await apiClient.get<Alert[]>('/api/v1/alerts/');
  return res.data;
};

export const getAlert = async (id: string | number): Promise<Alert> => {
  const res = await apiClient.get<Alert>(`/api/v1/alerts/${id}`);
  return res.data;
};

/* ── Cases ── */
export const getCases = async (): Promise<Case[]> => {
  const res = await apiClient.get<Case[]>('/api/v1/cases/');
  return res.data;
};

export const updateCase = async (
  id: string | number,
  data: Partial<Pick<Case, 'status' | 'assigned_to'>>,
): Promise<Case> => {
  const res = await apiClient.patch<Case>(`/api/v1/cases/${id}`, data);
  return res.data;
};

/* ── Employees ── */
export const getEmployees = async (): Promise<Employee[]> => {
  const res = await apiClient.get<Employee[]>('/api/v1/employees/');
  return res.data;
};

/* ── Customers ── */
export const getCustomers = async (): Promise<Customer[]> => {
  const res = await apiClient.get<Customer[]>('/api/v1/customers/');
  return res.data;
};

/* ── Transactions ── */
export const getTransactions = async (): Promise<Transaction[]> => {
  const res = await apiClient.get<Transaction[]>('/api/v1/transactions/');
  return res.data;
};

/* ── Investigations ── */
export const getInvestigations = async (): Promise<Investigation[]> => {
  const res = await apiClient.get<Investigation[]>('/api/v1/investigations/');
  return res.data;
};

export const updateCaseStatus = updateCase;