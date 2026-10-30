/*
# Create donor profiles with automatic creation on sign-up

1. New Tables
- `profiles`: one row per donor, linked to their sign-in account.
  - `id` (uuid, primary key, same as the account id)
  - `full_name`, `blood_group`, `phone`, `city`
  - `is_available` (whether the donor appears in searches)
  - `created_at`

2. Functions and Triggers
- `handle_new_user()` copies the sign-up details into `profiles` whenever a new account is created.
- Trigger `on_auth_user_created` runs that function after each account insert.

3. Security
- Row Level Security enabled on `profiles`.
- Signed-in users can read only their own profile. Other donors' phone numbers are never exposed here.
- The sign-up function is not callable by users directly.

4. Important Notes
- Blood group values are restricted to the eight valid groups.
- Phone numbers must be 7 to 15 digits, optionally starting with a plus sign.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 80),
  blood_group text NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  phone text NOT NULL CHECK (phone ~ '^[+]?[0-9 -]{7,15}$'),
  city text NOT NULL CHECK (char_length(btrim(city)) BETWEEN 2 AND 80),
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, blood_group, phone, city)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'blood_group',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'city'
  );
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
