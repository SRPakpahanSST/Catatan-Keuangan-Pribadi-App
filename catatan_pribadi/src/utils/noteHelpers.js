import React from 'react';

// ==================== CRUD Helpers ====================
export const addNote = (notes, { title, body }) => {
  const newNote = {
    id: +new Date(),
    title,
    body,
    createdAt: new Date().toISOString(),
    archived: false,
  };
  return [newNote, ...notes];
};

export const deleteNote = (notes, id) => notes.filter(note => note.id !== id);

export const archiveNote = (notes, id) =>
  notes.map(note => (note.id === id ? { ...note, archived: true } : note));

export const unarchiveNote = (notes, id) =>
  notes.map(note => (note.id === id ? { ...note, archived: false } : note));

export const searchNotes = (notes, keyword) => {
  if (!keyword.trim()) return notes;
  const lowerKeyword = keyword.toLowerCase();
  return notes.filter(note =>
    note.title.toLowerCase().includes(lowerKeyword) ||
    note.body.toLowerCase().includes(lowerKeyword)
  );
};

// ==================== Grouping & Highlight ====================
export const groupNotesByMonthYear = (notes) => {
  const groups = {};
  notes.forEach((note) => {
    const date = new Date(note.createdAt);
    const month = date.toLocaleString('id-ID', { month: 'long' });
    const year = date.getFullYear();
    const key = `${month} ${year}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(note);
  });
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB - dateA;
  });
  const sortedGroups = {};
  sortedKeys.forEach((key) => { sortedGroups[key] = groups[key]; });
  return sortedGroups;
};

export const highlightText = (text, keyword) => {
  if (!keyword || keyword.trim() === '') return text;
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? React.createElement('mark', { key: i }, part) : part
  );
};