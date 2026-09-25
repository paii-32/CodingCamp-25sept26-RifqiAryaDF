/**
 * Expense & Budget Visualizer
 * Main JavaScript Application
 * 
 * Features:
 * - Local Storage persistence for transactions and settings
 * - Form validation and error handling
 * - Transaction management (add, delete)
 * - Sorting functionality (chronological, amount, category)
 * - Chart.js integration for spending visualization
 * - Budget limit with visual warnings
 * - Dark/Light mode toggle with persistence
 */

// ==========================================
// Configuration and Constants
// ==========================================
const STORAGE_KEYS = {
  TRANSACTIONS: 'expense_transactions',
  BUDGET_LIMIT: 'expense_budget_limit',
  THEME: 'expense_theme'
};

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];

const STORAGE_LIMITS = {
  MAX_AMOUNT: 999999999.99,
  MIN_AMOUNT: 0.01,
  MAX_NAME_LENGTH: 100
};

// ==========================================
// State Management
// ==========================================
let state = {
  transactions: [],
  budgetLimit: null,
  sortOption: 'chronological',
  theme: 'light'
};

let chartInstance = null;

// ==========================================
// DOM Elements Cache
// ==========================================
const elements = {
  // Form elements
  form: document.getElementById('transaction-form'),
  itemName: document.getElementById('item-name'),
  amount: document.getElementById('amount'),
  category: document.getElementById('category'),
  
  // Form error messages
  itemNameError: document.getElementById('item-name-error'),
  amountError: document.getElementById('amount-error'),
  categoryError: document.getElementById('category-error'),
  
  // Display elements
  totalAmount: document.getElementById('total-amount'),
  transactionList: document.getElementById('transaction-list'),
  budgetWarning: document.getElementById('budget-warning'),
  sortSelect: document.getElementById('sort-select'),
  
  // Theme toggle
  themeToggle: document.getElementById('theme-toggle'),
  
  // Chart
  chartCanvas: document.getElementById('category-chart')
};

// ==========================================
// Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  // Load data from Local Storage
  loadTransactions();
  loadBudgetLimit();
  loadTheme();
  
  // Apply initial theme
  applyTheme(state.theme);
  
  // Set up event listeners
  setupEventListeners();
  
  // Initial render
  updateTotalDisplay();
  renderTransactionList();
  updateBudgetWarning();
  updateChart();
}

// ==========================================
// Local Storage Functions
// ==========================================
function loadTransactions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (stored) {
      state.transactions = JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load transactions:', error);
    state.transactions = [];
  }
}

function saveTransactions() {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(state.transactions));
  } catch (error) {
    console.error('Failed to save transactions:', error);
    alert('Error saving transactions. Please try again.');
  }
}

function loadBudgetLimit() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BUDGET_LIMIT);
    if (stored) {
      state.budgetLimit = parseFloat(stored);
    }
  } catch (error) {
    console.warn('Failed to load budget limit:', error);
    state.budgetLimit = null;
  }
}

function saveBudgetLimit() {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGET_LIMIT, state.budgetLimit);
  } catch (error) {
    console.error('Failed to save budget limit:', error);
  }
}

function loadTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    if (stored) {
      state.theme = stored;
    }
  } catch (error) {
    console.warn('Failed to load theme:', error);
    state.theme = 'light';
  }
}

function saveTheme() {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
  } catch (error) {
    console.error('Failed to save theme:', error);
  }
}

// ==========================================
// Form Validation
// ==========================================
function validateItemName(value) {
  if (!value || value.trim() === '') {
    return 'Item name is required';
  }
  if (value.length > STORAGE_LIMITS.MAX_NAME_LENGTH) {
    return `Item name must be ${STORAGE_LIMITS.MAX_NAME_LENGTH} characters or less`;
  }
  return null;
}

function validateAmount(value) {
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) {
    return 'Amount must be a number';
  }
  if (numValue < STORAGE_LIMITS.MIN_AMOUNT) {
    return `Amount must be at least ${STORAGE_LIMITS.MIN_AMOUNT}`;
  }
  if (numValue > STORAGE_LIMITS.MAX_AMOUNT) {
    return `Amount must be ${STORAGE_LIMITS.MAX_AMOUNT} or less`;
  }
  return null;
}

function validateCategory(value) {
  if (!value || value === '') {
    return 'Please select a category';
  }
  return null;
}

function clearFormErrors() {
  elements.itemNameError.classList.remove('visible');
  elements.amountError.classList.remove('visible');
  elements.categoryError.classList.remove('visible');
  
  elements.itemName.classList.remove('invalid');
  elements.amount.classList.remove('invalid');
  elements.category.classList.remove('invalid');
}

function showFieldError(field, errorElement, message) {
  field.classList.add('invalid');
  errorElement.textContent = message;
  errorElement.classList.add('visible');
}

// ==========================================
// Transaction Management
// ==========================================
function addTransaction(name, amount, category) {
  const transaction = {
    id: Date.now(),
    name: name.trim(),
    amount: parseFloat(amount),
    category: category,
    timestamp: Date.now()
  };
  
  state.transactions.unshift(transaction);
  saveTransactions();
  
  return transaction;
}

function deleteTransaction(id) {
  const initialLength = state.transactions.length;
  
  state.transactions = state.transactions.filter(t => t.id !== id);
  
  if (state.transactions.length < initialLength) {
    saveTransactions();
    return true;
  }
  
  return false;
}

function clearAllTransactions() {
  state.transactions = [];
  saveTransactions();
}

// ==========================================
// Form Event Handlers
// ==========================================
function setupEventListeners() {
  // Form submission
  elements.form.addEventListener('submit', function(e) {
    e.preventDefault();
    handleFormSubmit();
  });
  
  // Real-time validation on input
  elements.itemName.addEventListener('input', function() {
    const error = validateItemName(this.value);
    if (error) {
      showFieldError(this, elements.itemNameError, error);
    } else {
      this.classList.remove('invalid');
      elements.itemNameError.classList.remove('visible');
    }
  });
  
  elements.amount.addEventListener('input', function() {
    const error = validateAmount(this.value);
    if (error) {
      showFieldError(this, elements.amountError, error);
    } else {
      this.classList.remove('invalid');
      elements.amountError.classList.remove('visible');
    }
  });
  
  elements.category.addEventListener('change', function() {
    const error = validateCategory(this.value);
    if (error) {
      showFieldError(this, elements.categoryError, error);
    } else {
      this.classList.remove('invalid');
      elements.categoryError.classList.remove('visible');
    }
  });
  
  // Budget limit input
  const budgetInput = document.getElementById('budget-limit');
  budgetInput.addEventListener('change', function() {
    handleBudgetLimitChange(this.value);
  });
  
  // Sort control
  elements.sortSelect.addEventListener('change', function() {
    state.sortOption = this.value;
    renderTransactionList();
  });
  
  // Theme toggle
  elements.themeToggle.addEventListener('click', function() {
    toggleTheme();
  });
}

function handleFormSubmit() {
  clearFormErrors();
  
  const name = elements.itemName.value;
  const amount = elements.amount.value;
  const category = elements.category.value;
  
  // Validate all fields
  const nameError = validateItemName(name);
  const amountError = validateAmount(amount);
  const categoryError = validateCategory(category);
  
  let hasError = false;
  
  if (nameError) {
    showFieldError(elements.itemName, elements.itemNameError, nameError);
    hasError = true;
  }
  
  if (amountError) {
    showFieldError(elements.amount, elements.amountError, amountError);
    hasError = true;
  }
  
  if (categoryError) {
    showFieldError(elements.category, elements.categoryError, categoryError);
    hasError = true;
  }
  
  if (hasError) {
    return;
  }
  
  // Add transaction
  addTransaction(name, amount, category);
  
  // Update UI
  updateTotalDisplay();
  renderTransactionList();
  updateChart();
  updateBudgetWarning();
  
  // Reset form
  elements.form.reset();
}

function handleBudgetLimitChange(value) {
  if (value === '') {
    state.budgetLimit = null;
  } else {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      alert('Please enter a valid budget limit');
      return;
    }
    
    if (numValue > STORAGE_LIMITS.MAX_AMOUNT) {
      alert(`Budget limit must be ${STORAGE_LIMITS.MAX_AMOUNT} or less`);
      return;
    }
    
    state.budgetLimit = numValue;
  }
  
  saveBudgetLimit();
  updateBudgetWarning();
}

// ==========================================
// Transaction List Functions
// ==========================================
function renderTransactionList() {
  let displayTransactions = [...state.transactions];
  
  // Apply sorting
  displayTransactions = sortTransactions(displayTransactions, state.sortOption);
  
  // Clear current list
  elements.transactionList.innerHTML = '';
  
  if (displayTransactions.length === 0) {
    elements.transactionList.innerHTML = '<p class="empty-message">No transactions recorded yet.</p>';
    return;
  }
  
  // Create transaction items
  displayTransactions.forEach(transaction => {
    const item = createTransactionItem(transaction);
    elements.transactionList.appendChild(item);
  });
}

function createTransactionItem(transaction) {
  const item = document.createElement('div');
  item.className = 'transaction-item';
  item.dataset.id = transaction.id;
  
  item.innerHTML = `
    <div class="item-info">
      <div class="item-name">${escapeHtml(transaction.name)}</div>
      <div class="item-details">
        <span class="item-amount">${formatRupiah(transaction.amount)}</span>
        <span class="item-category">${escapeHtml(transaction.category)}</span>
      </div>
    </div>
    <button class="delete-btn" title="Delete transaction" aria-label="Delete transaction">
      ×
    </button>
  `;
  
  // Add delete event listener
  const deleteBtn = item.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', function() {
    deleteTransactionHandler(transaction.id, item);
  });
  
  return item;
}

function deleteTransactionHandler(id, element) {
  // Confirmation dialog
  if (!confirm('Are you sure you want to delete this transaction?')) {
    return;
  }
  
  const deleted = deleteTransaction(id);
  
  if (deleted) {
    // Remove from DOM with animation
    element.style.opacity = '0';
    element.style.transform = 'translateX(20px)';
    
    setTimeout(function() {
      element.remove();
      
      // Update UI
      updateTotalDisplay();
      renderTransactionList();
      updateChart();
      updateBudgetWarning();
    }, 200);
  } else {
    alert('Failed to delete transaction. Please try again.');
  }
}

function sortTransactions(transactions, criterion) {
  const sorted = [...transactions];
  
  switch (criterion) {
    case 'amount-asc':
      sorted.sort((a, b) => {
        if (a.amount !== b.amount) {
          return a.amount - b.amount;
        }
        return a.timestamp - b.timestamp;
      });
      break;
      
    case 'amount-desc':
      sorted.sort((a, b) => {
        if (a.amount !== b.amount) {
          return b.amount - a.amount;
        }
        return a.timestamp - b.timestamp;
      });
      break;
      
    case 'category-asc':
      sorted.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.timestamp - b.timestamp;
      });
      break;
      
    case 'chronological':
    default:
      // Default: newest first (reverse chronological)
      sorted.sort((a, b) => b.timestamp - a.timestamp);
      break;
  }
  
  return sorted;
}

// ==========================================
// Display Functions
// ==========================================
function updateTotalDisplay() {
  const total = calculateTotal();
  elements.totalAmount.textContent = formatRupiah(total);
  
  // Update budget warning style
  updateBudgetWarning();
}

function calculateTotal() {
  return state.transactions.reduce((sum, transaction) => {
    const amount = parseFloat(transaction.amount);
    if (isNaN(amount) || amount < 0) {
      console.warn('Invalid transaction amount:', transaction);
      return sum;
    }
    return sum + amount;
  }, 0);
}

function updateBudgetWarning() {
  if (state.budgetLimit === null) {
    elements.budgetWarning.classList.remove('visible');
    elements.totalAmount.parentElement.classList.remove('warning');
    return;
  }
  
  const total = calculateTotal();
  
  if (total >= state.budgetLimit) {
    elements.budgetWarning.textContent = `⚠️ You've reached or exceeded your budget limit of ${formatRupiah(state.budgetLimit)}! Total spending: ${formatRupiah(total)}`;
    elements.budgetWarning.classList.add('visible');
    elements.totalAmount.parentElement.classList.add('warning');
  } else {
    elements.budgetWarning.classList.remove('visible');
    elements.totalAmount.parentElement.classList.remove('warning');
  }
}

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==========================================
// Chart Functions
// ==========================================
function updateChart() {
  const data = prepareChartData();
  
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  // Check if chart should be hidden (no data)
  if (state.transactions.length === 0) {
    elements.chartCanvas.style.display = 'none';
    elements.chartCanvas.parentElement.innerHTML = '<div class="chart-placeholder"><p>No spending data available. Add transactions to see your spending breakdown.</p></div>';
    return;
  }
  
  elements.chartCanvas.style.display = 'block';
  
  const ctx = elements.chartCanvas.getContext('2d');
  
  // Theme-aware colors
  const colors = getChartColors();
  
  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: getComputedStyle(document.body).getPropertyValue('--text-color'),
            padding: 15,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${formatRupiah(value)} (${percentage}%)`;
            }
          }
        }
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  });
}

function prepareChartData() {
  const categoryData = {};
  
  // Group amounts by category
  state.transactions.forEach(transaction => {
    const category = transaction.category;
    if (!categoryData[category]) {
      categoryData[category] = 0;
    }
    categoryData[category] += parseFloat(transaction.amount);
  });
  
  // Get top 10 categories, group rest as "Other"
  const entries = Object.entries(categoryData);
  const sortedEntries = entries.sort((a, b) => b[1] - a[1]);
  
  const topCategories = sortedEntries.slice(0, 10);
  const otherEntries = sortedEntries.slice(10);
  
  const labels = topCategories.map(entry => entry[0]);
  const values = topCategories.map(entry => entry[1]);
  
  // Add "Other" category if there are more than 10 categories
  if (otherEntries.length > 0) {
    const otherAmount = otherEntries.reduce((sum, entry) => sum + entry[1], 0);
    labels.push('Other');
    values.push(otherAmount);
  }
  
  return { labels, values };
}

function getChartColors() {
  const baseColors = [
    '#3498db', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6',
    '#1abc9c', '#e67e22', '#34495e', '#d35400', '#7f8c8d'
  ];
  
  // Get current theme text color
  const style = getComputedStyle(document.body);
  const textColor = style.getPropertyValue('--text-color').trim();
  
  // Check if it's dark mode (approximate by checking lightness)
  const isDark = style.getPropertyValue('--bg-color').includes('#1a1a2e');
  
  if (isDark) {
    // Lighter colors for dark mode
    return [
      '#5dade2', '#ec7063', '#58d68d', '#f4d03f', '#af7ac5',
      '#40e0d0', '#f39c12', '#85c1e9', '#e67e22', '#bdc3c7'
    ];
  }
  
  return baseColors;
}

// ==========================================
// Theme Functions
// ==========================================
function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme(state.theme);
  saveTheme();
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
    elements.themeToggle.textContent = '☀️';
    elements.themeToggle.setAttribute('aria-label', 'Switch to light mode');
  } else {
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
    elements.themeToggle.textContent = '🌙';
    elements.themeToggle.setAttribute('aria-label', 'Switch to dark mode');
  }
  
  // Update chart with new theme
  updateChart();
}

// ==========================================
// Utility Functions
// ==========================================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initialize on load (already called in DOMContentLoaded)
// This ensures the app is ready when the page loads