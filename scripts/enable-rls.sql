-- ============================================================
-- BookGenerator — Row Level Security (post-launch hardening)
--
-- WARNING: RLS is currently OFF on all custom tables. Enabling it
-- only affects BROWSER-side queries (the `anon` key). Server-side
-- route handlers + server actions use the service role / pooler
-- superuser, which BYPASS RLS and keep working.
--
-- Before applying, confirm which tables the browser client writes:
--   workspaces, collaborators, exports, file-banners, avatars,
--   workspace-logos (storage), quill-editor (files/folders).
--
-- Apply this in the Supabase Dashboard → SQL Editor, or run:
--   node scripts/apply-rls.js
-- ============================================================

-- ── Workspaces: owner or collaborator ─────────────────────────
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workspaces_select" ON workspaces;
CREATE POLICY "workspaces_select" ON workspaces
  FOR SELECT USING (
    workspace_owner = auth.uid()
    OR EXISTS (
      SELECT 1 FROM collaborators c
      WHERE c.workspace_id = workspaces.id AND c.user_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "workspaces_insert" ON workspaces;
CREATE POLICY "workspaces_insert" ON workspaces
  FOR INSERT WITH CHECK (workspace_owner = auth.uid());
DROP POLICY IF EXISTS "workspaces_update" ON workspaces;
CREATE POLICY "workspaces_update" ON workspaces
  FOR UPDATE USING (
    workspace_owner = auth.uid()
    OR EXISTS (
      SELECT 1 FROM collaborators c
      WHERE c.workspace_id = workspaces.id AND c.user_id = auth.uid()
    )
  );

-- ── Collaborators: tied to a workspace the user belongs to ────
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "collaborators_select" ON collaborators;
CREATE POLICY "collaborators_select" ON collaborators
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM collaborators me
      WHERE me.workspace_id = collaborators.workspace_id AND me.user_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "collaborators_insert" ON collaborators;
CREATE POLICY "collaborators_insert" ON collaborators
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ── Folders / Files: inherit workspace access ────────────────
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "folders_select" ON folders;
CREATE POLICY "folders_select" ON folders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      LEFT JOIN collaborators c ON c.workspace_id = w.id
      WHERE w.id = folders.workspace_id
        AND (w.workspace_owner = auth.uid() OR c.user_id = auth.uid())
    )
  );

ALTER TABLE files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "files_select" ON files;
CREATE POLICY "files_select" ON files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      LEFT JOIN collaborators c ON c.workspace_id = w.id
      WHERE w.id = files.workspace_id
        AND (w.workspace_owner = auth.uid() OR c.user_id = auth.uid())
    )
  );

-- ── Documents: same workspace access model ───────────────────
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "documents_select" ON documents;
CREATE POLICY "documents_select" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      LEFT JOIN collaborators c ON c.workspace_id = w.id
      WHERE w.id = documents.workspace_id
        AND (w.workspace_owner = auth.uid() OR c.user_id = auth.uid())
    )
  );

-- ── Subscriptions: own rows only ─────────────────────────────
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subscriptions_select" ON subscriptions;
CREATE POLICY "subscriptions_select" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- ── Users: self only ─────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_select" ON users;
CREATE POLICY "users_select" ON users
  FOR SELECT USING (id = auth.uid());

-- ── Products / Prices: PUBLIC catalog (read for all) ─────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_read" ON products;
CREATE POLICY "products_read" ON products FOR SELECT USING (true);

ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "prices_read" ON prices;
CREATE POLICY "prices_read" ON prices FOR SELECT USING (true);

-- Exports: owner via the owning document's workspace
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "exports_select" ON exports;
CREATE POLICY "exports_select" ON exports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN workspaces w ON w.id = d.workspace_id
      LEFT JOIN collaborators c ON c.workspace_id = w.id
      WHERE d.id = exports.document_id
        AND (w.workspace_owner = auth.uid() OR c.user_id = auth.uid())
    )
  );
