SELECT id, full_name, bio FROM profiles WHERE id IN (
  SELECT user_id FROM coach_profiles WHERE id IN ('0a1479fc-328c-45d5-af87-ea5425bcef3f', 'f9b2eead-2933-40f3-b8e9-04abed1c5a19', 'ed631dbe-5602-4827-b5c9-4ebd3e72206d')
);
