'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ROLES, ROLE_META, type Role, type AgentState } from '@/lib/agents/types';
import type {
  StudioSnapshot,
  Task,
  OutreachDraft,
  LinkedInPost,
  Lead,
  Partner,
  Sop,
  KpiSeries,
  Project,
} from '@/lib/studio/data';
import { CopilotWidget } from './CopilotWidget';
import { SystemTab } from './SystemTab';
import { RevenueTab } from './RevenueTab';
import { FunnelTab } from './FunnelTab';
import { CatalogTab } from './CatalogTab';
import { AgentControlTab } from './AgentControlTab';

// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO · Operations Console
// Tabbed dashboard. Each tab renders a list with one-click actions.
// Actions hit /api/studio/[resource]/[id] (PATCH) or /api/studio/run-agent.
// ─────────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'revenue' | 'funnel' | 'projects' | 'tasks' | 'outreach' | 'content' | 'leads' | 'partners' | 'sops' | 'kpis' | 'agents' | 'control' | 'catalog' | 'system';

export function StudioApp({
  session,
  snapshot,
}: {
  session: { email: string };
  snapshot: StudioSnapshot;
}) {
  const [tab, setTab] = useState<Tab>('overview');
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [flash, setFlash] = useState<string | null>(null);
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  const refresh = () => startTransition(() => router.refresh());

  async function patchRow(resource: string, id: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/studio/${resource}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.ok) {
      setFlash(`✓ ${resource} updated`);
      refresh();
    } else {
      setFlash(`× ${data.error || 'Update failed'}`);
    }
    setTimeout(() => setFlash(null), 3000);
  }

  async function runAgent(role: Role) {
    setFlash(`⏳ Running ${role}…`);
    const res = await fetch(`/api/studio/run-agent/${role}`, { method: 'POST' });
    const data = await res.json();
    if (data.ok) {
      setFlash(`✓ ${role} done · ${data.summary?.slice(0, 50)}`);
      refresh();
    } else {
      setFlash(`× ${role}: ${data.error || 'failed'}`);
    }
    setTimeout(() => setFlash(null), 5000);
  }

  // ─── Project actions ─────────────────────────────────────────────────
  async function createProject(payload: { title: string; brief: string; target_outcome: string }) {
    setFlash('⏳ Arora is routing the brief…');
    const res = await fetch('/api/studio/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.ok) {
      const taskCount = data.decomposition?.tasks?.length ?? 0;
      setFlash(
        taskCount > 0
          ? `✓ Project briefed · Arora decomposed into ${taskCount} task${taskCount === 1 ? '' : 's'}`
          : `✓ Project briefed${data.routerError ? ` · router error: ${data.routerError}` : ''}`,
      );
      setNewProjectOpen(false);
      refresh();
    } else {
      setFlash(`× ${data.error || 'Project creation failed'}`);
    }
    setTimeout(() => setFlash(null), 6000);
    return data;
  }

  async function dispatchProject(projectId: string) {
    setFlash('⏳ Arora is routing this proposal…');
    const res = await fetch('/api/agents/arora/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    });
    const data = await res.json();
    if (data.ok) {
      const taskCount = data.decomposition?.tasks?.length ?? 0;
      setFlash(`✓ Dispatched · ${taskCount} task${taskCount === 1 ? '' : 's'} created`);
      refresh();
    } else {
      setFlash(`× ${data.error || 'Dispatch failed'}`);
    }
    setTimeout(() => setFlash(null), 6000);
  }

  async function cancelProject(projectId: string) {
    await patchRow('projects', projectId, { status: 'cancelled' });
  }

  // ─── Publish actions (real API calls) ────────────────────────────────
  async function publishLinkedIn(postId: string) {
    setFlash('⏳ Posting to LinkedIn…');
    const res = await fetch(`/api/studio/linkedin/${postId}/publish`, { method: 'POST' });
    const data = await res.json();
    if (data.ok) {
      setFlash(`✓ Published · ${data.postUrl ? 'view it on LinkedIn' : 'check your feed'}`);
      refresh();
    } else {
      setFlash(`× ${data.error || 'LinkedIn publish failed'}${data.hint ? ' · ' + data.hint : ''}`);
    }
    setTimeout(() => setFlash(null), 6000);
  }

  async function publishSubstack(postId: string) {
    setFlash('⏳ Sending to Substack…');
    const res = await fetch(`/api/studio/substack/${postId}/publish`, { method: 'POST' });
    const data = await res.json();
    if (data.ok) {
      setFlash(`✓ Sent to Substack at ${data.sentTo} · ${data.note || 'check your dashboard'}`);
      refresh();
    } else {
      setFlash(`× ${data.error || 'Substack send failed'}${data.hint ? ' · ' + data.hint : ''}`);
    }
    setTimeout(() => setFlash(null), 6000);
  }

  async function copyPostToClipboard(post: LinkedInPost) {
    const parts = [post.title, post.hook, post.body].filter((s): s is string => Boolean(s?.trim()));
    const text = parts.join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      setFlash('✓ Copied — paste into LinkedIn / X');
    } catch {
      setFlash('× Clipboard blocked by browser');
    }
    setTimeout(() => setFlash(null), 4000);
  }

  async function sendOutreach(draftId: string) {
    setFlash('⏳ Sending via Gmail…');
    const res = await fetch(`/api/studio/outreach/${draftId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    if (data.ok) {
      setFlash(`✓ Sent · message ${(data.messageId || '').slice(0, 12)}…`);
      refresh();
    } else {
      setFlash(`× ${data.error || 'Send failed'}${data.message ? ' · ' + data.message : ''}`);
    }
    setTimeout(() => setFlash(null), 6000);
  }

  async function wipeDummy() {
    if (!confirm('Permanently delete all unlinked tasks, drafts, posts, partners, leads? Project-linked tasks stay.')) return;
    setFlash('⏳ Wiping dummy data…');
    const res = await fetch('/api/studio/admin/wipe-dummy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: 'WIPE' }),
    });
    const data = await res.json();
    if (data.ok) {
      const b = data.before, a = data.after;
      setFlash(`✓ Wiped: ${b.tasks_unlinked} tasks, ${b.outreach_drafts} drafts, ${b.linkedin_posts} posts, ${b.affiliate_partners} partners, ${b.leads} leads → after: ${a.tasks_total} tasks total`);
      refresh();
    } else {
      setFlash(`× ${data.error || 'Wipe failed'}`);
    }
    setTimeout(() => setFlash(null), 10000);
  }

  const counts = {
    projects: snapshot.projects.filter((p) => p.status !== 'shipped' && p.status !== 'cancelled').length,
    tasks: snapshot.tasks.filter((t) => t.status === 'todo' || t.status === 'in_progress').length,
    outreach: snapshot.drafts.filter((d) => d.status === 'draft').length,
    content: snapshot.posts.filter((p) => p.status === 'draft' || p.status === 'scheduled').length,
    leads: snapshot.leads.filter((l) => l.status !== 'won' && l.status !== 'lost' && l.status !== 'dead').length,
    partners: snapshot.partners.filter((p) => p.status === 'identified' || p.status === 'researched' || p.status === 'contacted').length,
    sops: snapshot.sops.length,
  };

  return (
    <div className="st-page">
      <header className="st-header">
        <div className="st-header-left">
          <div className="st-mark">A</div>
          <div className="st-header-text">
            <div className="st-title">Aiprosol Studio</div>
            <div className="st-subtitle">Operations console · {session.email}</div>
          </div>
        </div>
        <div className="st-header-right">
          {pending && <span className="st-pip">refreshing…</span>}
          <a className="st-link" href="/" target="_blank" rel="noreferrer">View site →</a>
          <a className="st-link" href="/agents" target="_blank" rel="noreferrer">Public dashboard →</a>
        </div>
      </header>

      <nav className="st-tabs">
        {([
          ['overview', 'Overview', null],
          ['revenue', 'Revenue', null],
          ['funnel', 'Funnel', null],
          ['projects', 'Projects', counts.projects],
          ['tasks', 'Tasks', counts.tasks],
          ['outreach', 'Outreach', counts.outreach],
          ['content', 'Content', counts.content],
          ['leads', 'Leads', counts.leads],
          ['partners', 'Partners', counts.partners],
          ['sops', 'SOPs', counts.sops],
          ['kpis', 'KPIs', snapshot.kpis.length],
          ['agents', 'Agents', ROLES.length],
          ['control', 'Agent control', null],
          ['catalog', 'Catalog', null],
          ['system', 'System', null],
        ] as Array<[Tab, string, number | null]>).map(([id, label, count]) => (
          <button
            key={id}
            className={`st-tab ${tab === id ? 'is-active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
            {count !== null && <span className="st-count">{count}</span>}
          </button>
        ))}
      </nav>

      {flash && <div className="st-flash">{flash}</div>}

      <main className="st-main">
        {tab === 'overview' && <Overview snapshot={snapshot} onRunAgent={runAgent} onWipeDummy={wipeDummy} />}
        {tab === 'revenue' && <RevenueTab />}
        {tab === 'funnel' && <FunnelTab />}
        {tab === 'projects' && (
          <ProjectsTab
            projects={snapshot.projects}
            tasks={snapshot.tasks}
            onNew={() => setNewProjectOpen(true)}
            onDispatch={dispatchProject}
            onCancel={cancelProject}
          />
        )}
        {tab === 'tasks' && <TasksTab tasks={snapshot.tasks} onPatch={patchRow} />}
        {tab === 'outreach' && <OutreachTab drafts={snapshot.drafts} onPatch={patchRow} />}
        {tab === 'content' && (
          <ContentTab
            posts={snapshot.posts}
            onPatch={patchRow}
            onPublishLinkedIn={publishLinkedIn}
            onPublishSubstack={publishSubstack}
            onCopy={copyPostToClipboard}
          />
        )}
        {tab === 'leads' && <LeadsTab leads={snapshot.leads} onPatch={patchRow} />}
        {tab === 'partners' && <PartnersTab partners={snapshot.partners} onPatch={patchRow} />}
        {tab === 'sops' && <SopsTab sops={snapshot.sops} />}
        {tab === 'kpis' && <KpisTab kpis={snapshot.kpis} onRunAgent={runAgent} />}
        {tab === 'agents' && <AgentsTab states={snapshot.agentStates} runs={snapshot.recentRuns} onRunAgent={runAgent} />}
        {tab === 'control' && <AgentControlTab />}
        {tab === 'catalog' && <CatalogTab />}
        {tab === 'system' && <SystemTab />}
      </main>

      {newProjectOpen && (
        <NewProjectModal
          onClose={() => setNewProjectOpen(false)}
          onSubmit={createProject}
        />
      )}

      <CopilotWidget refresh={refresh} operatorEmail={session.email} />

      <Styles />
    </div>
  );
}

// ─── OVERVIEW ───────────────────────────────────────────────────────────

function Overview({
  snapshot,
  onRunAgent,
  onWipeDummy,
}: {
  snapshot: StudioSnapshot;
  onRunAgent: (r: Role) => void;
  onWipeDummy: () => void;
}) {
  const totalRuns = ROLES.reduce((n, r) => n + (snapshot.agentStates[r]?.runs ?? 0), 0);
  const onlineAgents = ROLES.filter((r) => snapshot.agentStates[r]?.health === 'ok').length;
  const unlinkedTasks = snapshot.tasks.filter((t) => !t.project_id).length;
  const dummyDataPresent = unlinkedTasks > 10 || snapshot.drafts.length > 5 || snapshot.posts.length > 5 || snapshot.partners.length > 5 || snapshot.leads.length > 5;

  return (
    <div className="st-overview">
      <div className="st-kpi-row">
        <Kpi label="AI agents online" value={`${onlineAgents}/10`} />
        <Kpi label="Total agent runs" value={totalRuns} />
        <Kpi label="Open tasks" value={snapshot.tasks.filter((t) => t.status !== 'done').length} />
        <Kpi label="Drafts awaiting send" value={snapshot.drafts.filter((d) => d.status === 'draft').length} />
        <Kpi label="Leads in pipeline" value={snapshot.leads.length} />
        <Kpi label="Partners (pipeline)" value={snapshot.partners.length} />
      </div>

      {dummyDataPresent && (
        <div
          className="st-card"
          style={{
            background: 'rgba(245, 158, 11, 0.06)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            gap: 16,
          }}
        >
          <div>
            <div className="st-card-hdr" style={{ marginBottom: 4 }}>
              <strong style={{ color: '#FCD34D' }}>DUMMY DATA DETECTED</strong>
            </div>
            <div className="st-item-notes">
              {unlinkedTasks} unlinked tasks · {snapshot.drafts.length} drafts · {snapshot.posts.length} posts · {snapshot.partners.length} partners · {snapshot.leads.length} leads. Wipe to start from a clean baseline (Arora-routed project work + sops + KPIs are preserved).
            </div>
          </div>
          <button
            className="st-btn st-btn-warn"
            onClick={onWipeDummy}
            style={{ flexShrink: 0, padding: '8px 16px' }}
          >
            Wipe dummy data
          </button>
        </div>
      )}

      {/* Errored agents widget — only renders when there ARE errors. Cuts to the
          point: which agent broke, when, and what the error was. Clicking the role
          jumps to its deep-dive history. */}
      {(() => {
        const errors = snapshot.recentRuns.filter((r) => r.status === 'error').slice(0, 5);
        const fallbacks = snapshot.recentRuns.filter((r) => r.status === 'fallback').length;
        if (errors.length === 0 && fallbacks === 0) return null;
        return (
          <>
            <h3 className="st-h3" style={{ color: errors.length ? '#F87171' : '#FCD34D' }}>
              {errors.length ? `${errors.length} agent error${errors.length === 1 ? '' : 's'} need review` : `${fallbacks} fallback run${fallbacks === 1 ? '' : 's'} (LLM unavailable)`}
            </h3>
            <div className="st-card" style={{ borderColor: errors.length ? 'rgba(248,113,113,0.35)' : 'rgba(245,158,11,0.35)' }}>
              {errors.length === 0 ? (
                <div className="st-empty" style={{ fontSize: 12 }}>
                  All recent runs either succeeded or fell back to canned output. {fallbacks} fallbacks in the window.
                </div>
              ) : (
                <ul className="st-list">
                  {errors.map((e, i) => (
                    <li key={i} className="st-list-item">
                      <div className="st-item-body">
                        <div className="st-item-title">
                          <a
                            href={`/agents/${e.role}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#F87171', textDecoration: 'none', fontFamily: 'monospace' }}
                          >
                            {e.role.toUpperCase()} ↗
                          </a>
                          <span className="st-tag">{e.at.slice(11, 16)} UTC · {e.at.slice(5, 10)}</span>
                          <span className="st-tag">{e.duration_ms ?? '-'}ms</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        );
      })()}

      {snapshot.latestDigest && (
        <>
          <h3 className="st-h3">
            Latest daily digest · {snapshot.latestDigest.day}
            {snapshot.latestDigest.emailed_at ? (
              <span className="st-tag" style={{ marginLeft: 8, background: '#10B98122', color: '#34D399' }}>
                emailed → {snapshot.latestDigest.emailed_to}
              </span>
            ) : (
              <span className="st-tag" style={{ marginLeft: 8 }}>not emailed (set RESEND_DIGEST_TO)</span>
            )}
          </h3>
          <div className="st-card">
            <details>
              <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#C084FC' }}>
                {snapshot.latestDigest.subject}
              </summary>
              <pre className="st-pre" style={{ marginTop: 12, fontSize: 12, lineHeight: 1.6 }}>
                {snapshot.latestDigest.body_text}
              </pre>
            </details>
          </div>
        </>
      )}

      <h3 className="st-h3">Most-recent agent runs</h3>
      <div className="st-card">
        {snapshot.recentRuns.length === 0 ? (
          <div className="st-empty">No runs yet — trigger an agent below.</div>
        ) : (
          <table className="st-table">
            <thead>
              <tr><th>Role</th><th>At (UTC)</th><th>Status</th><th>Items</th><th>Alerts</th><th>ms</th></tr>
            </thead>
            <tbody>
              {snapshot.recentRuns.slice(0, 10).map((r, i) => (
                <tr key={i}>
                  <td><strong>{r.role.toUpperCase()}</strong></td>
                  <td className="st-mono">{r.at.slice(11, 19)} {r.at.slice(0, 10)}</td>
                  <td><Status status={r.status} /></td>
                  <td>{r.items_count ?? '-'}</td>
                  <td>{r.alerts_count ?? '-'}</td>
                  <td>{r.duration_ms ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h3 className="st-h3">Quick triggers</h3>
      <div className="st-trigger-grid">
        {ROLES.map((r) => (
          <button key={r} className="st-trigger" onClick={() => onRunAgent(r)}>
            <span className="st-trigger-emoji">{ROLE_META[r].emoji}</span>
            <span className="st-trigger-label">{r.toUpperCase()}</span>
            <span className="st-trigger-sub">{ROLE_META[r].title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="st-kpi">
      <div className="st-kpi-label">{label}</div>
      <div className="st-kpi-value">{value}</div>
    </div>
  );
}

function Status({ status }: { status: string }) {
  const m: Record<string, string> = {
    ok: 'st-status-ok', error: 'st-status-err', fallback: 'st-status-warn',
    sent: 'st-status-ok', done: 'st-status-ok', published: 'st-status-ok', shipped: 'st-status-ok',
    draft: 'st-status-warn', todo: 'st-status-warn', scheduled: 'st-status-warn', in_progress: 'st-status-warn',
    review: 'st-status-warn', briefed: 'st-status-warn', routing: 'st-status-warn',
    blocked: 'st-status-err', cancelled: 'st-status-err',
    new: 'st-status-warn', qualified: 'st-status-ok',
    identified: 'st-status-warn', contacted: 'st-status-warn', researched: 'st-status-warn',
  };
  return <span className={`st-status ${m[status] || ''}`}>{status}</span>;
}

// ─── PROJECTS ──────────────────────────────────────────────────────────

function ProjectsTab({
  projects,
  tasks,
  onNew,
  onDispatch,
  onCancel,
}: {
  projects: Project[];
  tasks: Task[];
  onNew: () => void;
  onDispatch: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  // Group projects by status, ordered by priority of attention.
  const groups: Record<'briefed' | 'in_progress' | 'review' | 'shipped' | 'cancelled', Project[]> = {
    briefed: [], in_progress: [], review: [], shipped: [], cancelled: [],
  };
  for (const p of projects) {
    // 'routing' folds into briefed visually (in-flight router call)
    const key = p.status === 'routing' ? 'briefed' : p.status;
    if (groups[key]) groups[key].push(p);
  }

  const tasksByProject = new Map<string, Task[]>();
  for (const t of tasks) {
    if (!t.project_id) continue;
    const list = tasksByProject.get(t.project_id) ?? [];
    list.push(t);
    tasksByProject.set(t.project_id, list);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 className="st-h3" style={{ margin: 0 }}>
          Projects · {groups.briefed.length + groups.in_progress.length + groups.review.length} active
        </h3>
        <button className="st-btn st-btn-success" onClick={onNew}>
          + New Project
        </button>
      </div>

      {groups.briefed.length > 0 && (
        <div className="st-card">
          <div className="st-card-hdr"><strong>BRIEFED</strong> ({groups.briefed.length}) — awaiting Arora-router or chairman dispatch</div>
          <ul className="st-list">
            {groups.briefed.map((p) => (
              <ProjectRow
                key={p.id}
                project={p}
                tasks={tasksByProject.get(p.id) ?? []}
                onDispatch={onDispatch}
                onCancel={onCancel}
              />
            ))}
          </ul>
        </div>
      )}

      {groups.in_progress.length > 0 && (
        <div className="st-card">
          <div className="st-card-hdr"><strong>IN PROGRESS</strong> ({groups.in_progress.length})</div>
          <ul className="st-list">
            {groups.in_progress.map((p) => (
              <ProjectRow
                key={p.id}
                project={p}
                tasks={tasksByProject.get(p.id) ?? []}
                onDispatch={onDispatch}
                onCancel={onCancel}
              />
            ))}
          </ul>
        </div>
      )}

      {groups.review.length > 0 && (
        <div className="st-card">
          <div className="st-card-hdr"><strong>AWAITING REVIEW</strong> ({groups.review.length}) — all tasks shipped deliverables</div>
          <ul className="st-list">
            {groups.review.map((p) => (
              <ProjectRow
                key={p.id}
                project={p}
                tasks={tasksByProject.get(p.id) ?? []}
                onDispatch={onDispatch}
                onCancel={onCancel}
              />
            ))}
          </ul>
        </div>
      )}

      {groups.shipped.length > 0 && (
        <details className="st-card">
          <summary><strong>Shipped</strong> ({groups.shipped.length})</summary>
          <ul className="st-list">
            {groups.shipped.map((p) => (
              <ProjectRow
                key={p.id}
                project={p}
                tasks={tasksByProject.get(p.id) ?? []}
                onDispatch={onDispatch}
                onCancel={onCancel}
              />
            ))}
          </ul>
        </details>
      )}

      {groups.cancelled.length > 0 && (
        <details className="st-card">
          <summary><strong>Cancelled</strong> ({groups.cancelled.length})</summary>
          <ul className="st-list">
            {groups.cancelled.map((p) => (
              <li key={p.id} className="st-list-item is-done">
                <span>{p.title}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {projects.length === 0 && (
        <div className="st-card">
          <div className="st-item-notes">
            No projects yet. Click <strong>+ New Project</strong> to hand Arora a brief — she&apos;ll decompose it into role-specific tasks and the C-Suite will execute.
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectRow({
  project,
  tasks,
  onDispatch,
  onCancel,
}: {
  project: Project;
  tasks: Task[];
  onDispatch: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const counts = {
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    review: tasks.filter((t) => t.status === 'review').length,
    done: tasks.filter((t) => t.status === 'done').length,
    blocked: tasks.filter((t) => t.status === 'blocked').length,
  };
  const isAroraProposed = project.assigned_by === 'arora' && (project.status === 'briefed' || project.status === 'routing');
  const isBriefedChairman = project.assigned_by === 'chairman' && (project.status === 'briefed' || project.status === 'routing');

  return (
    <li className="st-list-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
      {isAroraProposed && (
        <div
          style={{
            padding: '6px 10px',
            background: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.45)',
            borderRadius: 6,
            fontSize: 11,
            color: '#C084FC',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          ◉ Proposed by Arora — review the brief and dispatch (or cancel)
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div className="st-item-body" style={{ flex: 1 }}>
          <div className="st-item-title">
            {project.title}
            <span className="st-tag">{project.assigned_by}</span>
            <Status status={project.status} />
            {tasks.length > 0 && (
              <span className="st-tag" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#86EFAC', borderColor: 'rgba(34, 197, 94, 0.35)' }}>
                {counts.done}/{tasks.length} done
              </span>
            )}
          </div>
          <div className="st-item-notes" style={{ marginTop: 4 }}>
            {project.brief.slice(0, 240)}{project.brief.length > 240 ? '…' : ''}
          </div>
          {project.target_outcome && (
            <div className="st-item-notes" style={{ marginTop: 4, fontStyle: 'italic' }}>
              Target: {project.target_outcome.slice(0, 200)}
            </div>
          )}
        </div>
        <div className="st-actions" style={{ flexShrink: 0 }}>
          {isAroraProposed && (
            <>
              <button className="st-btn st-btn-success" onClick={() => onDispatch(project.id)}>Dispatch</button>
              <button className="st-btn st-btn-warn" onClick={() => onCancel(project.id)}>Cancel</button>
            </>
          )}
          {isBriefedChairman && project.status === 'briefed' && (
            <button className="st-btn" onClick={() => onDispatch(project.id)}>Retry router</button>
          )}
          {project.status !== 'cancelled' && project.status !== 'shipped' && !isAroraProposed && (
            <button className="st-btn st-btn-warn" onClick={() => onCancel(project.id)}>Cancel</button>
          )}
          {tasks.length > 0 && (
            <button className="st-btn" onClick={() => setExpanded((v) => !v)}>
              {expanded ? 'Hide tasks' : `Tasks (${tasks.length})`}
            </button>
          )}
        </div>
      </div>

      {expanded && tasks.length > 0 && (
        <div style={{ paddingTop: 8, borderTop: '1px dashed rgba(148, 163, 184, 0.2)' }}>
          <ul className="st-list" style={{ marginTop: 4 }}>
            {tasks
              .slice()
              .sort((a, b) => (a.status === 'done' ? 1 : 0) - (b.status === 'done' ? 1 : 0))
              .map((t) => (
                <li key={t.id} className="st-list-item">
                  <div className="st-item-body">
                    <div className="st-item-title">
                      {t.title}
                      <span className="st-tag">{t.owner_role || 'unassigned'}</span>
                      <Status status={t.status} />
                      {t.deliverable_type && t.deliverable_type !== 'none' && (
                        <span className="st-tag" style={{ background: 'rgba(34,211,238,0.12)', color: '#22D3EE', borderColor: 'rgba(34,211,238,0.4)' }}>
                          {t.deliverable_type}
                          {t.deliverable_id ? ' ✓' : ''}
                        </span>
                      )}
                    </div>
                    {t.notes && <div className="st-item-notes">{t.notes.slice(0, 200)}</div>}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}

      {project.decomposition && expanded && (
        <details style={{ marginTop: 4 }}>
          <summary style={{ fontSize: 11, color: '#9CA3B5', cursor: 'pointer' }}>
            Arora&apos;s routing rationale
          </summary>
          <div className="st-item-notes" style={{ marginTop: 6, paddingLeft: 8 }}>
            {project.decomposition.rationale}
          </div>
        </details>
      )}
    </li>
  );
}

function NewProjectModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (p: { title: string; brief: string; target_outcome: string }) => Promise<unknown>;
}) {
  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [targetOutcome, setTargetOutcome] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (title.trim().length < 3 || brief.trim().length < 20) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        brief: brief.trim(),
        target_outcome: targetOutcome.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 6, 19, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 640,
          background: 'rgba(20, 13, 35, 0.98)',
          border: '1px solid rgba(139, 92, 246, 0.35)',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        <h3 className="st-h3" style={{ marginTop: 0 }}>Brief Arora</h3>
        <p className="st-item-notes" style={{ marginBottom: 16 }}>
          Type the project as if you were asking the C-Suite directly. Arora decomposes it into 1–6 tasks, each assigned to one agent. Every deliverable lands as a draft in /studio for your approval — nothing gets sent or published automatically.
        </p>

        <label style={{ display: 'block', marginBottom: 4, fontSize: 11, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: '0.1em', color: '#9CA3B5', textTransform: 'uppercase' }}>
          Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="e.g. Cold outreach to 25 Edinburgh law firms"
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'rgba(10, 6, 19, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: 6,
            color: '#E5E7EB',
            fontFamily: 'inherit',
            fontSize: 14,
            marginBottom: 14,
          }}
        />

        <label style={{ display: 'block', marginBottom: 4, fontSize: 11, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: '0.1em', color: '#9CA3B5', textTransform: 'uppercase' }}>
          Brief
        </label>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          maxLength={5000}
          rows={8}
          placeholder="Describe the project: who the customer is, what the C-Suite should produce, voice/tone constraints, channel, deadline (if any). 50-500 words works well."
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'rgba(10, 6, 19, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: 6,
            color: '#E5E7EB',
            fontFamily: 'inherit',
            fontSize: 14,
            marginBottom: 14,
            resize: 'vertical',
          }}
        />

        <label style={{ display: 'block', marginBottom: 4, fontSize: 11, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: '0.1em', color: '#9CA3B5', textTransform: 'uppercase' }}>
          Target outcome (optional)
        </label>
        <textarea
          value={targetOutcome}
          onChange={(e) => setTargetOutcome(e.target.value)}
          maxLength={800}
          rows={3}
          placeholder="What 'done' looks like. 1-2 sentences. Concrete + measurable. E.g. '3 outreach_draft rows in Supabase, ready to send.'"
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'rgba(10, 6, 19, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: 6,
            color: '#E5E7EB',
            fontFamily: 'inherit',
            fontSize: 14,
            marginBottom: 18,
            resize: 'vertical',
          }}
        />

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="st-btn" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className="st-btn st-btn-success"
            onClick={handleSubmit}
            disabled={submitting || title.trim().length < 3 || brief.trim().length < 20}
          >
            {submitting ? 'Briefing Arora…' : 'Submit to Arora'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TASKS ─────────────────────────────────────────────────────────────

function TasksTab({ tasks, onPatch }: { tasks: Task[]; onPatch: (r: string, id: string, b: Record<string, unknown>) => void }) {
  const groups: Record<string, Task[]> = { now: [], high: [], normal: [], low: [], done: [] };
  for (const t of tasks) {
    if (t.status === 'done') groups.done.push(t);
    else groups[t.priority || 'normal']?.push(t);
  }
  return (
    <div>
      <h3 className="st-h3">Tasks · {tasks.filter((t) => t.status !== 'done').length} open</h3>
      {(['now', 'high', 'normal', 'low'] as const).map((p) => (
        groups[p].length > 0 && (
          <div key={p} className="st-card">
            <div className="st-card-hdr"><strong>{p.toUpperCase()}</strong> ({groups[p].length})</div>
            <ul className="st-list">
              {groups[p].map((t) => (
                <li key={t.id} className="st-list-item">
                  <div className="st-item-body">
                    <div className="st-item-title">
                      {t.title}
                      <span className="st-tag">{t.owner_role || 'unassigned'}</span>
                      <Status status={t.status} />
                      {t.source === 'agent' && (
                        <span className="st-tag" style={{ background: 'rgba(34,211,238,0.12)', color: '#22D3EE', borderColor: 'rgba(34,211,238,0.4)' }}>
                          ◇ proposed by {t.source_role?.toUpperCase() || 'agent'}
                        </span>
                      )}
                    </div>
                    {t.notes && <div className="st-item-notes">{t.notes}</div>}
                  </div>
                  <div className="st-actions">
                    {t.status !== 'in_progress' && (
                      <button className="st-btn" onClick={() => onPatch('tasks', t.id, { status: 'in_progress' })}>Start</button>
                    )}
                    {t.status !== 'done' && (
                      <button className="st-btn st-btn-success" onClick={() => onPatch('tasks', t.id, { status: 'done' })}>Done</button>
                    )}
                    {t.status !== 'blocked' && (
                      <button className="st-btn st-btn-warn" onClick={() => onPatch('tasks', t.id, { status: 'blocked' })}>Block</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      ))}
      {groups.done.length > 0 && (
        <details className="st-card">
          <summary><strong>Completed</strong> ({groups.done.length})</summary>
          <ul className="st-list">
            {groups.done.map((t) => (
              <li key={t.id} className="st-list-item is-done">
                <span>{t.title}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

// ─── OUTREACH ──────────────────────────────────────────────────────────

function OutreachTab({ drafts, onPatch }: { drafts: OutreachDraft[]; onPatch: (r: string, id: string, b: Record<string, unknown>) => void }) {
  const bySeg: Record<string, OutreachDraft[]> = {};
  for (const d of drafts) {
    const seg = d.target_segment || 'other';
    (bySeg[seg] ||= []).push(d);
  }
  return (
    <div>
      <h3 className="st-h3">Outreach · {drafts.filter((d) => d.status === 'draft').length} ready to send</h3>
      {Object.entries(bySeg).map(([seg, items]) => (
        <div key={seg} className="st-card">
          <div className="st-card-hdr"><strong>{seg.toUpperCase().replace(/_/g, ' ')}</strong> ({items.length})</div>
          <ul className="st-list">
            {items.map((d) => (
              <OutreachItem key={d.id} draft={d} onPatch={onPatch} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function OutreachItem({
  draft,
  onPatch,
}: {
  draft: OutreachDraft;
  onPatch: (r: string, id: string, b: Record<string, unknown>) => void;
}) {
  const router = useRouter();
  const [to, setTo] = useState(draft.recipient_email || '');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function sendViaGmail() {
    if (!to) {
      setFeedback('Add a recipient email first');
      return;
    }
    setSending(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/studio/outreach/${draft.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to }),
      });
      const data = await res.json();
      if (data.ok) {
        setFeedback(`✓ Sent to ${to}`);
        setTimeout(() => router.refresh(), 800);
      } else if (data.error === 'gmail-not-connected') {
        setFeedback('× Gmail not connected — visit /inbox first to grant access');
      } else if (data.error === 'already-sent') {
        setFeedback('× Already sent on ' + (data.sentAt || '?'));
      } else {
        setFeedback('× ' + (data.error || 'send failed'));
      }
    } catch (e) {
      setFeedback('× ' + (e instanceof Error ? e.message : 'send failed'));
    } finally {
      setSending(false);
    }
  }

  const isLeadFollowup = draft.notion_id?.startsWith('lead:');

  return (
    <li className="st-list-item">
      <div className="st-item-body">
        <div className="st-item-title">
          {draft.subject}
          <span className="st-tag">{draft.channel}</span>
          <Status status={draft.status} />
          {isLeadFollowup && <span className="st-tag" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', borderColor: 'rgba(16,185,129,0.4)' }}>FROM ROI AUDIT</span>}
        </div>
        {draft.status === 'sent' && draft.recipient_email && (
          <div className="st-item-notes">
            ✉ Sent to <strong>{draft.recipient_email}</strong>
            {draft.sent_by && ` by ${draft.sent_by}`}
            {draft.gmail_message_id && (
              <a
                href={`https://mail.google.com/mail/u/0/#sent/${draft.gmail_message_id}`}
                target="_blank"
                rel="noreferrer"
                style={{ marginLeft: 8, color: 'var(--st-violet-light)' }}
              >
                View in Gmail ↗
              </a>
            )}
          </div>
        )}
        <details className="st-item-notes">
          <summary>View body ({draft.body.length} chars)</summary>
          <pre className="st-pre">{draft.body}</pre>
        </details>
      </div>
      <div className="st-actions" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        {draft.status === 'draft' && (
          <>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              style={{
                padding: '6px 10px',
                background: 'var(--st-bg-2)',
                border: '1px solid var(--st-line-bright)',
                borderRadius: 6,
                color: 'var(--st-text)',
                fontSize: 11,
                width: 220,
                fontFamily: 'inherit',
              }}
              disabled={sending}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                className="st-btn st-btn-success"
                onClick={sendViaGmail}
                disabled={sending || !to}
                style={{ opacity: sending ? 0.5 : 1 }}
              >
                {sending ? 'Sending…' : 'Send via Gmail'}
              </button>
              <button className="st-btn" onClick={() => onPatch('outreach', draft.id, { status: 'sent' })}>Mark sent (no email)</button>
              <button className="st-btn" onClick={() => onPatch('outreach', draft.id, { status: 'archived' })}>Archive</button>
            </div>
            {feedback && <div style={{ fontSize: 10, color: feedback.startsWith('✓') ? 'var(--st-green)' : 'var(--st-amber)' }}>{feedback}</div>}
          </>
        )}
        {draft.status === 'sent' && (
          <>
            <button className="st-btn st-btn-warn" onClick={() => onPatch('outreach', draft.id, { status: 'replied' })}>Mark replied</button>
            <button className="st-btn" onClick={() => onPatch('outreach', draft.id, { status: 'archived' })}>Archive</button>
          </>
        )}
      </div>
    </li>
  );
}

// ─── CONTENT ───────────────────────────────────────────────────────────

function ContentTab({
  posts,
  onPatch,
  onPublishLinkedIn,
  onPublishSubstack,
  onCopy,
}: {
  posts: LinkedInPost[];
  onPatch: (r: string, id: string, b: Record<string, unknown>) => void;
  onPublishLinkedIn: (id: string) => void;
  onPublishSubstack: (id: string) => void;
  onCopy: (post: LinkedInPost) => void;
}) {
  return (
    <div>
      <h3 className="st-h3">Content calendar · {posts.length} posts</h3>
      <div className="st-card">
        {posts.length === 0 ? (
          <div className="st-empty">
            No posts yet. CMO agent drafts will queue here once a project routes one.
          </div>
        ) : (
          <ul className="st-list">
            {posts.map((p) => {
              const isSubstack = (p.industry || '').toLowerCase().includes('substack');
              return (
                <li key={p.id} className="st-list-item">
                  <div className="st-item-body">
                    <div className="st-item-title">
                      {p.title || '(untitled)'}
                      {p.industry && <span className="st-tag">{p.industry}</span>}
                      <Status status={p.status} />
                    </div>
                    {p.hook && <div className="st-item-notes"><em>Hook:</em> {p.hook}</div>}
                    <details className="st-item-notes">
                      <summary>View body</summary>
                      <pre className="st-pre">{p.body}</pre>
                    </details>
                  </div>
                  <div className="st-actions">
                    {p.status !== 'published' && !isSubstack && (
                      <button className="st-btn st-btn-success" onClick={() => onPublishLinkedIn(p.id)}>
                        Publish → LinkedIn
                      </button>
                    )}
                    {p.status !== 'published' && isSubstack && (
                      <button className="st-btn st-btn-success" onClick={() => onPublishSubstack(p.id)}>
                        Publish → Substack
                      </button>
                    )}
                    <button className="st-btn" onClick={() => onCopy(p)}>Copy</button>
                    {p.status === 'draft' && (
                      <button className="st-btn" onClick={() => onPatch('linkedin', p.id, { status: 'scheduled', scheduled_for: new Date(Date.now() + 86400_000).toISOString() })}>Schedule</button>
                    )}
                    {p.status !== 'published' && (
                      <button className="st-btn" onClick={() => onPatch('linkedin', p.id, { status: 'published' })}>Mark published</button>
                    )}
                    <button className="st-btn" onClick={() => onPatch('linkedin', p.id, { status: 'archived' })}>Archive</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── LEADS ─────────────────────────────────────────────────────────────

function LeadsTab({ leads, onPatch }: { leads: Lead[]; onPatch: (r: string, id: string, b: Record<string, unknown>) => void }) {
  return (
    <div>
      <h3 className="st-h3">Leads · {leads.length} in pipeline</h3>
      <div className="st-card">
        {leads.length === 0 ? (
          <div className="st-empty">
            No leads yet. ROI Audit form submissions and CRO agent outputs will land here once wired.
          </div>
        ) : (
          <table className="st-table">
            <thead>
              <tr><th>Name</th><th>Company</th><th>Industry</th><th>Score</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td>{l.name || '?'}<br /><small>{l.email}</small></td>
                  <td>{l.company || '?'}</td>
                  <td>{l.industry || '?'}</td>
                  <td>{l.score ?? 0}</td>
                  <td><Status status={l.status} /></td>
                  <td className="st-actions">
                    <button className="st-btn" onClick={() => onPatch('leads', l.id, { status: 'qualified' })}>Qualify</button>
                    <button className="st-btn" onClick={() => onPatch('leads', l.id, { status: 'contacted' })}>Mark contacted</button>
                    <button className="st-btn st-btn-success" onClick={() => onPatch('leads', l.id, { status: 'won' })}>Won</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── PARTNERS ──────────────────────────────────────────────────────────

function PartnersTab({ partners, onPatch }: { partners: Partner[]; onPatch: (r: string, id: string, b: Record<string, unknown>) => void }) {
  return (
    <div>
      <h3 className="st-h3">Affiliate partners · {partners.length} in pipeline</h3>
      <div className="st-card">
        {partners.length === 0 ? (
          <div className="st-empty">
            No partners imported yet. CPO agent will populate from Notion&apos;s 50-partner list (pending bulk import).
          </div>
        ) : (
          <table className="st-table">
            <thead>
              <tr><th>Name</th><th>Category</th><th>Contact</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}<br /><small>{p.website}</small></td>
                  <td>{p.category || '?'}</td>
                  <td>{p.contact_name || '?'}<br /><small>{p.contact_email}</small></td>
                  <td><Status status={p.status} /></td>
                  <td className="st-actions">
                    <button className="st-btn" onClick={() => onPatch('partners', p.id, { status: 'researched' })}>Researched</button>
                    <button className="st-btn" onClick={() => onPatch('partners', p.id, { status: 'contacted' })}>Contacted</button>
                    <button className="st-btn st-btn-success" onClick={() => onPatch('partners', p.id, { status: 'active' })}>Active</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── SOPs ──────────────────────────────────────────────────────────────

function SopsTab({ sops }: { sops: Sop[] }) {
  return (
    <div>
      <h3 className="st-h3">Strategic playbooks · {sops.length} in library</h3>
      <div className="st-card">
        {sops.length === 0 ? (
          <div className="st-empty">No SOPs imported yet.</div>
        ) : (
          <ul className="st-list">
            {sops.map((s) => (
              <li key={s.id} className="st-list-item">
                <div className="st-item-body">
                  <div className="st-item-title">
                    {s.title}
                    <span className="st-tag">{s.category}</span>
                    <span className="st-tag">{s.owner_role}</span>
                  </div>
                  <details className="st-item-notes">
                    <summary>View ({s.content_markdown.length} chars)</summary>
                    <pre className="st-pre">{s.content_markdown}</pre>
                  </details>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── KPIs ──────────────────────────────────────────────────────────────

function KpisTab({ kpis, onRunAgent }: { kpis: KpiSeries[]; onRunAgent: (r: Role) => void }) {
  // Pretty labels for the raw metric keys
  const labelMap: Record<string, string> = {
    leads_total: 'Leads · total',
    leads_new_24h: 'Leads · new in 24h',
    outreach_drafts_open: 'Outreach · draft',
    outreach_sent_total: 'Outreach · sent (lifetime)',
    linkedin_posts_queued: 'LinkedIn · queued',
    linkedin_posts_published: 'LinkedIn · published',
    tasks_open: 'Tasks · open',
    tasks_agent_proposed: 'Tasks · agent-proposed',
    partners_total: 'Partners · pipeline size',
    sops_total: 'Playbooks',
    agent_runs_24h_ok: 'Agent runs · OK (24h)',
    agent_runs_24h_err: 'Agent runs · errors (24h)',
  };

  return (
    <div>
      <div className="st-kpi-head">
        <h3 className="st-h3">Daily KPI roll-up · {kpis.length} metrics tracked</h3>
        <button
          className="st-btn st-btn-primary"
          onClick={() => onRunAgent('da')}
          title="Fires DA's cycle which auto-writes today's kpi_log row"
        >
          Refresh now (run DA)
        </button>
      </div>

      {kpis.length === 0 ? (
        <div className="st-card">
          <div className="st-empty">
            <p>No kpi_log rows yet.</p>
            <p>Click <strong>Refresh now (run DA)</strong> above — that triggers the DA agent, which seeds the baseline snapshot and starts the day-over-day trend.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="st-kpi-grid">
            {kpis.map((k) => {
              const sym = k.delta > 0 ? '↑' : k.delta < 0 ? '↓' : '→';
              const cls = k.delta > 0 ? 'is-up' : k.delta < 0 ? 'is-down' : 'is-flat';
              return (
                <div className={`st-kpi-card ${cls}`} key={k.metric}>
                  <div className="st-kpi-label">{labelMap[k.metric] ?? k.metric}</div>
                  <div className="st-kpi-value">
                    {k.latest}
                    {k.unit && <span className="st-kpi-unit">{k.unit}</span>}
                  </div>
                  <div className="st-kpi-delta">
                    {sym} {k.delta >= 0 ? '+' : ''}{k.delta} over {k.series.length} days
                  </div>
                  <Sparkline points={k.series.map((s) => s.value)} />
                </div>
              );
            })}
          </div>

          <h3 className="st-h3" style={{ marginTop: 32 }}>Full timeseries (last 14 days)</h3>
          <div className="st-card">
            <table className="st-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  {kpis[0]?.series.map((s) => (
                    <th key={s.day} className="st-mono" style={{ fontSize: 11 }}>
                      {s.day.slice(5)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kpis.map((k) => (
                  <tr key={k.metric}>
                    <td>{labelMap[k.metric] ?? k.metric}</td>
                    {k.series.map((s, i) => (
                      <td key={i} className="st-mono">{s.value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// Compact inline SVG sparkline — no external chart library, no SSR woes.
function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) {
    return <div className="st-sparkline-empty">need ≥2 days for a trend</div>;
  }
  const w = 140;
  const h = 32;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(max - min, 1);
  const stepX = w / (points.length - 1);
  const path = points
    .map((v, i) => {
      const x = i * stepX;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg className="st-sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ─── AGENTS ────────────────────────────────────────────────────────────

function AgentsTab({
  states,
  runs,
  onRunAgent,
}: {
  states: Record<Role, AgentState | null>;
  runs: StudioSnapshot['recentRuns'];
  onRunAgent: (r: Role) => void;
}) {
  return (
    <div>
      <h3 className="st-h3">11-agent C-suite</h3>
      <div className="st-agent-grid">
        {ROLES.map((r) => {
          const s = states[r];
          const meta = ROLE_META[r];
          const agentRuns = runs.filter((x) => x.role === r);
          return (
            <div key={r} className="st-card">
              <div className="st-card-hdr">
                <div>
                  <strong style={{ color: meta.color }}>{meta.emoji} {r.toUpperCase()}</strong>
                  <small style={{ marginLeft: 8, color: 'var(--st-muted)' }}>{meta.fullName}</small>
                </div>
                <button className="st-btn st-btn-success" onClick={() => onRunAgent(r)}>Run now</button>
              </div>
              {s ? (
                <>
                  <div className="st-item-notes">{s.lastOutput.summary}</div>
                  <div className="st-meta-row">
                    <span>Last: <strong>{s.lastRunAt.slice(11, 19)}</strong> UTC</span>
                    <span>Next: {s.nextRunAt.slice(11, 19)}</span>
                    <span>Model: <small className="st-mono">{s.modelLastUsed.split('/')[0]}</small></span>
                  </div>
                  <details className="st-item-notes">
                    <summary>{s.lastOutput.items.length} items · {s.lastOutput.alerts.length} alerts · {agentRuns.length} runs in log</summary>
                    <ul style={{ margin: '8px 0 0 16px' }}>
                      {s.lastOutput.items.map((i, idx) => (
                        <li key={idx} style={{ fontSize: 12, color: 'var(--st-text-dim)' }}>
                          <strong>{i.action}</strong> → {i.result}
                        </li>
                      ))}
                    </ul>
                  </details>
                </>
              ) : (
                <div className="st-empty" style={{ padding: '12px 0' }}>Not yet activated.</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── STYLES (scoped to /studio) ─────────────────────────────────────────

function Styles() {
  return (
    <style>{`
      :root {
        --st-bg: #06030F;
        --st-bg-2: #0E0A1C;
        --st-panel: #141029;
        --st-panel-2: #1A1530;
        --st-line: #2A1F3D;
        --st-line-bright: #4A386E;
        --st-text: #F5F5FA;
        --st-text-dim: #C0C4D0;
        --st-muted: #7A7E92;
        --st-dim: #4A4D60;
        --st-violet: #8B5CF6;
        --st-violet-light: #C084FC;
        --st-green: #10B981;
        --st-amber: #F59E0B;
        --st-red: #F87171;
        --st-cyan: #22D3EE;
      }
      .st-page {
        background: var(--st-bg);
        color: var(--st-text);
        min-height: 100vh;
        font-family: 'Inter', system-ui, sans-serif;
        padding: 0 0 80px;
      }
      .st-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
      .st-header {
        position: sticky; top: 0; z-index: 50;
        display: flex; justify-content: space-between; align-items: center;
        padding: 14px 28px;
        background: rgba(6, 3, 15, 0.85);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid var(--st-line);
      }
      .st-header-left { display: flex; align-items: center; gap: 12px; }
      .st-mark {
        width: 30px; height: 30px;
        background: linear-gradient(135deg, var(--st-violet), var(--st-violet-light));
        border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        color: var(--st-bg); font-weight: 900; font-size: 14px;
      }
      .st-title { font-weight: 800; font-size: 15px; }
      .st-subtitle { font-size: 11px; color: var(--st-muted); margin-top: 2px; }
      .st-header-right { display: flex; align-items: center; gap: 14px; font-size: 12px; }
      .st-link { color: var(--st-violet-light); text-decoration: none; }
      .st-link:hover { color: var(--st-text); }
      .st-pip { color: var(--st-amber); font-size: 11px; }

      .st-tabs {
        display: flex; gap: 4px;
        padding: 12px 28px 0;
        border-bottom: 1px solid var(--st-line);
        overflow-x: auto;
      }
      .st-tab {
        padding: 10px 16px;
        background: transparent;
        border: none;
        border-bottom: 2px solid transparent;
        color: var(--st-text-dim);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        display: flex; align-items: center; gap: 8px;
      }
      .st-tab:hover { color: var(--st-text); }
      .st-tab.is-active { color: var(--st-violet-light); border-bottom-color: var(--st-violet); }
      .st-count {
        padding: 1px 7px;
        background: var(--st-line);
        border-radius: 999px;
        font-size: 10px;
        font-weight: 700;
        color: var(--st-text-dim);
      }
      .st-tab.is-active .st-count { background: var(--st-violet); color: var(--st-bg); }

      .st-flash {
        position: fixed; top: 70px; right: 28px; z-index: 100;
        padding: 10px 16px;
        background: rgba(139, 92, 246, 0.18);
        border: 1px solid var(--st-violet);
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      }

      .st-main { padding: 24px 28px; max-width: 1400px; margin: 0 auto; }
      .st-h3 { font-size: 14px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--st-muted); margin: 24px 0 12px; }

      .st-kpi-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
        margin-bottom: 12px;
      }
      .st-kpi {
        padding: 16px 18px;
        background: var(--st-panel);
        border: 1px solid var(--st-line);
        border-radius: 12px;
      }
      .st-kpi-label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--st-muted);
        margin-bottom: 6px;
      }
      .st-kpi-value {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 28px;
        font-weight: 800;
        background: linear-gradient(135deg, var(--st-violet-light), var(--st-violet));
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .st-card {
        background: var(--st-panel);
        border: 1px solid var(--st-line);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 12px;
      }
      .st-card-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 13px; color: var(--st-text-dim); }
      .st-empty { color: var(--st-muted); font-style: italic; padding: 18px 0; text-align: center; font-size: 13px; }

      .st-table { width: 100%; border-collapse: collapse; font-size: 12px; }
      .st-table th { text-align: left; padding: 8px 6px; border-bottom: 1px solid var(--st-line); color: var(--st-muted); font-weight: 600; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; }
      .st-table td { padding: 8px 6px; border-bottom: 1px solid rgba(42,31,61,0.5); }
      .st-table small { display: block; color: var(--st-muted); font-size: 10px; }

      .st-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
      .st-list-item {
        display: flex; gap: 14px; align-items: flex-start;
        padding: 12px;
        background: var(--st-bg-2);
        border-radius: 8px;
        border: 1px solid var(--st-line);
      }
      .st-list-item.is-done { opacity: 0.5; }
      .st-item-body { flex: 1; min-width: 0; }
      .st-item-title { font-size: 13px; font-weight: 600; color: var(--st-text); display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
      .st-item-notes { font-size: 11px; color: var(--st-text-dim); margin-top: 4px; line-height: 1.45; }
      .st-pre { white-space: pre-wrap; word-wrap: break-word; padding: 8px; background: var(--st-bg); border-radius: 6px; font-size: 11px; color: var(--st-text-dim); margin-top: 6px; max-height: 320px; overflow-y: auto; }
      .st-meta-row { display: flex; gap: 14px; flex-wrap: wrap; font-size: 11px; color: var(--st-muted); margin: 6px 0; }

      .st-tag {
        display: inline-block;
        padding: 1px 7px;
        background: rgba(139,92,246,0.12);
        border: 1px solid rgba(139,92,246,0.35);
        border-radius: 4px;
        color: var(--st-violet-light);
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .st-status {
        display: inline-block;
        padding: 1px 7px;
        border-radius: 4px;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .st-status-ok { background: rgba(16,185,129,0.18); color: var(--st-green); }
      .st-status-warn { background: rgba(245,158,11,0.18); color: var(--st-amber); }
      .st-status-err { background: rgba(248,113,113,0.18); color: var(--st-red); }

      .st-actions { display: flex; gap: 6px; flex-shrink: 0; align-items: flex-start; flex-wrap: wrap; }
      .st-btn {
        padding: 6px 12px;
        background: var(--st-panel-2);
        border: 1px solid var(--st-line-bright);
        border-radius: 6px;
        color: var(--st-text);
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
      }
      .st-btn:hover { border-color: var(--st-violet); color: var(--st-violet-light); }
      .st-btn-success { background: rgba(16,185,129,0.16); border-color: var(--st-green); color: var(--st-green); }
      .st-btn-success:hover { background: var(--st-green); color: var(--st-bg); }
      .st-btn-warn { background: rgba(245,158,11,0.12); border-color: var(--st-amber); color: var(--st-amber); }

      .st-trigger-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 8px;
      }
      .st-trigger {
        display: flex; flex-direction: column; align-items: center; gap: 4px;
        padding: 14px 8px;
        background: var(--st-panel);
        border: 1px solid var(--st-line);
        border-radius: 10px;
        color: var(--st-text);
        cursor: pointer;
        transition: all 0.2s;
      }
      .st-trigger:hover { border-color: var(--st-violet); transform: translateY(-1px); }
      .st-trigger-emoji { font-size: 20px; }
      .st-trigger-label { font-weight: 700; font-size: 12px; color: var(--st-violet-light); }
      .st-trigger-sub { font-size: 10px; color: var(--st-muted); }

      .st-agent-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
        gap: 12px;
      }

      /* ─── KPI tab ───────────────────────────────────────────────── */
      .st-kpi-head {
        display: flex; align-items: center; justify-content: space-between;
        margin: 0 0 16px;
        flex-wrap: wrap; gap: 12px;
      }
      .st-kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 12px;
        margin-bottom: 16px;
      }
      .st-kpi-card {
        position: relative;
        padding: 16px 18px;
        background: var(--st-panel);
        border: 1px solid var(--st-line);
        border-radius: 12px;
        display: flex; flex-direction: column; gap: 6px;
      }
      .st-kpi-card.is-up { border-left: 3px solid var(--st-green); }
      .st-kpi-card.is-down { border-left: 3px solid var(--st-red); }
      .st-kpi-card.is-flat { border-left: 3px solid var(--st-dim); }
      .st-kpi-card .st-kpi-label {
        font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px;
        color: var(--st-muted);
      }
      .st-kpi-card .st-kpi-value {
        font-size: 28px; font-weight: 800; line-height: 1;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        color: var(--st-text);
      }
      .st-kpi-card .st-kpi-unit {
        font-size: 12px; color: var(--st-muted); margin-left: 6px; font-weight: 500;
      }
      .st-kpi-card .st-kpi-delta {
        font-size: 11px;
        color: var(--st-text-dim);
        font-family: 'JetBrains Mono', ui-monospace, monospace;
      }
      .st-kpi-card.is-up .st-kpi-delta { color: var(--st-green); }
      .st-kpi-card.is-down .st-kpi-delta { color: var(--st-red); }
      .st-sparkline {
        width: 100%; height: 32px; margin-top: 4px;
        color: var(--st-violet-light);
      }
      .st-kpi-card.is-up .st-sparkline { color: var(--st-green); }
      .st-kpi-card.is-down .st-sparkline { color: var(--st-red); }
      .st-sparkline-empty {
        font-size: 10px; color: var(--st-muted); margin-top: 4px; font-style: italic;
      }
    `}</style>
  );
}
