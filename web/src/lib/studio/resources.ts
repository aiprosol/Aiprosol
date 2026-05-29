// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO — resource whitelist (single source of truth)
// Maps a studio "resource" name → its Supabase table + the fields that may be
// updated through the studio. Used by BOTH:
//   - PATCH /api/studio/[resource]/[id]   (the human one-click actions)
//   - the Copilot `update_resource` tool   (src/lib/assistant/tools.ts)
// Keeping it here prevents the two paths from drifting apart.
// ─────────────────────────────────────────────────────────────────────────

export type ResourceConfig = { table: string; allowed: string[] };

export const RESOURCES: Record<string, ResourceConfig> = {
  tasks: {
    table: 'tasks',
    allowed: ['status', 'priority', 'notes', 'owner_role', 'due_date'],
  },
  outreach: {
    table: 'outreach_drafts',
    allowed: ['status', 'sent_at', 'subject', 'body', 'target_segment'],
  },
  linkedin: {
    table: 'linkedin_posts',
    allowed: ['status', 'scheduled_for', 'published_at', 'title', 'body', 'hook', 'industry'],
  },
  leads: {
    table: 'leads',
    allowed: ['status', 'score', 'recommended_plan', 'recommended_products', 'name', 'email', 'company', 'industry'],
  },
  partners: {
    table: 'affiliate_partners',
    allowed: ['status', 'contact_email', 'contact_name', 'website', 'notes', 'name', 'category'],
  },
  // Chairman can cancel a project or mark it shipped manually; routing/in_progress
  // transitions are driven by the trigger + Arora-router, not direct PATCH.
  projects: {
    table: 'projects',
    allowed: ['status', 'title', 'brief', 'target_outcome'],
  },
};
