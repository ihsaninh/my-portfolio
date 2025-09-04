-- Update database schema to support multilingual questions
-- Run this in your Supabase SQL Editor

-- 1. Add language column to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'en';

-- 2. Create index for language-based queries
CREATE INDEX IF NOT EXISTS questions_language_idx ON questions(language);

-- 3. Insert Indonesian questions
-- Tech questions in Indonesian
INSERT INTO questions (id, category_id, prompt, difficulty, type, language, is_active) VALUES
('tech-1-id', 'tech', 'Jelaskan konsep virtual machine dan bagaimana perbedaannya dengan container.', 3, 'open-ended', 'id', true),
('tech-2-id', 'tech', 'Apa saja prinsip utama dalam desain RESTful API?', 3, 'open-ended', 'id', true),
('tech-3-id', 'tech', 'Jelaskan perbedaan antara database SQL dan NoSQL.', 2, 'open-ended', 'id', true),
('tech-4-id', 'tech', 'Apa tujuan dari sistem version control seperti Git?', 2, 'open-ended', 'id', true),
('tech-5-id', 'tech', 'Jelaskan konsep arsitektur microservices.', 4, 'open-ended', 'id', true),

-- Career questions in Indonesian
('career-1-id', 'career', 'Bagaimana cara Anda memprioritaskan tugas ketika ada beberapa deadline yang mendekat?', 2, 'open-ended', 'id', true),
('career-2-id', 'career', 'Ceritakan pengalaman ketika Anda harus mempelajari skill baru dengan cepat untuk sebuah proyek.', 3, 'open-ended', 'id', true),
('career-3-id', 'career', 'Apa strategi Anda untuk tetap update dengan tren industri?', 2, 'open-ended', 'id', true),
('career-4-id', 'career', 'Bagaimana cara Anda menangani kritik konstruktif dari rekan kerja atau atasan?', 2, 'open-ended', 'id', true),
('career-5-id', 'career', 'Jelaskan pendekatan Anda dalam membimbing anggota tim junior.', 4, 'open-ended', 'id', true),

-- Fun questions in Indonesian
('fun-1-id', 'fun', 'Jika Anda bisa makan malam dengan tokoh sejarah mana pun, siapa yang akan Anda pilih dan mengapa?', 1, 'open-ended', 'id', true),
('fun-2-id', 'fun', 'Apa superpower yang akan Anda pilih dan bagaimana cara menggunakannya?', 1, 'open-ended', 'id', true),
('fun-3-id', 'fun', 'Gambarkan weekend sempurna Anda dalam tiga kalimat.', 1, 'open-ended', 'id', true),
('fun-4-id', 'fun', 'Jika Anda bisa hidup di universe fiksi mana pun, mana yang akan Anda pilih?', 1, 'open-ended', 'id', true),
('fun-5-id', 'fun', 'Apa fakta paling menarik yang Anda ketahui?', 1, 'open-ended', 'id', true)

ON CONFLICT (id) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    prompt = EXCLUDED.prompt,
    difficulty = EXCLUDED.difficulty,
    type = EXCLUDED.type,
    language = EXCLUDED.language,
    is_active = EXCLUDED.is_active;

-- 4. Update existing English questions to have language 'en'
UPDATE questions SET language = 'en' WHERE language IS NULL OR language = '';

-- 5. Update RLS policy to include language consideration
DROP POLICY IF EXISTS "Questions are viewable by everyone" ON questions;
CREATE POLICY "Questions are viewable by everyone" 
    ON questions FOR SELECT 
    USING (is_active = true);

-- Language update complete!