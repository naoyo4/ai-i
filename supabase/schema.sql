-- Create the interviews table
CREATE TABLE public.interviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    topic_id TEXT NOT NULL,
    messages JSONB DEFAULT '[]'::JSONB,
    report JSONB DEFAULT NULL,
    status TEXT DEFAULT 'started'
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone (anon) to insert and read their own interviews
-- ideally this would use session auth, but for MVP anon users with public access is easiest for demo
-- Warning: This allows public read access to all interviews for the purpose of the demo.
-- In production, you would check `auth.uid() = user_id`.
CREATE POLICY "Enable all access for all users" ON "public"."interviews"
AS PERMISSIVE FOR ALL
TO public
USING (true)
WITH CHECK (true);
