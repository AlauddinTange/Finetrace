export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'NEW' | 'INVESTIGATING' | 'ESCALATED' | 'CLOSED' | 'FALSE_POSITIVE';
export type CaseStatus = 'NEW' | 'INVESTIGATING' | 'ESCALATED' | 'CLOSED' | 'FALSE_POSITIVE';

export interface Alert {
  id: number;
  alert_code: string;
  alert_type: string;
  severity: Severity;
  risk_score: number;
  risk_level: string;
  title: string;
  summary: string;
  counterfactual?: string;
  evidence_ids?: string;
  signal_count?: number;
  signals?: string[];
  status: AlertStatus;
  primary_transaction_id: string | null;
  primary_employee_id: string | null;
  primary_customer_id: string | null;
  created_at: string;
  llm_explanation?: string;
}

export interface Case {
  id: string;
  case_id: string;
  employee_id: string;
  employee_name?: string;
  risk_score: number;
  risk_level: string;
  evidence_count: number;
  assigned_to: string;
  status: CaseStatus;
  created_at: string;
}

export interface DashboardStats {
  total_alerts: number;
  high_risk_alerts: number;
  active_cases: number;
  employees_flagged: number;
  alerts_trend?: { date: string; count: number }[];
  severity_breakdown?: { severity: string; count: number }[];
  top_employees?: { name: string; count: number }[];
}

export interface Employee {
  id: string;
  employee_id: string;
  name: string;
  department: string;
  risk_score: number;
}

export interface Customer {
  id: string;
  customer_id: string;
  name: string;
  risk_score: number;
}

export interface Transaction {
  id: string;
  transaction_id: string;
  timestamp: string;
  sender_account: string;
  receiver_account: string;
  amount: number;
  transaction_type: string;
  channel: string;
  status: string;
}

export interface Investigation {
  id: string;
  investigation_id: string;
  title: string;
  status: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}