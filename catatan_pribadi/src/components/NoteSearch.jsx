import React, { useState } from 'react';

function NoteSearch({ onSearch }) {
  const [keyword, setKeyword] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setKeyword(value);
    onSearch(value);
  };

  return (
    <div className="note-search" data-testid="note-search">
      <input
        type="text"
        className="note-search__input"
        placeholder="Cari catatan..."
        value={keyword}
        onChange={handleChange}
        data-testid="note-search-input"
      />
    </div>
  );
}

export default NoteSearch;
