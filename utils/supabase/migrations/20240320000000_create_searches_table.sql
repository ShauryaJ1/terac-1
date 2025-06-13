-- Create searches table
CREATE TABLE IF NOT EXISTS searches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    search_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS searches_user_id_idx ON searches(user_id);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS searches_created_at_idx ON searches(created_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their own searches
CREATE POLICY "Users can view their own searches"
    ON searches
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own searches
CREATE POLICY "Users can insert their own searches"
    ON searches
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own searches
CREATE POLICY "Users can update their own searches"
    ON searches
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own searches
CREATE POLICY "Users can delete their own searches"
    ON searches
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_searches_updated_at
    BEFORE UPDATE ON searches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 