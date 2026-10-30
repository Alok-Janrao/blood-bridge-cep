/*
# Create donation history table

1. New Tables
- `donations`: one row for each blood donation a donor has made.
  - `id` (uuid, primary key)
  - `donor_id` (references the donor's profile, defaults to the signed-in user)
  - `donated_on` (date of the donation)
  - `lives_helped` (estimated lives helped by this donation, default 3)
  - `created_at`

2. Security
- Row Level Security enabled on `donations`.
- Donors can read and add only their own donations.
- Updating or deleting donations is not permitted from the app.

3. Important Notes
- Dates in the future are rejected in the app's form before saving.
*/

CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  donated_on date NOT NULL,
  lives_helped integer NOT NULL DEFAULT 3 CHECK (lives_helped BETWEEN 1 AND 3),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS donations_donor_id_donated_on_idx ON donations (donor_id, donated_on DESC);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON donations TO authenticated;

DROP POLICY IF EXISTS "select_own_donations" ON donations;
CREATE POLICY "select_own_donations" ON donations FOR SELECT
TO authenticated USING (auth.uid() = donor_id);

DROP POLICY IF EXISTS "insert_own_donations" ON donations;
CREATE POLICY "insert_own_donations" ON donations FOR INSERT
TO authenticated WITH CHECK (auth.uid() = donor_id);
