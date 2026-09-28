import { apiClient } from './client';
import { Alert, Case, Customer, DashboardStats, Employee, Transaction, Investigation } from '../types';

export const login = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  const form = new URLSearchParams();
  form.append('username', username);
  form.append('password', password);

  const res = await client.post<LoginResponse>('/v1/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return res.data;
};

export const getDashboard = async (): Promise<DashboardStats> => {
  const response = await apiClient.get('/api/v1/dashboard/');
  return response.data;
};

export const getAlerts = async (): Promise<Alert[]> => {
  const response = await apiClient.get('/api/v1/alerts/');
  return response.data;
};

export const getAlert = async (id: string): Promise<Alert> => {
  const response = await apiClient.get(`/api/v1/alerts/${id}`);
  return response.data;
};

export const getCases = async (): Promise<Case[]> => {
  const response = await apiClient.get('/api/v1/cases/');
  return response.data;
};

export const updateCaseStatus = async (id: string, status: string): Promise<Case> => {
  const response = await apiClient.patch(`/api/v1/cases/${id}`, { status });
  return response.data;
};

export const getEmployees = async (): Promise<Employee[]> => {
  const response = await apiClient.get('/api/v1/employees/');
  return response.data;
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const response = await apiClient.get('/api/v1/transactions/');
  return response.data;
};

export const getCustomers = async (): Promise<Customer[]> => {
  const response = await apiClient.get('/api/v1/customers/');
  return response.data;
};

export const getInvestigations = async (): Promise<Investigation[]> => {
  const response = await apiClient.get('/api/v1/investigations/');
  return response.data;
};