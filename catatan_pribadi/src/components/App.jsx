import React from 'react';
import { getInitialData } from '../utils';
import NoteInput from './NoteInput';
import NotesList from './NotesList';
import NoteSearch from './NoteSearch';
import { addNote, deleteNote, archiveNote, unarchiveNote, searchNotes } from '../utils/noteHelpers';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notes: getInitialData(),
      searchKeyword: '',
    };
    this.onAddNoteHandler = this.onAddNoteHandler.bind(this);
    this.onDeleteHandler = this.onDeleteHandler.bind(this);
    this.onArchiveHandler = this.onArchiveHandler.bind(this);
    this.onSearchHandler = this.onSearchHandler.bind(this);
  }

  onAddNoteHandler({ title, body }) {
    this.setState((prevState) => ({
      notes: addNote(prevState.notes, { title, body }),
    }));
  }

  onDeleteHandler(id) {
    this.setState((prevState) => ({
      notes: deleteNote(prevState.notes, id),
    }));
  }

  onArchiveHandler(id) {
    this.setState((prevState) => {
      const note = prevState.notes.find(n => n.id === id);
      if (note.archived) {
        return { notes: unarchiveNote(prevState.notes, id) };
      } else {
        return { notes: archiveNote(prevState.notes, id) };
      }
    });
  }

  onSearchHandler(keyword) {
    this.setState({ searchKeyword: keyword });
  }

  render() {
    const { notes, searchKeyword } = this.state;
    let filteredNotes = searchNotes(notes, searchKeyword);
    const sortByDateDesc = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
    const activeNotes = filteredNotes.filter(n => !n.archived).sort(sortByDateDesc);
    const archivedNotes = filteredNotes.filter(n => n.archived).sort(sortByDateDesc);

    return (
      <div className="note-app" data-testid="note-app">
        <div className="note-app__header" data-testid="note-app-header">
          <h1>Notes</h1>
          <NoteSearch onSearch={this.onSearchHandler} />
        </div>
        <div className="note-app__body" data-testid="note-app-body">
          <NoteInput addNote={this.onAddNoteHandler} />
          <section aria-labelledby="active-notes-title" data-testid="active-notes-section">
            <h2 id="active-notes-title">Catatan Aktif</h2>
            <NotesList
              notes={activeNotes}
              onDelete={this.onDeleteHandler}
              onArchive={this.onArchiveHandler}
              dataTestId="active-notes-list"
              searchKeyword={searchKeyword}
              isArchivedSection={false}
            />
          </section>
          <section aria-labelledby="archived-notes-title" data-testid="archived-notes-section">
            <h2 id="archived-notes-title">Arsip</h2>
            <NotesList
              notes={archivedNotes}
              onDelete={this.onDeleteHandler}
              onArchive={this.onArchiveHandler}
              dataTestId="archived-notes-list"
              searchKeyword={searchKeyword}
              isArchivedSection={true}
            />
          </section>
        </div>
      </div>
    );
  }
}

export default App;