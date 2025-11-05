import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createNotesApi } from '../api/client';

/**
 * PUBLIC_INTERFACE
 * NotesProvider
 * Provides notes state and CRUD actions via context.
 */
const NotesContext = createContext(null);

export function NotesProvider({ children }) {
  const api = useMemo(() => createNotesApi(), []);
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async (q = '') => {
    setLoading(true);
    setError('');
    try {
      const list = await api.list(q);
      setNotes(list);
      if (!selectedId && list.length) {
        setSelectedId(list[0].id);
      } else if (selectedId && !list.find(n => n.id === selectedId)) {
        setSelectedId(list[0]?.id || null);
      }
    } catch (e) {
      setError(e?.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [api, selectedId]);

  useEffect(() => { load(''); }, [load]);

  useEffect(() => {
    const handler = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const select = useCallback((id, { bypassGuard = false } = {}) => {
    if (!bypassGuard && dirty) {
      const ok = window.confirm('You have unsaved changes. Discard them?');
      if (!ok) return false;
    }
    setDirty(false);
    setSelectedId(id);
    return true;
  }, [dirty]);

  const create = useCallback(async () => {
    setError('');
    try {
      const item = await api.create({ title: 'New note', content: '' });
      await load(query);
      setSelectedId(item.id);
      setDirty(false);
      return item;
    } catch (e) {
      setError(e?.message || 'Failed to create note');
      return null;
    }
  }, [api, load, query]);

  const update = useCallback(async (id, data) => {
    setError('');
    try {
      const updated = await api.update(id, data);
      await load(query);
      setSelectedId(updated.id);
      setDirty(false);
      return updated;
    } catch (e) {
      setError(e?.message || 'Failed to save note');
      return null;
    }
  }, [api, load, query]);

  const remove = useCallback(async (id) => {
    setError('');
    try {
      await api.remove(id);
      await load(query);
      setDirty(false);
      if (selectedId === id) {
        setSelectedId((prev) => {
          const next = notes.find(n => n.id !== id)?.id || null;
          return next;
        });
      }
      return true;
    } catch (e) {
      setError(e?.message || 'Failed to delete note');
      return false;
    }
  }, [api, load, query, selectedId, notes]);

  const value = useMemo(() => ({
    notes, query, setQuery,
    selectedId, select,
    create, update, remove,
    loading, error, setError,
    dirty, setDirty,
    reload: (q = query) => load(q),
  }), [notes, query, selectedId, select, create, update, remove, loading, error, load, dirty]);

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
}

/**
 * PUBLIC_INTERFACE
 * useNotes
 * Hook to access the notes store.
 */
export function useNotes() {
  /** Access notes context. */
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within NotesProvider');
  return ctx;
}
