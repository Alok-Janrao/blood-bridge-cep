import { supabase } from '@/lib/supabase';
import type { BloodRequest, NewBloodRequest, Urgency, BloodGroup } from '@/types';

interface BloodRequestRow {
  id: string;
  patient_name: string;
  blood_group: BloodGroup;
  units: number;
  hospital: string;
  contact: string;
  urgency: Urgency;
  notes: string;
  created_at: string;
}

const RECENT_REQUEST_LIMIT = 20;

export async function listMyBloodRequests(): Promise<BloodRequest[]> {
  const { data, error } = await supabase
    .from('blood_requests')
    .select('id, patient_name, blood_group, units, hospital, contact, urgency, notes, created_at')
    .order('created_at', { ascending: false })
    .limit(RECENT_REQUEST_LIMIT);

  if (error) throw new Error(error.message);

  return ((data ?? []) as BloodRequestRow[]).map((row) => ({
    id: row.id,
    patientName: row.patient_name,
    bloodGroup: row.blood_group,
    units: row.units,
    hospital: row.hospital,
    contact: row.contact,
    urgency: row.urgency,
    notes: row.notes,
    createdAt: row.created_at,
  }));
}

export async function createBloodRequest(request: NewBloodRequest): Promise<void> {
  const { error } = await supabase.from('blood_requests').insert({
    patient_name: request.patientName,
    blood_group: request.bloodGroup,
    units: request.units,
    hospital: request.hospital,
    contact: request.contact,
    urgency: request.urgency,
    notes: request.notes,
  });

  if (error) throw new Error(error.message);
}
