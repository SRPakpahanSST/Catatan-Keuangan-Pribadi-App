// ==================== Expense Tracker App - Main.js (Dengan Filter Bulan & Tombol Berwarna) ====================

// DOM Elements
const incomeList = document.getElementById('incomeList');
const expenseList = document.getElementById('expenseList');
const form = document.getElementById('transactionForm');
const titleInput = document.getElementById('transactionFormTitleInput');
const amountInput = document.getElementById('transactionFormAmountInput');
const dateInput = document.getElementById('transactionFormDateInput');
const typeSelect = document.getElementById('transactionFormTypeSelect');
const submitBtn = document.querySelector('[data-testid="transactionFormSubmitButton"]');
const searchInput = document.getElementById('searchTransactionFormTitleInput');
const searchForm = document.getElementById('searchTransactionForm');

// State
let transactions = [];
let editingId = null;
let selectedMonth = new Date().getMonth(); // 0-11, bulan saat ini
let currentSearchKeyword = '';

// ==================== Helper: Ubah format bulan dropdown ====================
function getMonthName(monthIndex, short = false) {
    const months = short 
        ? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
        : ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months[monthIndex];
}

// ==================== Filter berdasarkan bulan & keyword pencarian ====================
function filterTransactionsByMonthAndKeyword() {
    let filtered = transactions.filter(t => {
        // Filter bulan
        const transactionDate = new Date(t.date);
        const transactionMonth = transactionDate.getMonth();
        if (transactionMonth !== selectedMonth) return false;
        // Filter keyword (jika ada)
        if (currentSearchKeyword.trim() !== '') {
            return t.title.toLowerCase().includes(currentSearchKeyword.toLowerCase());
        }
        return true;
    });
    return filtered;
}

// ==================== Update Ringkasan (Saldo, Pemasukan, Pengeluaran) berdasarkan filter ====================
function updateSummary() {
    const filtered = filterTransactionsByMonthAndKeyword();
    let totalIncome = 0;
    let totalExpense = 0;
    filtered.forEach(t => {
        if (t.type === 'income') totalIncome += t.amount;
        else totalExpense += t.amount;
    });
    const balance = totalIncome - totalExpense;

    const balanceElem = document.querySelector('.tracker-summary__balance-amount');
    const incomeElem = document.querySelector('.tracker-summary__stat-amount--income');
    const expenseElem = document.querySelector('.tracker-summary__stat-amount--expense');

    if (balanceElem) balanceElem.textContent = `Rp ${balance.toLocaleString()}`;
    if (incomeElem) incomeElem.textContent = `Rp ${totalIncome.toLocaleString()}`;
    if (expenseElem) expenseElem.textContent = `Rp ${totalExpense.toLocaleString()}`;
}

// ==================== Membuat Kartu Transaksi (dengan data-testid + tombol berwarna) ====================
function createTransactionCard(transaction) {
    const card = document.createElement('div');
    card.setAttribute('data-testid', 'transactionItem');
    card.className = 'tracker-transaction-item';

    // Icon
    const iconSpan = document.createElement('div');
    iconSpan.className = `tracker-transaction-item__icon tracker-transaction-item__icon--${transaction.type}`;
    iconSpan.textContent = transaction.type === 'income' ? '💰' : '💸';
    card.appendChild(iconSpan);

    // Detail
    const detailDiv = document.createElement('div');
    detailDiv.className = 'tracker-transaction-item__detail';
    const title = document.createElement('h4');
    title.className = 'tracker-transaction-item__title';
    title.setAttribute('data-testid', 'transactionItemTitle');
    title.textContent = transaction.title;
    const date = document.createElement('p');
    date.className = 'tracker-transaction-item__date';
    date.setAttribute('data-testid', 'transactionItemDate');
    date.textContent = `Tanggal: ${transaction.date}`;
    detailDiv.appendChild(title);
    detailDiv.appendChild(date);
    card.appendChild(detailDiv);

    // Right side (amount + actions)
    const rightDiv = document.createElement('div');
    rightDiv.className = 'tracker-transaction-item__right';
    const amount = document.createElement('span');
    amount.className = `tracker-transaction-item__amount tracker-transaction-item__amount--${transaction.type}`;
    amount.setAttribute('data-testid', 'transactionItemAmount');
    amount.textContent = `Rp ${transaction.amount.toLocaleString()}`;
    rightDiv.appendChild(amount);
    
     // Elemen untuk menampilkan tipe transaksi (wajib)
    const typeElem = document.createElement('p');
    typeElem.setAttribute('data-testid', 'transactionItemType');
    typeElem.textContent = `Jenis: ${transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}`;

    const actionDiv = document.createElement('div');
    actionDiv.className = 'tracker-transaction-item__actions';

    // Tombol Edit (hijau)
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'tracker-transaction-item__btn tracker-transaction-item__btn--edit';
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startEditTransaction(transaction.id);
    });
    actionDiv.appendChild(editBtn);

    // Tombol Ubah Tipe (kuning)
    const editTypeBtn = document.createElement('button');
    editTypeBtn.textContent = 'Ubah Tipe';
    editTypeBtn.setAttribute('data-testid', 'transactionItemEditTypeButton');
    editTypeBtn.className = 'tracker-transaction-item__btn tracker-transaction-item__btn--type';
    editTypeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTransactionType(transaction.id);
    });
    actionDiv.appendChild(editTypeBtn);

    // Tombol Hapus (merah)
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Hapus';
    deleteBtn.setAttribute('data-testid', 'transactionItemDeleteButton');
    deleteBtn.className = 'tracker-transaction-item__btn tracker-transaction-item__btn--delete';
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTransaction(transaction.id);
    });
    actionDiv.appendChild(deleteBtn);

    rightDiv.appendChild(actionDiv);
    card.appendChild(rightDiv);

    return card;
}

// ==================== Render Ulang UI berdasarkan bulan & keyword ====================
function refreshUI() {
    const filtered = filterTransactionsByMonthAndKeyword();
    const incomeTransactions = filtered.filter(t => t.type === 'income');
    const expenseTransactions = filtered.filter(t => t.type === 'expense');

    incomeList.innerHTML = '';
    expenseList.innerHTML = '';

    incomeTransactions.forEach(t => incomeList.appendChild(createTransactionCard(t)));
    expenseTransactions.forEach(t => expenseList.appendChild(createTransactionCard(t)));

    updateSummary();
}

// ==================== Operasi CRUD + Custom Event ====================
function saveToLocalStorage() {
    localStorage.setItem('expenseTracker', JSON.stringify(transactions));
    window.dispatchEvent(new CustomEvent('transactionsUpdated'));
}

function loadFromLocalStorage() {
    const stored = localStorage.getItem('expenseTracker');
    transactions = stored ? JSON.parse(stored) : [];
}

// Tambah transaksi (dengan validasi)
function addTransaction(event) {
    event.preventDefault();
    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const date = dateInput.value;
    const type = typeSelect.value;

    if (!title) { alert('Judul transaksi tidak boleh kosong!'); return; }
    if (isNaN(amount) || amount < 1) { alert('Nominal uang harus lebih dari 0 rupiah!'); return; }
    if (!date) { alert('Tanggal harus diisi!'); return; }

    const newTransaction = {
        id: Date.now(),
        title,
        amount,
        date,
        type
    };
    transactions.push(newTransaction);
    saveToLocalStorage();
    resetForm();
}

// Edit: isi form dengan data yang akan diedit
function startEditTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    editingId = id;
    titleInput.value = transaction.title;
    amountInput.value = transaction.amount;
    dateInput.value = transaction.date;
    typeSelect.value = transaction.type;
    submitBtn.textContent = 'Perbarui';
}

// Update transaksi setelah edit
function updateTransaction(event) {
    event.preventDefault();
    if (editingId === null) {
        addTransaction(event);
        return;
    }

    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const date = dateInput.value;
    const type = typeSelect.value;

    if (!title) { alert('Judul transaksi tidak boleh kosong!'); return; }
    if (isNaN(amount) || amount < 1) { alert('Nominal uang harus lebih dari 0 rupiah!'); return; }
    if (!date) { alert('Tanggal harus diisi!'); return; }

    const index = transactions.findIndex(t => t.id === editingId);
    if (index !== -1) {
        transactions[index] = { ...transactions[index], title, amount, date, type };
        saveToLocalStorage();
    }
    resetForm();
}

// Hapus transaksi
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveToLocalStorage();
}

// Ubah tipe (income ↔ expense)
function toggleTransactionType(id) {
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        transactions[index].type = transactions[index].type === 'income' ? 'expense' : 'income';
        saveToLocalStorage();
    }
}

// Reset form
function resetForm() {
    titleInput.value = '';
    amountInput.value = '';
    dateInput.value = '';
    typeSelect.value = 'expense';
    editingId = null;
    submitBtn.textContent = 'Simpan';
}

// ==================== Pencarian (Skilled + Advanced) ====================
function setupSearch() {
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            currentSearchKeyword = searchInput.value;
            refreshUI();
        });
    }
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchKeyword = e.target.value;
            refreshUI();
        });
    }
}

// ==================== Filter Bulan (Dropdown Dinamis) ====================
function setupMonthFilter() {
    const dateSpan = document.querySelector('.tracker-header__date');
    if (!dateSpan) return;

    // Ubah span menjadi select
    const select = document.createElement('select');
    select.className = 'tracker-month-select';
    for (let i = 0; i < 12; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = getMonthName(i);
        if (i === selectedMonth) option.selected = true;
        select.appendChild(option);
    }
    select.addEventListener('change', (e) => {
        selectedMonth = parseInt(e.target.value);
        refreshUI();
    });
    dateSpan.innerHTML = '';
    dateSpan.appendChild(select);
}

// ==================== Greeting (Nama dan Username Dicoding) ====================
function setGreeting() {
    const greetingElem = document.querySelector('.tracker-header__greeting');
    if (greetingElem) {
        greetingElem.innerHTML = 'Halo, <strong>SR Pakpahan (sr_pakpahan_sst)</strong>';
    }
}

// ==================== Inisialisasi & Custom Event ====================
function init() {
    setGreeting();
    loadFromLocalStorage();
    setupMonthFilter();
    setupSearch();
    refreshUI();

    window.addEventListener('transactionsUpdated', refreshUI);

    if (form) {
        form.addEventListener('submit', updateTransaction);
    }
}

// Modal Identitas Pengguna
const avatar = document.querySelector('.tracker-header__avatar');
const modal = document.getElementById('userModal');
const closeModalBtn = document.getElementById('closeModalBtn');

if (avatar && modal) {
  avatar.style.cursor = 'pointer';
  avatar.addEventListener('click', () => {
    modal.style.display = 'flex';
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
}

// Tutup modal jika klik di luar konten modal
if (modal) {
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}

document.addEventListener('DOMContentLoaded', init);