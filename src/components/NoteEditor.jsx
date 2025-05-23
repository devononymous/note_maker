import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import styles from './NoteEditor.module.css';

const NoteEditor = ({ note = {}, onSave }) => {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');

  useEffect(() => {
    setTitle(note.title || '');
    setContent(note.content || '');
  }, [note.id]); // only update when note id changes

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (onSave) {
        onSave({
          ...note,
          title,
          content,
          updatedAt: new Date().toISOString(),
          synced: false,
        });
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [title, content, note.id, onSave]); // track note.id, not whole note object

  return (
    <div className={styles.noteEditor}>
      <input
        className={styles.noteTitle}
        placeholder="Note Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        spellCheck={false}
      />
      <MDEditor
        value={content}
        onChange={setContent}
        height={300}
      />
    </div>
  );
};

export default NoteEditor;
