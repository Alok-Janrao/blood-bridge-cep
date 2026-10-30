import { supabase } from '@/lib/supabase';
import type { BloodGroup, Donor } from '@/types';

interface DonorRow {
  donor_id: string;
  donor_name: string;
  blood_group: BloodGroup;
  city: string;
  last_donated_on: string | null;
}

export async function listAvailableDonors(): Promise<Donor[]> {
  const { data, error } = await supabase.rpc('list_available_donors');

  if (error) throw new Error(error.message);

  return ((data ?? []) as DonorRow[]).map((row) => ({
    id: row.donor_id,
    name: row.donor_name,
    bloodGroup: row.blood_group,
    city: row.city,
    lastDonatedOn: row.last_donated_on,
  }));
}
