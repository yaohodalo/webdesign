-- Add reminder_sent_at column to pledges table
-- This tracks which pledges have already had their 24h reminder sent
-- so the cron job doesn't double-send.
--
-- Run this once in your Neon SQL editor.

ALTER TABLE pledges
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

-- Index to speed up the cron query "find pledges due in next 24h that haven't been reminded"
CREATE INDEX IF NOT EXISTS idx_pledges_reminder_lookup
ON pledges (pledge_time)
WHERE reminder_sent_at IS NULL;

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'pledges' AND column_name = 'reminder_sent_at';
