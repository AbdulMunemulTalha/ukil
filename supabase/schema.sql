-- Ukil Database Schema for Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Citizens & Verified Professionals)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'professional', 'admin')),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(30),
  avatar_url TEXT,
  bio TEXT,
  location VARCHAR(100),
  bar_license_no VARCHAR(50),
  specializations TEXT[],
  hourly_fee VARCHAR(50),
  rating NUMERIC(3,2) DEFAULT 5.00,
  review_count INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(10),
  description TEXT,
  color VARCHAR(20) DEFAULT 'coral'
);

-- 3. Questions / Issues Table (Supports Guest & Anonymous Submissions)
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_code VARCHAR(30) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_slug VARCHAR(100) REFERENCES categories(slug),
  urgency VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  is_anonymous BOOLEAN DEFAULT TRUE,
  author_name VARCHAR(100) DEFAULT 'Anonymous Citizen',
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  contact_email VARCHAR(150),
  location VARCHAR(100) DEFAULT 'Bangladesh',
  status VARCHAR(20) DEFAULT 'awaiting_advice' CHECK (status IN ('awaiting_advice', 'advice_given', 'resolved')),
  upvotes INT DEFAULT 0,
  answers_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Answers / Expert Advice Table
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Consultation Requests Table
CREATE TABLE IF NOT EXISTS consultation_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_name VARCHAR(100) NOT NULL,
  client_email VARCHAR(150) NOT NULL,
  client_phone VARCHAR(30) NOT NULL,
  preferred_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

-- Allow public read access to public questions & categories
CREATE POLICY "Public questions are viewable by everyone" ON questions FOR SELECT USING (true);
CREATE POLICY "Everyone can submit a question" ON questions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public answers are viewable by everyone" ON answers FOR SELECT USING (true);

-- Seed Categories
INSERT INTO categories (name, slug, icon, description, color) VALUES
('Anti-Corruption & Bribes', 'bribes', '🚨', 'Illegal bribe demands, government office harassment & remedies', 'rose'),
('Property & Land Disputes', 'property', '🏠', 'Land mutation, deed registration, boundary disputes & eviction', 'amber'),
('Tax, Audit & Accounting', 'tax', '💰', 'Income tax returns, NBR notices, VAT audit & tax appeals', 'cyan'),
('Employment & Labour Rights', 'employment', '👔', 'Salary withholding, wrongful termination, Provident Fund & notice period', 'indigo'),
('Family Law & Inheritance', 'family', '👨‍👩‍👧', 'Divorce, alimony, child custody & property distribution', 'emerald'),
('Criminal Defense & Bail', 'criminal', '⚖️', 'FIR filing, police harassment, bail application & court proceedings', 'slate'),
('Business & Corporate', 'business', '💼', 'Company registration, RJSC filing, contract disputes & IP rights', 'blue'),
('Consumer Rights & Fraud', 'consumer', '🛒', 'E-commerce scams, defective products & DNCRP complaints', 'orange')
ON CONFLICT (slug) DO NOTHING;
