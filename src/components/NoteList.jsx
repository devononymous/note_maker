
import React, { useState, useEffect } from 'react';
import ReactMde from 'react-mde';
import ReactMarkdown from 'react-markdown';
import 'react-mde/lib/styles/css/react-mde-all.css';

const NoteEditor = ({ note = {}, onSave }) => {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [tab, setTab] = useState('write');

  useEffect(() => {
    const handler = setTimeout(() => {
      if (title.trim() || content.trim()) {
        onSave({
          ...note,
          title,
          content,
          updatedAt: new Date().toISOString(),
          synced: false,
        });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [title, content]);

  return (
    <div className="note-editor">
      <input
        className="note-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note Title"
      />
      <ReactMde
        value={content}
        onChange={setContent}
        selectedTab={tab}
        onTabChange={setTab}
        generateMarkdownPreview={(md) => Promise.resolve(<ReactMarkdown>{md}</ReactMarkdown>)}
      />
    </div>
  );
};

export default NoteEditor;
