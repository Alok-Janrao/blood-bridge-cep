/*
# Create blood requests table and donor directory function

1. New Tables
- `blood_requests`: a request for blood posted by a signed-in user.
  - `id`, `requester_id` (defaults to the signed-in user), `patient_name`, `blood_group`, `units` (1 to 10)
  - `hospital`, `contact`, `urgency` (Normal, Urgent, or Critical), `notes`, `created_at`

2. New Functions
- `list_available_donors()` returns the public details of donors who are available, excluding the caller.
  - It returns id, name, blood group, city, and the date of the most recent donation.
  - Phone numbers and other private details are never returned.
  - Only signed-in users can call it.

3. Security
- Row Level Security enabled on `blood_requests`.
- Users can read and create only their own requests.
- The donor directory function is revoked from anonymous visitors and granted to signed-in users only.

4. Important Notes
- Requests cannot be edited or deleted from the app yet.
*/

CREATE TABLE IF NOT EXISTS blood_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  patient_name text NOT NULL CHECK (char_length(btrim(patient_name)) BETWEEN 2 AND 80),
  blood_group text NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  units integer NOT NULL CHECK (units BETWEEN 1 AND 10),
  hospital text NOT NULL CHECK (char_length(btrim(hospital)) BETWEEN 2 AND 120),
  contact text NOT NULL CHECK (contact ~ '^[+]?[0-9 -]{7,15}$'),
  urgency text NOT NULL CHECK (urgency IN ('Normal', 'Urgent', 'Critical')),
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blood_requests_requester_id_created_at_idx ON blood_requests (requester_id, created_at DESC);

ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON blood_requests TO authenticated;

DROP POLICY IF EXISTS "select_own_blood_requests" ON blood_requests;
CREATE POLICY "select_own_blood_requests" ON blood_requests FOR SELECT
TO authenticated USING (auth.uid() = requester_id);

DROP POLICY IF EXISTS "insert_own_blood_requests" ON blood_requests;
CREATE POLICY "insert_own_blood_requests" ON blood_requests FOR INSERT
TO authenticated WITH CHECK (auth.uid() = requester_id);

CREATE OR REPLACE FUNCTION public.list_available_donors()
RETURNS TABLE (
  donor_id uuid,
  donor_name text,
  blood_group text,
  city text,
  last_donated_on date
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.full_name,
    p.blood_group,
    p.city,
    (SELECT max(d.donated_on) FROM public.donations d WHERE d.donor_id = p.id)
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND p.is_available
    AND p.id <> auth.uid()
  ORDER BY p.full_name;
$$;

REVOKE EXECUTE ON FUNCTION public.list_available_donors() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_available_donors() TO authenticated;
