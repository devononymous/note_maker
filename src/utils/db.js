import Dexie from 'dexie';

const db = new Dexie('NotesAppDb');

db.version(1).stores({
        // Use string `id` as primary key, no auto-increment
        notes: 'id, title, content, createdAt, updatedAt, synced'
});

export const addOrUpdateNote = async (note) => {
        await db.notes.put({ ...note, updatedAt: new Date().toISOString() });
};

export const deleteNote = async (id) => {
        await db.notes.delete(id);
};

export const getAllNotes = async () => {
        return await db.notes.orderBy('updatedAt').reverse().toArray();
};

export const getNoteById = async (id) => {
        return await db.notes.get(id);
};

export const getUnsyncedNotes = async () => {
        return await db.notes.filter(note => note.synced !== true).toArray();
      };

export default db;
