
import React, { useEffect, useState } from 'react';
import NoteEditor from './NoteEditor';
import { getAllNotes, addOrUpdateNote, deleteNote, getUnsyncedNotes } from '../utils/db';
import { v4 as uuidv4 } from 'uuid';

const NoteList = ({ isOnline }) => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');

  const fetchNotes = async () => {
    const all = await getAllNotes();
    setNotes(all);
  };

  const syncWithBackend = async () => {
    const unsynced = await getUnsyncedNotes();

    for (const note of unsynced) {
      try {
        await fetch(`http://localhost:5000/notes/${note.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...note, synced: true }),
        });
        await addOrUpdateNote({ ...note, synced: true });
      } catch {
        console.error('Sync failed:', note.id);
      }
    }
    fetchNotes();
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (isOnline) syncWithBackend();
  }, [isOnline]);

  const handleSave = async (note) => {
    if (!note.id) note.id = uuidv4();
    await addOrUpdateNote(note);
    fetchNotes();
  };

  const handleDelete = async (id) => {
    await deleteNote(id);
    await fetch(`http://localhost:5000/notes/${id}`, { method: 'DELETE' });
    fetchNotes();
  };

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        placeholder="Search notes..."
        onChange={(e) => setSearch(e.target.value)}
        value={search}
        className="search-input"
      />
      <button onClick={() => handleSave({ title: '', content: '' })}>+ New Note</button>
      {filteredNotes.map((note) => (
        <div key={note.id} className="note-card">
          <NoteEditor note={note} onSave={handleSave} />
          <button onClick={() => handleDelete(note.id)}>🗑 Delete</button>
          <div>Status: {note.synced ? '✅ Synced' : '⚠️ Unsynced'}</div>
        </div>
      ))}
    </div>
  );
};

export default NoteList;
