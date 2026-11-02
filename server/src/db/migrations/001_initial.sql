CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_token VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  company VARCHAR(160),
  project_type VARCHAR(16) NOT NULL CHECK (project_type IN ('web', 'mobile', 'saas', 'ai', 'custom')),
  status VARCHAR(24) NOT NULL DEFAULT 'completed' CHECK (status = 'completed'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID NOT NULL UNIQUE REFERENCES enquiries(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  blueprint JSONB NOT NULL,
  generation_source VARCHAR(16) NOT NULL DEFAULT 'rules' CHECK (generation_source IN ('rules', 'gemini')),
  schema_version VARCHAR(16) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS enquiries_created_at_idx ON enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS enquiries_project_type_idx ON enquiries (project_type);
CREATE INDEX IF NOT EXISTS submissions_created_at_idx ON project_submissions (created_at DESC);
