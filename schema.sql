-- ============================================
-- Would You Join Me for One Hour? — Database Schema
-- Run this once in Vercel Postgres dashboard (SQL editor)
-- ============================================

-- CHAPELS
CREATE TABLE IF NOT EXISTS chapels (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  city         TEXT NOT NULL,
  country      TEXT NOT NULL,
  address      TEXT,
  lat          DOUBLE PRECISION NOT NULL,
  lng          DOUBLE PRECISION NOT NULL,
  schedule     TEXT,   -- legacy free-text; kept for older entries
  perpetual    BOOLEAN DEFAULT FALSE,
  code_required BOOLEAN DEFAULT FALSE,  -- whether visitor must obtain a code from the parish
  status       TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  submitter_email TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_chapels_status  ON chapels(status);
CREATE INDEX IF NOT EXISTS idx_chapels_country ON chapels(country);

-- Migration for existing deployments
ALTER TABLE chapels ADD COLUMN IF NOT EXISTS code_required BOOLEAN DEFAULT FALSE;

-- ============================================
-- ADORATION TIMES (structured schedule slots)
-- Each chapel can have many time slots.
-- ============================================
CREATE TABLE IF NOT EXISTS adoration_times (
  id            SERIAL PRIMARY KEY,
  chapel_id     INTEGER NOT NULL REFERENCES chapels(id) ON DELETE CASCADE,
  -- frequency: 'weekly' | 'biweekly' | 'monthly' | 'first' | 'last' | 'various'
  frequency     TEXT NOT NULL DEFAULT 'weekly',
  -- day_of_week: 0 = Sunday … 6 = Saturday; NULL when frequency = 'various'
  day_of_week   SMALLINT,
  -- start_time / end_time: stored as 'HH:MM' strings in the chapel's LOCAL time
  -- We accept that local-time interpretation uses an approximation of timezone
  -- from longitude until/unless a per-chapel timezone column is added.
  start_time    TEXT,
  end_time      TEXT,
  various_times BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_adoration_times_chapel ON adoration_times(chapel_id);

-- PLEDGES
CREATE TABLE IF NOT EXISTS pledges (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  email           TEXT,
  pledge_time     TIMESTAMPTZ NOT NULL,
  intention       TEXT,
  -- Hour Companion: optional destination the pledger will pray at
  destination_type TEXT,             -- 'chapel' | 'stream' | NULL
  destination_id   INTEGER,          -- references chapels.id when type='chapel'
  destination_name TEXT,             -- display name (cached for both types)
  destination_url  TEXT,             -- for streams; or Maps link for chapels
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migration for existing deployments (adds columns if they don't already exist):
ALTER TABLE pledges ADD COLUMN IF NOT EXISTS destination_type TEXT;
ALTER TABLE pledges ADD COLUMN IF NOT EXISTS destination_id   INTEGER;
ALTER TABLE pledges ADD COLUMN IF NOT EXISTS destination_name TEXT;
ALTER TABLE pledges ADD COLUMN IF NOT EXISTS destination_url  TEXT;

CREATE INDEX IF NOT EXISTS idx_pledges_time ON pledges(pledge_time);

-- CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS contact_messages (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  handled     BOOLEAN DEFAULT FALSE
);

-- SEED: 10 originally-featured chapels (now physical, pre-approved)
INSERT INTO chapels (name, city, country, lat, lng, perpetual, status, approved_at) VALUES
  ('Sisters of Divine Mercy',                 'Calgary',       'Canada',    51.088191, -114.196839, true,  'approved', NOW()),
  ('Shalom World Chapel',                     'Edinburg, TX',  'USA',       27.211164,  -98.126185, true,  'approved', NOW()),
  ('EWTN Chapel',                             'Irondale, AL',  'USA',       33.533602,  -86.675057, true,  'approved', NOW()),
  ('St Benedict''s Burwood',                  'Victoria',      'Australia', -37.848311, 145.096218, false, 'approved', NOW()),
  ('Monastery of the Immaculate Conception',  'Paprotnia',     'Poland',    52.202124,  20.419678,  true,  'approved', NOW()),
  ('Tyburn Convent',                          'London',        'UK',        51.512721,  -0.166909,  true,  'approved', NOW()),
  ('Maria Vision',                            'Rome',          'Italy',     44.349347,  13.014269,  false, 'approved', NOW()),
  ('Cathedral of the Good Shepherd',          'Singapore',     'Singapore',  1.296718, 103.850904,  false, 'approved', NOW()),
  ('Ermita de Nuestra Señora de Bienvenida',  'Toledo',        'Spain',     39.819158,  -5.163416,  false, 'approved', NOW()),
  ('St Mary Mother of God Church',            'Middletown, NJ','USA',       40.413438, -74.103321,  false, 'approved', NOW())
ON CONFLICT DO NOTHING;
