-- Quiz Application Database Schema for Supabase
-- Run these queries in your Supabase SQL Editor

-- 1. Create categories table (prefixed)
CREATE TABLE IF NOT EXISTS quiz_categories (
    id VARCHAR(50) PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10), -- emoji icons
    color VARCHAR(50), -- tailwind gradient classes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create questions table (prefixed)
CREATE TABLE IF NOT EXISTS quiz_questions (
    id VARCHAR(50) PRIMARY KEY,
    category_id VARCHAR(50) REFERENCES quiz_categories(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    difficulty INTEGER DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 5),
    rubric_json JSONB,
    type VARCHAR(20) DEFAULT 'open-ended' CHECK (type IN ('open-ended', 'multiple-choice')),
    language VARCHAR(5) DEFAULT 'en',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create sessions table (prefixed)
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id VARCHAR(50) PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    fingerprint_hash VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create attempts table (prefixed)
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(50) REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_id VARCHAR(50) REFERENCES quiz_questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    score_ai INTEGER CHECK (score_ai >= 0 AND score_ai <= 100),
    score_rule INTEGER CHECK (score_rule >= 0 AND score_rule <= 100),
    score_final INTEGER NOT NULL CHECK (score_final >= 0 AND score_final <= 100),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_category_active ON quiz_questions(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_language ON quiz_questions(language);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_fingerprint ON quiz_sessions(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_session ON quiz_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_question ON quiz_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_score ON quiz_attempts(score_final DESC);

-- 6. Create materialized views for leaderboards (prefixed)
CREATE MATERIALIZED VIEW IF NOT EXISTS quiz_leaderboard_global AS
SELECT 
    s.id as session_id,
    s.display_name,
    AVG(a.score_final)::INTEGER as avg_score,
    MAX(a.score_final) as best_score,
    COUNT(a.id) as total_attempts,
    MIN(a.created_at) as first_attempt,
    MAX(a.created_at) as last_attempt
FROM quiz_attempts a
JOIN quiz_sessions s ON a.session_id = s.id
GROUP BY s.id, s.display_name
ORDER BY best_score DESC, first_attempt ASC;

CREATE MATERIALIZED VIEW IF NOT EXISTS quiz_leaderboard_category AS
SELECT 
    q.category_id,
    s.id as session_id,
    s.display_name,
    AVG(a.score_final)::INTEGER as avg_score,
    MAX(a.score_final) as best_score,
    COUNT(a.id) as total_attempts,
    MIN(a.created_at) as first_attempt,
    MAX(a.created_at) as last_attempt
FROM quiz_attempts a
JOIN quiz_questions q ON a.question_id = q.id
JOIN quiz_sessions s ON a.session_id = s.id
GROUP BY q.category_id, s.id, s.display_name
ORDER BY q.category_id, best_score DESC, first_attempt ASC;

-- 7. Create indexes on materialized views
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_leaderboard_global_session ON quiz_leaderboard_global(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_leaderboard_global_score ON quiz_leaderboard_global(best_score DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_leaderboard_category_session ON quiz_leaderboard_category(category_id, session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_leaderboard_category_score ON quiz_leaderboard_category(category_id, best_score DESC);

CREATE OR REPLACE FUNCTION refresh_leaderboards()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY quiz_leaderboard_global;
    REFRESH MATERIALIZED VIEW CONCURRENTLY quiz_leaderboard_category;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger to auto-refresh leaderboards
CREATE OR REPLACE FUNCTION trigger_refresh_leaderboards()
RETURNS trigger AS $$
BEGIN
    -- Refresh materialized views after insert/update/delete
    PERFORM refresh_leaderboards();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop if exists first)
DROP TRIGGER IF EXISTS refresh_leaderboards_trigger ON quiz_attempts;
CREATE TRIGGER refresh_leaderboards_trigger
    AFTER INSERT OR UPDATE OR DELETE ON quiz_attempts
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_refresh_leaderboards();

-- 10. Enable Row Level Security
ALTER TABLE quiz_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Categories: public read access for active categories
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON quiz_categories;
CREATE POLICY "Categories are viewable by everyone" 
    ON quiz_categories FOR SELECT 
    USING (is_active = true);

-- Questions: public read access for active questions
DROP POLICY IF EXISTS "Questions are viewable by everyone" ON quiz_questions;
CREATE POLICY "Questions are viewable by everyone" 
    ON quiz_questions FOR SELECT 
    USING (is_active = true);

-- Sessions: anyone can create and read sessions
DROP POLICY IF EXISTS "Users can create sessions" ON quiz_sessions;
CREATE POLICY "Users can create sessions" 
    ON quiz_sessions FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read all sessions" ON quiz_sessions;
CREATE POLICY "Users can read all sessions" 
    ON quiz_sessions FOR SELECT 
    USING (true);

-- Attempts: anyone can create and read attempts
DROP POLICY IF EXISTS "Users can create attempts" ON quiz_attempts;
CREATE POLICY "Users can create attempts" 
    ON quiz_attempts FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read all attempts" ON quiz_attempts;
CREATE POLICY "Users can read all attempts" 
    ON quiz_attempts FOR SELECT 
    USING (true);

-- 12. Insert initial data
INSERT INTO quiz_categories (id, slug, name, icon, color, is_active) VALUES
('tech', 'tech', 'Tech', '🤖', 'from-blue-500 to-cyan-500', true),
('career', 'career', 'Career', '🚀', 'from-purple-500 to-pink-500', true),
('fun', 'fun', 'Fun', '🎭', 'from-green-500 to-emerald-500', true)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    is_active = EXCLUDED.is_active;

-- Insert sample questions
INSERT INTO quiz_questions (id, category_id, prompt, difficulty, type, is_active) VALUES
-- Tech questions
('tech-1', 'tech', 'Explain the concept of a virtual machine and how it differs from a container.', 3, 'open-ended', true),
('tech-2', 'tech', 'What are the key principles of RESTful API design?', 3, 'open-ended', true),
('tech-3', 'tech', 'Describe the difference between SQL and NoSQL databases.', 2, 'open-ended', true),
('tech-4', 'tech', 'What is the purpose of version control systems like Git?', 2, 'open-ended', true),
('tech-5', 'tech', 'Explain the concept of microservices architecture.', 4, 'open-ended', true),

-- Career questions
('career-1', 'career', 'How do you prioritize tasks when you have multiple deadlines approaching?', 2, 'open-ended', true),
('career-2', 'career', 'Describe a time when you had to learn a new skill quickly for a project.', 3, 'open-ended', true),
('career-3', 'career', 'What are your strategies for staying updated with industry trends?', 2, 'open-ended', true),
('career-4', 'career', 'How do you handle constructive criticism from colleagues or supervisors?', 2, 'open-ended', true),
('career-5', 'career', 'Describe your approach to mentoring junior team members.', 4, 'open-ended', true),

-- Fun questions
('fun-1', 'fun', 'If you could have dinner with any historical figure, who would it be and why?', 1, 'open-ended', true),
('fun-2', 'fun', 'What would be your superpower of choice and how would you use it?', 1, 'open-ended', true),
('fun-3', 'fun', 'Describe your perfect weekend in three sentences.', 1, 'open-ended', true),
('fun-4', 'fun', 'If you could live in any fictional universe, which would you choose?', 1, 'open-ended', true),
('fun-5', 'fun', 'What is the most interesting fact you know?', 1, 'open-ended', true)
ON CONFLICT (id) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    prompt = EXCLUDED.prompt,
    difficulty = EXCLUDED.difficulty,
    type = EXCLUDED.type,
    is_active = EXCLUDED.is_active;

-- 13. Refresh the materialized views initially
SELECT refresh_leaderboards();

-- Database setup complete!
-- Don't forget to set up your environment variables in .env.local
