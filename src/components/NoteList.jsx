import React, { useEffect, useState } from 'react';
import NoteEditor from './NoteEditor';
import styles from './NoteList.module.css';
import { v4 as uuidv4 } from 'uuid';
import {
  getAllNotes,
  addOrUpdateNote,
  deleteNote,
  getUnsyncedNotes,
} from '../utils/db';

const API_BASE = 'http://localhost:5000/notes';

const NoteList = ({ isOnline }) => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [syncingIds, setSyncingIds] = useState(new Set());
  const [errorIds, setErrorIds] = useState(new Set());

  const fetchNotes = async () => {
    const all = await getAllNotes();
    setNotes(all);
  };

  // Sync unsynced notes when online
  const syncWithBackend = async () => {
    const unsyncedNotes = await getUnsyncedNotes();
    if (unsyncedNotes.length === 0) return;

    setSyncingIds((prev) => new Set([...prev, ...unsyncedNotes.map((n) => n.id)]));

    for (const note of unsyncedNotes) {
      try {
        // Check if note exists on server by GET
        const response = await fetch(`${API_BASE}/${note.id}`);
        if (response.status === 404) {
          // Note does not exist on server, create it
          await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(note),
          });
        } else {
          // Update existing note
          await fetch(`${API_BASE}/${note.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(note),
          });
        }

        // Mark synced true locally
        await addOrUpdateNote({ ...note, synced: true });
        setErrorIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(note.id);
          return newSet;
        });
      } catch  {
        setErrorIds((prev) => new Set(prev).add(note.id));
      } finally {
        setSyncingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(note.id);
          return newSet;
        });
      }
    }

    fetchNotes();
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (isOnline) {
      syncWithBackend();
    }
  }, [isOnline]);

  const handleSave = async (note) => {
    if (!note.id) note.id = uuidv4();
    await addOrUpdateNote(note);
    fetchNotes();
  };

  const handleDelete = async (id) => {
    await deleteNote(id);
    if (isOnline) {
      try {
        await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      } catch {
        // Ignore server delete error, will retry next sync
      }
    }
    fetchNotes();
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <input
        type="search"
        placeholder="Search notes..."
        className={styles.searchInput}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        spellCheck={false}
      />
      <button className={styles.newNoteBtn} onClick={() => handleSave({ title: '', content: '', synced: false })}>
        + New Note
      </button>
      {filteredNotes.length === 0 && <p>No notes found.</p>}
      {filteredNotes.map((note) => (
        <div key={note.id} className={styles.noteCard}>
          <NoteEditor note={note} onSave={handleSave} />
          <div className={styles.noteFooter}>
            <small>
              Last updated: {new Date(note.updatedAt).toLocaleString()}
            </small>
            <span className={styles.status}>
              {syncingIds.has(note.id)
                ? 'Syncing...'
                : errorIds.has(note.id)
                ? 'Error'
                : note.synced
                ? 'Synced'
                : 'Unsynced'}
            </span>
            <button
              className={styles.deleteBtn}
              onClick={() => handleDelete(note.id)}
              aria-label={`Delete note titled ${note.title || 'Untitled'}`}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NoteList;
