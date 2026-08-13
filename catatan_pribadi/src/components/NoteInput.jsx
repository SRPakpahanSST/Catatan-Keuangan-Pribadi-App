import React from 'react';

class NoteInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      title: '',
      body: '',
      error: '', // untuk pesan error
    };

    this.onTitleChangeEventHandler = this.onTitleChangeEventHandler.bind(this);
    this.onBodyChangeEventHandler = this.onBodyChangeEventHandler.bind(this);
    this.onSubmitEventHandler = this.onSubmitEventHandler.bind(this);
  }

  // [Basic & Skilled] update title dengan batasan 50 karakter
  onTitleChangeEventHandler(event) {
    const newTitle = event.target.value.slice(0, 50);
    this.setState({ title: newTitle, error: '' });
  }

  // [Basic] update body
  onBodyChangeEventHandler(event) {
    this.setState({ body: event.target.value, error: '' });
  }

  // [Basic & Advanced] submit form
  onSubmitEventHandler(event) {
    event.preventDefault();
    const { title, body } = this.state;

    // [Advanced] validasi body minimal 10 karakter
    if (body.length < 10) {
      this.setState({ error: 'Isi catatan minimal harus 10 karakter' });
      return;
    }

    // [Basic] panggil props.addNote dan reset form
    this.props.addNote({ title, body });
    this.setState({ title: '', body: '', error: '' });
  }

  render() {
    const { title, body, error } = this.state;
    const remainingChars = 50 - title.length; // [Skilled] sisa karakter

    return (
      <div className="note-input" data-testid="note-input">
        <h2>Buat catatan</h2>

        {/* [Advanced] tampilkan pesan error jika ada */}
        {error && <p className="note-input__feedback--error">{error}</p>}

        <form onSubmit={this.onSubmitEventHandler} data-testid="note-input-form">
          {/* [Skilled] tampilkan sisa karakter dinamis */}
          <p
            className="note-input__title__char-limit"
            data-testid="note-input-title-remaining"
          >
            Sisa karakter: {remainingChars}
          </p>
          <input
            className="note-input__title"
            type="text"
            placeholder="Ini adalah judul ..."
            value={title}
            onChange={this.onTitleChangeEventHandler}
            required
            data-testid="note-input-title-field"
          />
          <textarea
            className="note-input__body"
            placeholder="Tuliskan catatanmu di sini ..."
            value={body}
            onChange={this.onBodyChangeEventHandler}
            required
            data-testid="note-input-body-field"
          />
          <button type="submit" data-testid="note-input-submit-button">
            Buat
          </button>
        </form>
      </div>
    );
  }
}

export default NoteInput;
