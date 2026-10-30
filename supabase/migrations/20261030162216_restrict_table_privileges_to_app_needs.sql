/*
# Restrict table privileges to what the app uses

1. What Changed
- Removed all default privileges from the public and signed-in roles on `profiles`, `donations`, and `blood_requests`.
- Re-granted only the operations the app performs.

2. Resulting Access
- `profiles`: signed-in users can read (their own row is enforced by policy).
- `donations`: signed-in users can read and add (own rows only, enforced by policy).
- `blood_requests`: signed-in users can read and add (own rows only, enforced by policy).
- Anonymous visitors have no access to any of these tables.

3. Important Notes
- Updating and deleting rows is not allowed from the app. This is intentional until those features are built.
*/

REVOKE ALL ON profiles, donations, blood_requests FROM anon, authenticated;

GRANT SELECT ON profiles TO authenticated;
GRANT SELECT, INSERT ON donations TO authenticated;
GRANT SELECT, INSERT ON blood_requests TO authenticated;
