import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import styles from './NoteEditor.module.css';

const NoteEditor = ({ note = {}, onSave }) => {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSave({
        ...note,
        title,
        content,
        updatedAt: new Date().toISOString(),
        synced: false,
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, [title, content]);

  return (
    <div className={styles.noteEditor}>
      <input
        className={styles.noteTitle}
        placeholder="Note Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', padding: '8px', fontSize: '18px', marginBottom: '10px' }}
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
