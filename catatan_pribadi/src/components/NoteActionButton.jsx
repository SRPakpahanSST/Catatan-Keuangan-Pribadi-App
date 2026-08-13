import React from 'react';

function NoteActionButton({ variant, onClick, dataTestId }) {
  const getLabel = () => {
    switch (variant) {
      case 'delete': return 'Hapus';
      case 'archive': return 'Arsipkan';
      case 'unarchive': return 'Pindahkan';
      default: return 'Aksi';
    }
  };
  const getClassName = () => {
    switch (variant) {
      case 'delete': return 'note-item__action-delete';
      case 'archive': return 'note-item__action-archive';
      case 'unarchive': return 'note-item__action-unarchive';
      default: return 'note-item__action-button';
    }
  };
  return (
    <button className={getClassName()} onClick={onClick} data-testid={dataTestId}>
      {getLabel()}
    </button>
  );
}

export default NoteActionButton;