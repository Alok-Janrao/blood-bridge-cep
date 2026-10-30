import { supabase } from '@/lib/supabase';
import type { Donation } from '@/types';

interface DonationRow {
  id: string;
  donated_on: string;
  lives_helped: number;
}

export async function listDonations(): Promise<Donation[]> {
  const { data, error } = await supabase
    .from('donations')
    .select('id, donated_on, lives_helped')
    .order('donated_on', { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as DonationRow[]).map((row) => ({
    id: row.id,
    donatedOn: row.donated_on,
    livesHelped: row.lives_helped,
  }));
}

export async function addDonation(donatedOn: string): Promise<void> {
  const { error } = await supabase.from('donations').insert({ donated_on: donatedOn });

  if (error) throw new Error(error.message);
}
