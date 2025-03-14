// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, onValue, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCIIwPjnFskKiEvEIhSb5KXgevBNyduSDk",
    authDomain: "ty-project-80ab7.firebaseapp.com",
    projectId: "ty-project-80ab7",
    storageBucket: "ty-project-80ab7.firebasestorage.app",
    messagingSenderId: "491495110151",
    appId: "1:491495110151:web:035795af4bc8eebff79ca2",
    measurementId: "G-XFS1VYTHSM",
    databaseURL: "https://ty-project-80ab7-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
// 1. Add a new expense
async function addExpense(tripId, expenseData) {
    try {
      const expensesRef = ref(database, `trips/${tripId}/expenses`);
      const newExpenseRef = push(expensesRef);
      
      await set(newExpenseRef, {
        ...expenseData,
        createdAt: serverTimestamp()
      });
      
      return newExpenseRef.key;
    } catch (error) {
      console.error("Error adding expense:", error);
      throw error;
    }
  }
  
  // 2. Get all expenses for a trip
  function getTripExpenses(tripId, callback) {
    const expensesRef = ref(database, `trips/${tripId}/expenses`);
    
    return onValue(expensesRef, (snapshot) => {
      const expenses = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          expenses.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
      }
      
      callback(expenses);
    });
  }
  // 1. Render the budget tracker section
function renderBudgetTracker(tripId, tripData) {
    const budgetSection = document.createElement('div');
    budgetSection.className = 'budget-tracker-section';
    budgetSection.innerHTML = `
      <h3>Budget Tracker</h3>
      <div class="budget-summary-container"></div>
      <div class="expense-list-container"></div>
      <button id="add-expense-btn" class="btn btn-primary">Add Expense</button>
    `;
    
    document.querySelector('.trip-details-container').appendChild(budgetSection);
    
    // Set up event listener for the add expense button
    document.getElementById('add-expense-btn').addEventListener('click', () => {
      showAddExpenseModal(tripId, tripData);
    });
    
    // Load expenses
    getTripExpenses(tripId, (expenses) => {
      renderExpenseList(expenses, tripData.participants);
      renderBalanceSummary(expenses, tripData.participants);
    });
  }
  
  // 2. Show modal for adding a new expense
  function showAddExpenseModal(tripId, tripData) {
    // Create modal HTML
    const modalHTML = `
      <div class="modal" id="expenseModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Add New Expense</h5>
              <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div>
            <div class="modal-body">
              <form id="expense-form">
                <div class="form-group">
                  <label for="expense-name">Expense Name</label>
                  <input type="text" class="form-control" id="expense-name" required>
                </div>
                <div class="form-group">
                  <label for="expense-amount">Amount</label>
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <span class="input-group-text">${tripData.currency || '₹'}</span>
                    </div>
                    <input type="number" class="form-control" id="expense-amount" required>
                  </div>
                </div>
                <div class="form-group">
                  <label for="paid-by">Paid By</label>
                  <select class="form-control" id="paid-by" required>
                    ${generateParticipantOptions(tripData.participants)}
                  </select>
                </div>
                <div class="form-group">
                  <label>Split Among</label>
                  ${generateSplitCheckboxes(tripData.participants)}
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" id="save-expense">Save Expense</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add modal to DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Initialize modal
    const modal = new bootstrap.Modal(document.getElementById('expenseModal'));
    modal.show();
    
    // Handle form submission
    document.getElementById('save-expense').addEventListener('click', () => {
      const expenseName = document.getElementById('expense-name').value;
      const expenseAmount = parseFloat(document.getElementById('expense-amount').value);
      const paidById = document.getElementById('paid-by').value;
      
      // Get selected participants for splitting
      const splitAmong = [];
      document.querySelectorAll('.split-checkbox:checked').forEach(checkbox => {
        splitAmong.push(checkbox.value);
      });
      
      if (!expenseName || isNaN(expenseAmount) || expenseAmount <= 0 || splitAmong.length === 0) {
        alert('Please fill all required fields');
        return;
      }
      
      // Calculate split amounts
      const splitAmount = expenseAmount / splitAmong.length;
      const splits = {};
      
      splitAmong.forEach(userId => {
        splits[userId] = splitAmount;
      });
      
      // Create expense object
      const expenseData = {
        name: expenseName,
        amount: expenseAmount,
        currency: tripData.currency || 'INR',
        paidBy: paidById,
        splits: splits
      };
      
      // Add to database
      addExpense(tripId, expenseData)
        .then(() => {
          modal.hide();
          document.body.removeChild(modalContainer);
        })
        .catch(error => {
          alert('Error adding expense: ' + error.message);
        });
    });
  }
  
  // 3. Helper function to generate participant options for select
  function generateParticipantOptions(participants) {
    return Object.keys(participants).map(userId => {
      const participant = participants[userId];
      return `<option value="${userId}">${participant.email || 'Unknown User'}</option>`;
    }).join('');
  }
  
  // 4. Helper function to generate split checkboxes
  function generateSplitCheckboxes(participants) {
    return Object.keys(participants).map(userId => {
      const participant = participants[userId];
      return `
        <div class="form-check">
          <input class="form-check-input split-checkbox" type="checkbox" value="${userId}" id="split-${userId}" checked>
          <label class="form-check-label" for="split-${userId}">
            ${participant.email || 'Unknown User'}
          </label>
        </div>
      `;
    }).join('');
  }
  
  // 5. Render expense list
  function renderExpenseList(expenses, participants) {
    const container = document.querySelector('.expense-list-container');
    
    if (expenses.length === 0) {
      container.innerHTML = '<p>No expenses added yet.</p>';
      return;
    }
    
    // Sort expenses by date (newest first)
    expenses.sort((a, b) => b.createdAt - a.createdAt);
    
    const expenseListHTML = `
      <h4>Expenses</h4>
      <div class="expense-filters">
        <button class="btn btn-sm btn-outline-secondary active" data-view="list">List View</button>
        <button class="btn btn-sm btn-outline-secondary" data-view="summary">Summary View</button>
      </div>
      <div class="expense-view-container">
        <table class="table expense-table">
          <thead>
            <tr>
              <th>Expense</th>
              <th>Amount</th>
              <th>Paid By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(expense => {
              const paidByUser = participants[expense.paidBy];
              const formattedDate = new Date(expense.createdAt).toLocaleDateString();
              
              return `
                <tr>
                  <td>${expense.name}</td>
                  <td>${expense.amount} ${expense.currency}</td>
                  <td>${paidByUser ? paidByUser.email : 'Unknown'}</td>
                  <td>${formattedDate}</td>
                  <td>
                    <button class="btn btn-sm btn-info view-expense" data-expense-id="${expense.id}">
                      Details
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    container.innerHTML = expenseListHTML;
    
    // Add event listeners for view buttons
    document.querySelectorAll('.view-expense').forEach(button => {
      button.addEventListener('click', () => {
        const expenseId = button.getAttribute('data-expense-id');
        const selectedExpense = expenses.find(e => e.id === expenseId);
        showExpenseDetailsModal(selectedExpense, participants);
      });
    });
    
    // Set up view toggle
    document.querySelectorAll('.expense-filters button').forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        document.querySelectorAll('.expense-filters button').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Switch view based on data-view attribute
        const viewType = button.getAttribute('data-view');
        if (viewType === 'list') {
          renderExpenseListView(expenses, participants);
        } else if (viewType === 'summary') {
          renderExpenseSummaryView(expenses, participants);
        }
      });
    });
  }
  
  // 6. Calculate and render balance summary
  function renderBalanceSummary(expenses, participants) {
    const balances = calculateBalances(expenses, participants);
    const container = document.querySelector('.budget-summary-container');
    
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const currency = expenses.length > 0 ? expenses[0].currency : 'INR';
    
    let summaryHTML = `
      <div class="balance-summary">
        <h4>Balance Summary</h4>
        <p>Total trip expenses: ${totalSpent} ${currency}</p>
        <div class="balances-container">
    `;
    
    // Show individual balances
    Object.keys(balances).forEach(userId => {
      const participant = participants[userId];
      const balance = balances[userId];
      const balanceClass = balance > 0 ? 'positive-balance' : balance < 0 ? 'negative-balance' : '';
      
      summaryHTML += `
        <div class="balance-item ${balanceClass}">
          <span class="user-email">${participant.email || 'Unknown User'}</span>
          <span class="balance-amount">${balance.toFixed(2)} ${currency}</span>
          <span class="balance-status">
            ${balance > 0 ? 'gets back' : balance < 0 ? 'owes' : 'settled up'}
          </span>
        </div>
      `;
    });
    
    // Generate simplified debt resolution
    const transactions = simplifyDebts(balances);
    
    if (transactions.length > 0) {
      summaryHTML += `
        <h5 class="mt-4">To settle up:</h5>
        <ul class="settlement-list">
          ${transactions.map(t => {
            const fromUser = participants[t.from];
            const toUser = participants[t.to];
            return `
              <li>
                <strong>${fromUser.email}</strong> pays 
                <strong>${Math.abs(t.amount).toFixed(2)} ${currency}</strong> to 
                <strong>${toUser.email}</strong>
                <button class="btn btn-sm btn-outline-success settle-transaction" 
                        data-from="${t.from}" 
                        data-to="${t.to}" 
                        data-amount="${t.amount}">
                  Mark as Settled
                </button>
              </li>
            `;
          }).join('')}
        </ul>
      `;
    } else {
      summaryHTML += `<p class="all-settled">All expenses are settled! 🎉</p>`;
    }
    
    summaryHTML += `</div></div>`;
    container.innerHTML = summaryHTML;
    
    // Add event listeners for settle buttons
    document.querySelectorAll('.settle-transaction').forEach(button => {
      button.addEventListener('click', () => {
        const fromId = button.getAttribute('data-from');
        const toId = button.getAttribute('data-to');
        const amount = parseFloat(button.getAttribute('data-amount'));
        
        // Add settlement transaction
        addSettlementTransaction(fromId, toId, Math.abs(amount), currency);
      });
    });
  }
  
  // 7. Calculate balances from expenses
  function calculateBalances(expenses, participants) {
    const balances = {};
    
    // Initialize balances for all participants
    Object.keys(participants).forEach(userId => {
      balances[userId] = 0;
    });
    
    // Process each expense
    expenses.forEach(expense => {
      // Add full amount to payer's balance (they are owed this money)
      balances[expense.paidBy] += expense.amount;
      
      // Subtract each person's share from their balance
      Object.entries(expense.splits).forEach(([userId, splitAmount]) => {
        balances[userId] -= splitAmount;
      });
    });
    
    return balances;
  }
  
  // 8. Simplify debts algorithm
  function simplifyDebts(balances) {
    const transactions = [];
    const debtors = [];
    const creditors = [];
    
    // Separate into debtors and creditors
    Object.entries(balances).forEach(([userId, balance]) => {
      if (balance < 0) {
        debtors.push({ id: userId, amount: balance });
      } else if (balance > 0) {
        creditors.push({ id: userId, amount: balance });
      }
    });
    
    // Sort by absolute amount (largest first)
    debtors.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    creditors.sort((a, b) => b.amount - a.amount);
    
    // Create settlement transactions
    let i = 0, j = 0;
    
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      
      // Find minimum of the two amounts
      const amount = Math.min(Math.abs(debtor.amount), creditor.amount);
      
      if (amount > 0.01) { // Only add non-zero transactions (avoid floating point issues)
        transactions.push({
          from: debtor.id,
          to: creditor.id,
          amount: amount
        });
      }
      
      // Update balances
      debtor.amount += amount;
      creditor.amount -= amount;
      
      // Move to next person if their balance is settled
      if (Math.abs(debtor.amount) < 0.01) i++;
      if (Math.abs(creditor.amount) < 0.01) j++;
    }
    
    return transactions;
  }
  
  // 9. Add settlement transaction
  function addSettlementTransaction(fromId, toId, amount, currency) {
    // Create a settlement expense (special type)
    const settlementData = {
      name: "Settlement Payment",
      amount: amount,
      currency: currency,
      paidBy: fromId,
      isSettlement: true,
      splits: {
        [toId]: amount
      }
    };
    
    // Get the trip ID from the current page URL
    const urlParams = new URLSearchParams(window.location.search);
    const tripId = urlParams.get('tripId');
    
    if (!tripId) {
      alert('Error: Could not determine trip ID');
      return;
    }
    
    addExpense(tripId, settlementData)
      .then(() => {
        alert('Settlement marked as completed!');
      })
      .catch(error => {
        alert('Error recording settlement: ' + error.message);
      });
  }
  
  // 10. Show expense details modal
  function showExpenseDetailsModal(expense, participants) {
    // Create modal HTML with all expense details
    const modalHTML = `
      <div class="modal" id="expenseDetailsModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Expense Details: ${expense.name}</h5>
              <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div>
            <div class="modal-body">
              <p><strong>Amount:</strong> ${expense.amount} ${expense.currency}</p>
              <p><strong>Paid By:</strong> ${participants[expense.paidBy]?.email || 'Unknown'}</p>
              <p><strong>Date:</strong> ${new Date(expense.createdAt).toLocaleString()}</p>
              
              <h6>Split Details:</h6>
              <ul class="split-details-list">
                ${Object.entries(expense.splits).map(([userId, amount]) => `
                  <li>
                    ${participants[userId]?.email || 'Unknown'}: 
                    ${amount} ${expense.currency}
                  </li>
                `).join('')}
              </ul>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add modal to DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Initialize modal
    const modal = new bootstrap.Modal(document.getElementById('expenseDetailsModal'));
    modal.show();
    
    // Clean up when modal is closed
    document.getElementById('expenseDetailsModal').addEventListener('hidden.bs.modal', () => {
      document.body.removeChild(modalContainer);
    });
  }
  function renderExpenseChart(expenses) {
    // Group expenses by category
    const categorizedExpenses = {};
    
    expenses.forEach(expense => {
      const category = expense.category || 'Uncategorized';
      if (!categorizedExpenses[category]) {
        categorizedExpenses[category] = 0;
      }
      categorizedExpenses[category] += expense.amount;
    });
    
    // Prepare data for chart
    const labels = Object.keys(categorizedExpenses);
    const data = Object.values(categorizedExpenses);
    const backgroundColors = generateColorArray(labels.length);
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'expenseChart';
    document.querySelector('.expense-view-container').innerHTML = '';
    document.querySelector('.expense-view-container').appendChild(canvas);
    
    // Create chart
    new Chart(document.getElementById('expenseChart').getContext('2d'), {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Expense Distribution'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${context.label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
  
  // Helper function to generate color array
  function generateColorArray(count) {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#8AC54F', '#F2C14E', '#5D9CEC', '#AC92EC'
    ];
    
    // If we need more colors than in our predefined list
    while (colors.length < count) {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      colors.push(`rgb(${r},${g},${b})`);
    }
    
    return colors.slice(0, count);
  }
  function loadTripDetails(tripId) {
    const tripRef = ref(database, `trips/${tripId}`);
    
    get(tripRef).then((snapshot) => {
      if (snapshot.exists()) {
        const tripData = snapshot.val();
        // Display trip details...
        
        // Initialize budget tracker
        renderBudgetTracker(tripId, tripData);
      } else {
        console.error("Trip not found");
      }
    }).catch((error) => {
      console.error("Error loading trip details:", error);
    });
  }