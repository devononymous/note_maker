import React, { useEffect, useState, useCallback } from 'react';
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

  // Utility: deduplicate notes by id
  const deduplicateNotes = (notesArray) => {
    const map = new Map();
    notesArray.forEach(note => {
      if (!map.has(note.id)) {
        map.set(note.id, note);
      } else {
        console.warn(`Duplicate note found with id: ${note.id}`);
      }
    });
    return Array.from(map.values());
  };

  const fetchNotes = useCallback(async () => {
    const all = await getAllNotes();
    console.log(`Fetched ${all.length} notes from DB`, all.map(n => n.id));

    // Deduplicate notes before sorting & setting state
    const uniqueNotes = deduplicateNotes(all);

    uniqueNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    setNotes(uniqueNotes);
  }, []);

  const syncWithBackend = useCallback(async () => {
    const unsyncedNotes = await getUnsyncedNotes();
    if (unsyncedNotes.length === 0) return;

    for (const note of unsyncedNotes) {
      setSyncingIds((prev) => new Set(prev).add(note.id));
      try {
        const response = await fetch(`${API_BASE}/${note.id}`);
        if (response.ok) {
          const remoteNote = await response.json();
          const localUpdated = new Date(note.updatedAt).getTime();
          const remoteUpdated = new Date(remoteNote.updatedAt).getTime();

          if (localUpdated >= remoteUpdated) {
            await fetch(`${API_BASE}/${note.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(note),
            });
          } else {
            await addOrUpdateNote({ ...remoteNote, synced: true });
            setSyncingIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(note.id);
              return newSet;
            });
            continue;
          }
        } else if (response.status === 404) {
          await fetch(`${API_BASE}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(note),
          });
        }

        await addOrUpdateNote({ ...note, synced: true });

        setErrorIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(note.id);
          return newSet;
        });
      } catch (error) {
        console.error(`Sync failed for note ${note.id}`, error);
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
  }, [fetchNotes]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    if (isOnline) {
      syncWithBackend();
    }
  }, [isOnline, syncWithBackend]);

  const handleSave = async (note) => {
        const now = new Date().toISOString();
        const noteToSave = {
          ...note,
          id: note.id || uuidv4(),
          updatedAt: now,
          synced: false,
        };
        await addOrUpdateNote(noteToSave);
        fetchNotes();
      };
  const handleDelete = async (id) => {
    console.log(`Deleting note ${id}`);
    await deleteNote(id);

    if (isOnline) {
      try {
        await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      } catch {
        console.error(`Failed to delete note ${id} on server`);
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
      <button
        className={styles.newNoteBtn}
        onClick={() =>
          handleSave({ title: '', content: '', synced: false, updatedAt: new Date().toISOString() })
        }
      >
        + New Note
      </button>

      {filteredNotes.length === 0 && <p>No notes found.</p>}

      {filteredNotes.map((note) => (
        <div key={note.id} className={styles.noteCard}>
          <NoteEditor note={note} onSave={handleSave} />
          <div className={styles.noteFooter}>
            <small>Last updated: {new Date(note.updatedAt).toLocaleString()}</small>
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
