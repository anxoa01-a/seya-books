/**
 * Quick Notes & Tax Memos View
 */

export function renderNotesView({
  notes = []
}) {
  return `
    <div class="animate-fade-in">
      <div class="section-head">
        <div>
          <h2>
            <span>Notes & Tax Memos</span>
            <span class="badge badge-neutral">${notes.length} Notes</span>
          </h2>
          <div class="section-subtitle">Keep quick tax checklists, client notes, and write-off ideas</div>
        </div>
        <button class="btn btn-primary btn-sm" id="btn-add-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Note
        </button>
      </div>

      <!-- Notes Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
        ${notes.map(n => `
          <div class="glass-card" style="padding: 16px; border-top: 3px solid ${n.color || 'var(--accent-emerald)'}; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <span class="badge badge-neutral" style="font-size: 10px;">${n.tag || 'General'}</span>
                <div style="display: flex; gap: 4px;">
                  ${n.pinned ? `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="color: var(--accent-amber);"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v5h5"/></svg>
                  ` : ''}
                  <button class="btn btn-secondary btn-sm delete-note-btn" data-id="${n.id}" title="Delete" style="padding: 2px 6px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
                  </button>
                </div>
              </div>
              <h4 style="font-size: 14.5px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">
                ${n.title}
              </h4>
              <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5; white-space: pre-wrap;">
                ${n.content}
              </p>
            </div>
            <div style="font-size: 11px; color: var(--text-dim); margin-top: 14px; padding-top: 8px; border-top: 1px solid var(--border-subtle);">
              ${n.updatedAt ? new Date(n.updatedAt).toLocaleDateString('de-DE') : 'Recent'}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
