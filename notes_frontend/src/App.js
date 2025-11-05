import React from 'react';
import './theme.css';
import { NotesProvider } from './context/NotesContext';
import Header from './components/Header';
import NotesList from './components/NotesList';
import NoteDetail from './components/NoteDetail';

// PUBLIC_INTERFACE
function App() {
  /** Main entry for the Notes UI with responsive two-pane layout. */
  return (
    <NotesProvider>
      <Header />
      <main className="main" role="main">
        <div className="grid">
          <NotesList />
          <NoteDetail />
        </div>
      </main>
    </NotesProvider>
  );
}

export default App;
