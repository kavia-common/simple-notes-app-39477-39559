import React, { useEffect, useMemo, useState } from 'react';
import { useNotes } from '../context/NotesContext';

/**
 * PUBLIC_INTERFACE
 * NoteDetail
 * Editor/viewer for the selected note.
 */
export default function NoteDetail() {
  const { notes, selectedId, update, remove, setDirty, dirty } = useNotes();
  const note = useMemo(() => notes.find(n => n.id === selectedId) || null, [notes, selectedId]);

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
    setDirty(false);
  }, [note, setDirty]);

  const onSave = async () => {
    if (!note) return;
    await update(note.id, { title, content });
  };

  const onDelete = async () => {
    if (!note) return;
    const ok = window.confirm('Delete this note? This action cannot be undone.');
    if (!ok) return;
    await remove(note.id);
  };

  if (!note) {
    return (
      <section className="panel detail" aria-label="Note details">
        <div className="detail-empty">Select or create a note to get started.</div>
      </section>
    );
  }

  return (
    <section className="panel detail" aria-label="Note editor">
      <div className="panel-header" role="heading" aria-level={2}>
        <div className="panel-title">Note</div>
        <div className="helper" style={{ marginLeft: 'auto' }}>
          {dirty ? 'Unsaved changes' : `Last updated ${new Date(note.updatedAt).toLocaleString()}`}
        </div>
      </div>
      <div className="detail-content">
        <label htmlFor="note-title" className="helper" style={{ display: 'block', marginBottom: 6 }}>
          Title
        </label>
        <input
          id="note-title"
          className="input"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
          placeholder="Note title"
          aria-label="Note title"
        />

        <div style={{ height: 12 }} />

        <label htmlFor="note-content" className="helper" style={{ display: 'block', marginBottom: 6 }}>
          Content
        </label>
        <textarea
          id="note-content"
          className="textarea"
          value={content}
          onChange={(e) => { setContent(e.target.value); setDirty(true); }}
          placeholder="Write your note here..."
          aria-label="Note content"
        />
      </div>
      <div className="actions">
        <button className="btn" onClick={onSave} aria-label="Save note">Save</button>
        <button
          className="btn ghost"
          onClick={() => { setTitle(note.title); setContent(note.content); setDirty(false); }}
          aria-label="Discard changes"
        >
          Discard
        </button>
        <button
          className="btn secondary"
          style={{ background: '#EF4444' }}
          onClick={onDelete}
          aria-label="Delete note"
        >
          Delete
        </button>
      </div>
    </section>
  );
}
