export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const URGENCY_LEVELS = ['Normal', 'Urgent', 'Critical'] as const;

export type Urgency = (typeof URGENCY_LEVELS)[number];

export type Page = 'landing' | 'login' | 'signup' | 'dashboard' | 'find' | 'request';

export interface Profile {
  id: string;
  fullName: string;
  bloodGroup: BloodGroup;
  phone: string;
  city: string;
  isAvailable: boolean;
}

export interface Donor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  city: string;
  lastDonatedOn: string | null;
}

export interface Donation {
  id: string;
  donatedOn: string;
  livesHelped: number;
}

export interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  units: number;
  hospital: string;
  contact: string;
  urgency: Urgency;
  notes: string;
  createdAt: string;
}

export interface SignUpInput {
  fullName: string;
  bloodGroup: BloodGroup;
  phone: string;
  city: string;
  email: string;
  password: string;
}

export type NewBloodRequest = Omit<BloodRequest, 'id' | 'createdAt'>;
