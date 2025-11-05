import React, { useEffect, useMemo } from 'react';
import { useNotes } from '../context/NotesContext';

/**
 * PUBLIC_INTERFACE
 * NotesList
 * Searchable, scrollable list of notes.
 */
export default function NotesList() {
  const { notes, query, setQuery, select, selectedId, reload, loading, error } = useNotes();

  useEffect(() => {
    const id = setTimeout(() => reload(query), 150);
    return () => clearTimeout(id);
  }, [query, reload]);

  const filtered = useMemo(() => {
    if (!query) return notes;
    const q = query.toLowerCase();
    return notes.filter(n =>
      n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }, [notes, query]);

  return (
    <aside className="panel" aria-label="Notes list">
      <div className="panel-header">
        <div className="panel-title">Your Notes</div>
        <div className="helper" style={{ marginLeft: 'auto' }}>{filtered.length} items</div>
      </div>
      <div className="list-toolbar" role="search">
        <input
          className="input"
          type="search"
          placeholder="Search notes..."
          value={query}
          aria-label="Search notes"
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn ghost" onClick={() => setQuery('')} aria-label="Clear search">
          Clear
        </button>
      </div>

      {loading && (
        <div className="status" style={{ margin: 12 }} role="status" aria-live="polite">
          Loading…
        </div>
      )}
      {error && (
        <div
          style={{
            margin: 12,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid rgba(239,68,68,0.3)',
            background: 'rgba(239,68,68,0.08)',
            color: '#991B1B',
            fontSize: 13
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="notes-list" role="list">
        {filtered.map(n => (
          <button
            key={n.id}
            className={`note-item ${selectedId === n.id ? 'active' : ''}`}
            role="listitem"
            onClick={() => select(n.id)}
            aria-current={selectedId === n.id ? 'true' : 'false'}
            aria-label={`Open note ${n.title || 'Untitled'}`}
          >
            <div className="note-title">{n.title || 'Untitled'}</div>
            <p className="note-snippet">
              {n.content?.slice(0, 120) || 'No content'}
              {n.content?.length > 120 ? '…' : ''}
            </p>
            <div className="note-meta">
              <span>Updated {new Date(n.updatedAt).toLocaleString()}</span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && !loading && (
          <div className="detail-empty" role="note">No notes found.</div>
        )}
      </div>
    </aside>
  );
}
