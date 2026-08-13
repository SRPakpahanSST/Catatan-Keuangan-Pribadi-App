// DOM Elements
const notesContainer = document.getElementById('notesContainer');
const searchInput = document.getElementById('searchNotes');
const addBtn = document.getElementById('addNoteBtn');
const modal = document.getElementById('noteModal');
const closeModal = document.querySelector('.close-modal');
const noteForm = document.getElementById('noteForm');
const modalTitle = document.getElementById('modalTitle');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const noteDate = document.getElementById('noteDate');
const noteCategory = document.getElementById('noteCategory');
const saveBtn = document.getElementById('saveNoteBtn');

// State
let notes = [];
let editingId = null;

// API Base URL
const API_BASE = window.location.origin + '/api';

// ==================== Load Notes ====================
async function loadNotes() {
    try {
        const response = await fetch(`${API_BASE}/notes`);
        if (!response.ok) throw new Error('Gagal memuat catatan');
        notes = await response.json();
        renderNotes(notes);
    } catch (error) {
        console.error('Error:', error);
        // Fallback: data kosong
        notes = [];
        renderNotes([]);
    }
}

// ==================== Render Notes ====================
function renderNotes(data) {
    if (data.length === 0) {
        notesContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #a0aec0;">
                <p style="font-size: 3rem; margin-bottom: 10px;">📝</p>
                <p>Belum ada catatan. Klik "Tambah Catatan" untuk mulai!</p>
            </div>
        `;
        return;
    }

    notesContainer.innerHTML = data.map(note => `
        <div class="note-card ${note.category}">
            <h3>${escapeHtml(note.title)}</h3>
            <p class="content">${escapeHtml(note.content)}</p>
            <div class="meta">
                <span>📅 ${note.date || 'Tanpa tanggal'}</span>
                <span>🏷️ ${note.category || 'umum'}</span>
                <button class="delete-btn" data-id="${note.id}">✕</button>
            </div>
        </div>
    `).join('');

    // Event listener untuk tombol hapus
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteNote(Number(btn.dataset.id)));
    });
}

// ==================== Escape HTML ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== CRUD Notes ====================
async function addNote(noteData) {
    try {
        const response = await fetch(`${API_BASE}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData)
        });
        if (!response.ok) throw new Error('Gagal menambah catatan');
        await loadNotes();
        return true;
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal menyimpan catatan. Coba lagi.');
        return false;
    }
}

async function deleteNote(id) {
    if (!confirm('Hapus catatan ini?')) return;
    try {
        const response = await fetch(`${API_BASE}/notes/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Gagal menghapus');
        await loadNotes();
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal menghapus catatan. Coba lagi.');
    }
}

// ==================== Modal ====================
function openModal(note = null) {
    if (note) {
        modalTitle.textContent = 'Edit Catatan';
        noteTitle.value = note.title;
        noteContent.value = note.content;
        noteDate.value = note.date || '';
        noteCategory.value = note.category || 'umum';
        editingId = note.id;
        saveBtn.textContent = 'Update';
    } else {
        modalTitle.textContent = 'Tambah Catatan';
        noteTitle.value = '';
        noteContent.value = '';
        noteDate.value = new Date().toISOString().split('T')[0];
        noteCategory.value = 'umum';
        editingId = null;
        saveBtn.textContent = 'Simpan';
    }
    modal.classList.add('show');
}

function closeModalFn() {
    modal.classList.remove('show');
}

// ==================== Event Listeners ====================
addBtn.addEventListener('click', () => openModal(null));
closeModal.addEventListener('click', closeModalFn);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModalFn();
});

noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const noteData = {
        title: noteTitle.value.trim(),
        content: noteContent.value.trim(),
        date: noteDate.value,
        category: noteCategory.value
    };

    if (!noteData.title || !noteData.content) {
        alert('Judul dan isi catatan harus diisi!');
        return;
    }

    await addNote(noteData);
    closeModalFn();
});

// ==================== Search ====================
searchInput.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = notes.filter(n =>
        n.title.toLowerCase().includes(keyword) ||
        n.content.toLowerCase().includes(keyword) ||
        n.category.toLowerCase().includes(keyword)
    );
    renderNotes(filtered);
});

// ==================== Init ====================
loadNotes();
