import React from 'react';
import NoteItem from './NoteItem';
import { groupNotesByMonthYear } from '../utils/noteHelpers';

function NotesList({ 
  notes, 
  onDelete, 
  onArchive, 
  dataTestId = 'notes-list', 
  searchKeyword = '',
  isArchivedSection = false     // ← tambahkan parameter ini
}) {
  const hasNotes = notes && notes.length > 0;

  if (!hasNotes) {
    return (
      <div className="notes-list" data-testid={dataTestId}>
        <p
          className="notes-list__empty-message"
          data-testid={`${dataTestId}-empty`}
        >
          Tidak ada catatan
        </p>
      </div>
    );
  }

  const groupedNotes = groupNotesByMonthYear(notes);

  return (
    <div className="notes-list" data-testid={dataTestId}>
      {Object.entries(groupedNotes).map(([groupKey, groupNotes]) => (
        <section key={groupKey} className="notes-group" data-testid={`${groupKey}-group`}>
          <h3>{groupKey}</h3>
          <span data-testid={`${groupKey}-group-count`}>{groupNotes.length} catatan</span>
          {groupNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onDelete={onDelete}
              onArchive={onArchive}
              searchKeyword={searchKeyword}
              isArchived={isArchivedSection}   // ← teruskan ke NoteItem
            />
          ))}
        </section>
      ))}
    </div>
  );
}

export default NotesList;