// src/components/NoteEditor.js
import  { useState, useEffect } from 'react';
import ReactMde from 'react-mde';
import ReactMarkdown from 'react-markdown';
import 'react-mde/lib/styles/css/react-mde-all.css';

const NoteEditor = ({ note, onSave }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [selectedTab, setSelectedTab] = useState('write');

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (title || content) {
        onSave({ ...note, title, content });
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [title, content]);

  return (
    <div className="note-editor">
      <input
        type="text"
        value={title}
        placeholder="Note Title"
        onChange={(e) => setTitle(e.target.value)}
        className="note-title"
      />
      <ReactMde
        value={content}
        onChange={setContent}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={(markdown) =>
          Promise.resolve(<ReactMarkdown>{markdown}</ReactMarkdown>)
        }
        minEditorHeight={100}
      />
    </div>
  );
};

export default NoteEditor;
