// ==================== Helper: Nama Bulan ====================
function getMonthName(monthIndex) {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return months[monthIndex];
}

// ==================== DOM Elements ====================
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

// ==================== State ====================
let transactions = [];
let editingId = null;
let selectedMonth = new Date().getMonth();
let currentSearchKeyword = '';

// ==================== Filter & Summary ====================
function filterTransactionsByMonthAndKeyword() {
  return transactions.filter(t => {
    const transactionMonth = new Date(t.date).getMonth();
    if (transactionMonth !== selectedMonth) return false;
    if (currentSearchKeyword.trim() !== '') {
      return t.title.toLowerCase().includes(currentSearchKeyword.toLowerCase());
    }
    return true;
  });
}

function updateSummary() {
  const filtered = filterTransactionsByMonthAndKeyword();
  let totalIncome = 0, totalExpense = 0;
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

// ==================== Render Kartu Transaksi (dengan semua data-testid) ====================
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

  // Right side (amount + type + actions)
  const rightDiv = document.createElement('div');
  rightDiv.className = 'tracker-transaction-item__right';
  const amount = document.createElement('span');
  amount.className = `tracker-transaction-item__amount tracker-transaction-item__amount--${transaction.type}`;
  amount.setAttribute('data-testid', 'transactionItemAmount');
  amount.textContent = `Rp ${transaction.amount.toLocaleString()}`;
  rightDiv.appendChild(amount);

  // === WAJIB: data-testid="transactionItemType" ===
  const typeElem = document.createElement('p');
  typeElem.setAttribute('data-testid', 'transactionItemType');
  typeElem.textContent = `Jenis: ${transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}`;
  rightDiv.appendChild(typeElem);

  const actionDiv = document.createElement('div');
  actionDiv.className = 'tracker-transaction-item__actions';

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.className = 'tracker-transaction-item__btn tracker-transaction-item__btn--edit';
  editBtn.addEventListener('click', (e) => { e.stopPropagation(); startEditTransaction(transaction.id); });
  actionDiv.appendChild(editBtn);

  const editTypeBtn = document.createElement('button');
  editTypeBtn.textContent = 'Ubah Tipe';
  editTypeBtn.setAttribute('data-testid', 'transactionItemEditTypeButton');
  editTypeBtn.className = 'tracker-transaction-item__btn tracker-transaction-item__btn--type';
  editTypeBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleTransactionType(transaction.id); });
  actionDiv.appendChild(editTypeBtn);

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Hapus';
  deleteBtn.setAttribute('data-testid', 'transactionItemDeleteButton');
  deleteBtn.className = 'tracker-transaction-item__btn tracker-transaction-item__btn--delete';
  deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); deleteTransaction(transaction.id); });
  actionDiv.appendChild(deleteBtn);

  rightDiv.appendChild(actionDiv);
  card.appendChild(rightDiv);
  return card;
}

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

// ==================== CRUD & LocalStorage ====================
function saveToLocalStorage() {
  localStorage.setItem('expenseTracker', JSON.stringify(transactions));
  window.dispatchEvent(new CustomEvent('transactionsUpdated'));
}

function loadFromLocalStorage() {
  const stored = localStorage.getItem('expenseTracker');
  transactions = stored ? JSON.parse(stored) : [];
}

function addTransaction(event) {
  event.preventDefault();
  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const date = dateInput.value;
  const type = typeSelect.value;
  if (!title) { alert('Judul transaksi tidak boleh kosong!'); return; }
  if (isNaN(amount) || amount < 1) { alert('Nominal uang harus lebih dari 0 rupiah!'); return; }
  if (!date) { alert('Tanggal harus diisi!'); return; }
  const newTransaction = { id: Date.now(), title, amount, date, type };
  transactions.push(newTransaction);
  saveToLocalStorage();
  resetForm();
}

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

function updateTransaction(event) {
  event.preventDefault();
  if (editingId === null) return addTransaction(event);
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

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveToLocalStorage();
}

function toggleTransactionType(id) {
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index].type = transactions[index].type === 'income' ? 'expense' : 'income';
    saveToLocalStorage();
  }
}

function resetForm() {
  titleInput.value = '';
  amountInput.value = '';
  dateInput.value = '';
  typeSelect.value = 'expense';
  editingId = null;
  submitBtn.textContent = 'Simpan';
}

// ==================== Pencarian ====================
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

// ==================== Dropdown Bulan dengan Label "Bulan" ====================
function setupMonthFilter() {
  const dateSpan = document.querySelector('.tracker-header__date');
  if (!dateSpan) return;
  
  const wrapper = document.createElement('div');
  wrapper.className = 'tracker-month-wrapper';
  const label = document.createElement('span');
  label.textContent = 'Bulan: ';
  label.className = 'tracker-month-label';
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
  wrapper.appendChild(label);
  wrapper.appendChild(select);
  dateSpan.innerHTML = '';
  dateSpan.appendChild(wrapper);
}

// ==================== Avatar Upload (tanpa mengubah HTML) ====================
let currentAvatarUrl = localStorage.getItem('userAvatar') || null;

function updateAvatarDisplay() {
  const headerAvatar = document.querySelector('.tracker-header__avatar');
  const modalAvatar = document.querySelector('.user-modal__avatar');
  if (currentAvatarUrl) {
    if (headerAvatar) {
      headerAvatar.innerHTML = `<img src="${currentAvatarUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      headerAvatar.style.backgroundColor = 'transparent';
    }
    if (modalAvatar) {
      modalAvatar.innerHTML = `<img src="${currentAvatarUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      modalAvatar.style.backgroundColor = 'transparent';
    }
  } else {
    if (headerAvatar) {
      headerAvatar.innerHTML = '👤';
      headerAvatar.style.backgroundColor = 'white';
    }
    if (modalAvatar) {
      modalAvatar.innerHTML = '👤';
      modalAvatar.style.backgroundColor = 'white';
    }
  }
}

function setupAvatarUpload() {
  const avatarElement = document.querySelector('.tracker-header__avatar');
  if (!avatarElement) return;
  // Klik avatar hanya untuk membuka modal (sesuai permintaan awal)
  // Upload foto akan ditangani oleh tombol yang akan kita tambahkan di modal secara dinamis
}

// Tambahkan tombol "Ganti Avatar" di modal secara dinamis (karena HTML tidak boleh diubah)
function addAvatarButtonToModal() {
  const modalInfo = document.querySelector('.user-modal__info');
  if (modalInfo && !document.getElementById('dynamicAvatarBtn')) {
    const btn = document.createElement('button');
    btn.id = 'dynamicAvatarBtn';
    btn.textContent = 'Ganti Foto';
    btn.className = 'tracker-form__submit';
    btn.style.marginTop = '12px';
    btn.style.padding = '8px 16px';
    btn.style.fontSize = '0.8rem';
    btn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            currentAvatarUrl = event.target.result;
            localStorage.setItem('userAvatar', currentAvatarUrl);
            updateAvatarDisplay();
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    });
    modalInfo.appendChild(btn);
  }
}

// ==================== Modal Identitas Pengguna ====================
const avatar = document.querySelector('.tracker-header__avatar');
const modal = document.getElementById('userModal');
const closeModalBtn = document.getElementById('closeModalBtn');

if (avatar && modal) {
  avatar.style.cursor = 'pointer';
  avatar.addEventListener('click', () => {
    addAvatarButtonToModal();   // tambahkan tombol upload setiap modal dibuka
    modal.style.display = 'flex';
  });
}
if (closeModalBtn) {
  closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
}
if (modal) {
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
}

// ==================== Greeting ====================
function setGreeting() {
  const greetingElem = document.querySelector('.tracker-header__greeting');
  if (greetingElem) {
    greetingElem.innerHTML = 'Halo, <strong>SR Pakpahan (sr_pakpahan_sst)</strong>';
  }
}

// ==================== Inisialisasi ====================
function init() {
  setGreeting();
  loadFromLocalStorage();
  setupMonthFilter();
  setupSearch();
  refreshUI();
  updateAvatarDisplay();
  // setupAvatarUpload tidak perlu dipanggil karena kita gunakan tombol di modal
  window.addEventListener('transactionsUpdated', refreshUI);
  if (form) form.addEventListener('submit', updateTransaction);
}

document.addEventListener('DOMContentLoaded', init);