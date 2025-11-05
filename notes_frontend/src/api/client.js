const BASE_URL = process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || '';

/**
 * PUBLIC_INTERFACE
 * getApiBase
 * Returns the discovered API base for diagnostics or future use.
 */
export function getApiBase() {
  /** Get the resolved API base URL (from env). */
  return BASE_URL || '(in-memory)';
}

/**
 * PUBLIC_INTERFACE
 * createNotesApi
 * Creates the data-access layer for notes. By default uses an in-memory store.
 * If BASE_URL is set, you can later wire fetch calls here.
 */
export function createNotesApi() {
  /** A very small in-memory source of truth with persistence to localStorage. */
  let notes = [];
  const LS_KEY = 'notesapp.v1.notes';
  const now = () => new Date().toISOString();

  const load = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      notes = raw ? JSON.parse(raw) : [];
    } catch {
      notes = [];
    }
  };

  const persist = () => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(notes));
    } catch {
      // ignore quota or private mode errors
    }
  };

  const genId = () => Math.random().toString(36).slice(2, 10);

  // preload once
  load();

  if (notes.length === 0) {
    notes = [
      {
        id: genId(),
        title: 'Welcome to Notes',
        content: 'This is your first note. Feel free to edit or delete it.',
        createdAt: now(),
        updatedAt: now(),
        pinned: false,
      },
      {
        id: genId(),
        title: 'Ocean Professional Theme',
        content: 'Blue primary (#2563EB) with amber accents (#F59E0B).',
        createdAt: now(),
        updatedAt: now(),
        pinned: false,
      },
    ];
    persist();
  }

  return {
    /** List all notes (could later call GET /notes). */
    async list(query) {
      let items = [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      if (query) {
        const q = query.toLowerCase();
        items = items.filter(
          n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
        );
      }
      return items;
    },
    /** Get one note by id. */
    async get(id) {
      return notes.find(n => n.id === id) || null;
    },
    /** Create a note. */
    async create({ title, content }) {
      const item = {
        id: genId(),
        title: (title || '').trim() || 'Untitled',
        content: content || '',
        createdAt: now(),
        updatedAt: now(),
        pinned: false,
      };
      notes.unshift(item);
      persist();
      return item;
    },
    /** Update a note by id. */
    async update(id, { title, content }) {
      const idx = notes.findIndex(n => n.id === id);
      if (idx === -1) throw new Error('Note not found');
      const existing = notes[idx];
      const updated = {
        ...existing,
        title: (title ?? existing.title).trim() || 'Untitled',
        content: content ?? existing.content,
        updatedAt: now(),
      };
      notes[idx] = updated;
      persist();
      return updated;
    },
    /** Delete a note. */
    async remove(id) {
      const before = notes.length;
      notes = notes.filter(n => n.id !== id);
      if (notes.length === before) throw new Error('Note not found');
      persist();
      return true;
    },
    /** Toggle pinned flag (reserved for future UI). */
    async togglePin(id) {
      const n = notes.find(x => x.id === id);
      if (!n) throw new Error('Note not found');
      n.pinned = !n.pinned;
      n.updatedAt = now();
      persist();
      return n;
    },
  };
}
