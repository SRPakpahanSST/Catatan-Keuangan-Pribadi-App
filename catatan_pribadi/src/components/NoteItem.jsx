import React from 'react';
import { showFormattedDate } from '../utils';
import NoteActionButton from './NoteActionButton';
import { highlightText } from '../utils/noteHelpers';

function NoteItem({ note, onDelete, onArchive, searchKeyword = '', isArchived = false }) {
  const { id, title, body, createdAt, archived } = note;

  const handleDelete = () => onDelete(id);
  const handleArchive = () => onArchive(id);

  const highlightedTitle = highlightText(title, searchKeyword);
  const highlightedBody = highlightText(body, searchKeyword);

  return (
    <div className="note-item" data-testid="note-item" data-note-id={id}>
      <div className="note-item__content" data-testid="note-item-content">
        <h3 className="note-item__title" data-testid="note-item-title">
          {highlightedTitle}
        </h3>
        <p className="note-item__date" data-testid="note-item-date">
          {showFormattedDate(createdAt)}
        </p>
        <p className="note-item__body" data-testid="note-item-body">
          {highlightedBody}
        </p>
      </div>
      <div className="note-item__action" data-testid="note-item-action">
        <NoteActionButton
          variant="delete"
          onClick={handleDelete}
          dataTestId="note-item-delete-button"
        />
        <NoteActionButton
          variant={isArchived ? 'unarchive' : 'archive'}
          onClick={handleArchive}
          dataTestId="note-item-archive-button"
        />
      </div>
    </div>
  );
}

export default NoteItem;