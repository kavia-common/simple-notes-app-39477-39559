import React from 'react';
import { useNotes } from '../context/NotesContext';

/**
 * PUBLIC_INTERFACE
 * Header
 * Displays the top app bar with branding and new-note action.
 */
export default function Header() {
  const { create } = useNotes();
  return (
    <header className="app-header" role="banner">
      <div className="container header-content">
        <div className="brand" aria-label="Application">
          <div className="brand-badge" aria-hidden>📝</div>
          <div className="brand-title">Ocean Notes</div>
        </div>
        <div>
          <button className="btn" onClick={create} aria-label="Create a new note">
            + New Note
          </button>
        </div>
      </div>
    </header>
  );
}
