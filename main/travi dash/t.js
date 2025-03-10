// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, onValue, get, child, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

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
const auth = getAuth(app);

// DOM elements
const tripsContainer = document.getElementById('trips-container-final');
const modalBackdrop = document.getElementById('modal-backdrop-final');
const modalTitle = document.getElementById('modal-title-final');
const modalContent = document.getElementById('modal-content-final');
const closeModal = document.getElementById('close-modal-final');
const userInfoElement = document.getElementById('user-info-final');
const participantsContainer = document.getElementById('participants-container-final');

// Check for logged in user
/*let userEmail = localStorage.getItem('userEmail');
if (!userEmail) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            userEmail = user.email;
            localStorage.setItem('userEmail', userEmail);
            displayUserInfo(userEmail);
            loadAllTrips(userEmail);  // Changed from loadTrips
        } else {
            tripsContainer.innerHTML = `
                <div class="no-trips-final">
                    Please sign in to view your trips.
                </div>
            `;
        }
    });
} else {
    displayUserInfo(userEmail);
    loadAllTrips(userEmail);  // Changed from loadTrips
}*/


onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      const userEmail = user.email;
      // Store user info if needed
      localStorage.setItem('userEmail', userEmail);
      // Display user info and load data
      displayUserInfo(userEmail);
      loadAllTrips(userEmail);
    } else {
      // User is not signed in
      localStorage.removeItem('userEmail'); // Clear any stored data
      // Show sign-in message
      const tripsContainer = document.getElementById('tripsContainer');
      tripsContainer.innerHTML = `
        <div class="no-trips-final">
          Please sign in to view your trips.
        </div>
      `;
      // Redirect to login page if needed
      // window.location.href = '/login.html';
    }
  });

function displayUserInfo(email) {
    if (email) {
        userInfoElement.textContent = `Logged in as: ${email}`;
    }
}

function loadAllTrips(userEmail) {
    if (!userEmail) return;
    
    const formattedEmail = userEmail.replace('.', ',');
    const database = getDatabase();
    const tripsContainer = document.getElementById('trips-container-final');
    tripsContainer.innerHTML = '<div class="loading-final">Loading trips...</div>';
    
    // Object to store all unique trips
    const allTrips = new Map();
    
    // First, get trips created by the user
    const userTripsRef = ref(database, `travel-bookings/${formattedEmail}/public-trips`);
    
    // Function to process and display trips
    const processAndDisplayTrips = () => {
        if (allTrips.size === 0) {
            tripsContainer.innerHTML = `
                <div class="no-trips-final">
                    No trips found.
                </div>
            `;
            return;
        }
        
        tripsContainer.innerHTML = '';
        allTrips.forEach((tripData, tripKey) => {
            const [ownerEmail, tripId] = tripKey.split('|');
            const tripCard = document.createElement('div');
            tripCard.className = 'trip-card-final';
            tripCard.dataset.tripId = tripId;
            tripCard.dataset.ownerEmail = ownerEmail;
            
            const role = ownerEmail === formattedEmail ? 'Creator' : 'Participant';
            
            tripCard.innerHTML = `
                <div class="trip-role-badge-final ${role.toLowerCase()}-badge">${role}</div>
                <div class="trip-destination-final">Trip Name: ${tripData.travelerName || 'Unknown Destination'}</div>
                <div class="trip-destination-final">Country: ${tripData.destination || 'Unknown Destination'}</div>
                <div class="trip-budget-final">${tripData.currency || '$'} ${tripData.budget || '0'}</div>
                <div class="trip-date-final">Apply by: ${tripData.applyByDate || 'Not specified'}</div>
            `;
            
            tripCard.addEventListener('click', () => {
                openTripModal(tripId, tripData, ownerEmail);
            });
            
            tripsContainer.appendChild(tripCard);
        });
    };

    // Get all trips in the database to check for participation
    const allTripsRef = ref(database, 'travel-bookings');
    
    // First, get user's own trips
    get(userTripsRef).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((tripSnapshot) => {
                allTrips.set(`${formattedEmail}|${tripSnapshot.key}`, tripSnapshot.val());
            });
        }
        
        // Then get all trips to check for participation
        return get(allTripsRef);
    }).then((snapshot) => {
        if (snapshot.exists()) {
            const promises = [];
            
            snapshot.forEach((userSnapshot) => {
                const ownerEmail = userSnapshot.key;
                if (userSnapshot.hasChild('public-trips')) {
                    userSnapshot.child('public-trips').forEach((tripSnapshot) => {
                        const tripId = tripSnapshot.key;
                        const participantsRef = ref(database, `travel-bookings/${ownerEmail}/public-trips/${tripId}/participants`);
                        
                        // Check if current user is a participant
                        promises.push(
                            get(participantsRef).then((participantsSnapshot) => {
                                if (participantsSnapshot.exists()) {
                                    const participants = participantsSnapshot.val();
                                    const isParticipant = Object.values(participants).some(
                                        participant => participant.email === userEmail
                                    );
                                    
                                    if (isParticipant && ownerEmail !== formattedEmail) {
                                        allTrips.set(`${ownerEmail}|${tripId}`, tripSnapshot.val());
                                    }
                                }
                            })
                        );
                    });
                }
            });
            
            return Promise.all(promises);
        }
    }).then(() => {
        processAndDisplayTrips();
    }).catch((error) => {
        console.error("Error loading trips:", error);
        tripsContainer.innerHTML = `
            <div class="no-trips-final">
                Error loading trips. Please try again later.
            </div>
        `;
    });
}

// Modified openTripModal function to handle trips where user is participant
function openTripModal(tripId, tripData, ownerEmail) {
    const modalBackdrop = document.getElementById('modal-backdrop-final');
    const modalTitle = document.getElementById('modal-title-final');
    const modalContent = document.getElementById('modal-content-final');
    
    modalTitle.textContent = tripData.destination || 'Trip Details';
    
    modalContent.innerHTML = `
        <div class="budget-box-final">
            <h6>Estimated Budget:<h7> ${tripData.currency || '$'} ${tripData.budget || '0'}</h7></h6>
            <br>
        </div>
        <p class="apply-date-final"><strong>Application Deadline:</strong> ${tripData.applyByDate || 'Not specified'}</p>
        <p class="start-date"><strong>Start Date:</strong> ${tripData.startDate || 'Not specified'}</p>
        <br>
    `;
    
    modalBackdrop.style.display = 'flex';
    
    const closeModal = document.getElementById('close-modal-final');
    const closeModalFunction = () => {
        modalBackdrop.style.display = 'none';
    };
    
    closeModal.removeEventListener('click', closeModalFunction);
    modalBackdrop.removeEventListener('click', closeModalFunction);
    
    closeModal.addEventListener('click', closeModalFunction);
    
    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
            closeModalFunction();
        }
    });
    
    loadTripParticipants(tripId, ownerEmail);
    initBudgetTracker(tripId, tripData, ownerEmail);
}



function loadTripParticipants(tripId, email) {
    if (!email) {
        email = localStorage.getItem('userEmail');
    }

    const formattedEmail = email.replace('.', ',');
    const participantsRef = ref(database, `travel-bookings/${formattedEmail}/public-trips/${tripId}/participants`);

    participantsContainer.innerHTML = '<div class="loading-final">Loading participants...</div>';

    onValue(participantsRef, (snapshot) => {
        if (!snapshot.exists()) {
            participantsContainer.innerHTML = '<div class="no-participants-final">No confirmed participants yet.</div>';
            return;
        }

        const participants = snapshot.val();
        let participantsHTML = `
            <table class="participants-table-final">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Joined Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let hasParticipants = false;
        Object.keys(participants).forEach(authUid => {
            const participant = participants[authUid];
            if (participant.email) {
                hasParticipants = true;
                const joinDate = new Date(participant.joinedAt).toLocaleDateString();
                const status = participant.status || 'pending';
                participantsHTML += `
                    <tr>
                        <td>${participant.email}</td>
                        <td>${joinDate}</td>
                        <td><span class="status-badge-final status-${status.toLowerCase()}-final">${status}</span></td>
                    </tr>
                `;
            }
        });

        participantsHTML += `
                </tbody>
            </table>
        `;

        if (!hasParticipants) {
            participantsContainer.innerHTML = '<div class="no-participants-final">No participants found.</div>';
        } else {
            participantsContainer.innerHTML = participantsHTML;
        }
    });
}

// Budget Tracker Functions
let currentTripData = null;
let currentTripId = null;

/*
function initBudgetTracker(tripId, tripData) {
 currentTripId = tripId;
currentTripData = tripData;
const showAddExpenseBtn = document.getElementById('show-add-expense-final');
const expenseFormContainer = document.getElementById('expense-form-container-final');
const expenseForm = document.getElementById('expense-form-final');
const cancelExpenseBtn = document.getElementById('cancel-expense-final');
// Setup tab navigation
document.querySelectorAll('.tab-button-final').forEach(button => {
button.addEventListener('click', () => {
document.querySelectorAll('.tab-button-final').forEach(btn => btn.classList.remove('active'));
document.querySelectorAll('.tab-content-final').forEach(content => content.classList.remove('active'));
button.classList.add('active');
const tabId = button.getAttribute('data-tab');
document.getElementById(tabId).classList.add('active');
if (tabId === 'summary-tab-final') {
getTripExpenses(tripId, (expenses) => {
renderBalanceSummary(expenses, tripData.participants || {});
 });
 }
 });
 });
showAddExpenseBtn.addEventListener('click', () => {
populateParticipantDropdowns(tripData.participants || {});
expenseFormContainer.style.display = 'block';
showAddExpenseBtn.style.display = 'none';
 });
cancelExpenseBtn.addEventListener('click', () => {
expenseFormContainer.style.display = 'none';
showAddExpenseBtn.style.display = 'block';
expenseForm.reset();
 });
expenseForm.addEventListener('submit', (e) => {
e.preventDefault();
saveExpense(tripId, tripData);
 });
loadExpenses(tripId);
} 




*/

function initBudgetTracker(tripId, tripData) {
    currentTripId = tripId;
    currentTripData = tripData;
    const showAddExpenseBtn = document.getElementById('show-add-expense-final');
    const expenseFormContainer = document.getElementById('expense-form-container-final');
    const expenseForm = document.getElementById('expense-form-final');
    const cancelExpenseBtn = document.getElementById('cancel-expense-final');
    
    // Check if Add Expense button should be disabled
    checkAndUpdateAddExpenseButton(tripData, showAddExpenseBtn);
    
    // Setup tab navigation
    document.querySelectorAll('.tab-button-final').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button-final').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content-final').forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
        if (tabId === 'summary-tab-final') {
          getTripExpenses(tripId, (expenses) => {
            renderBalanceSummary(expenses, tripData.participants || {});
          });
        }
      });
    });
    
    showAddExpenseBtn.addEventListener('click', () => {
      populateParticipantDropdowns(tripData.participants || {});
      expenseFormContainer.style.display = 'block';
      showAddExpenseBtn.style.display = 'none';
    });
    
    cancelExpenseBtn.addEventListener('click', () => {
      expenseFormContainer.style.display = 'none';
      showAddExpenseBtn.style.display = 'block';
      expenseForm.reset();
    });
    
    expenseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveExpense(tripId, tripData);
    });
    
    loadExpenses(tripId);
}
  
  // Helper function to check conditions and update add expense button
function checkAndUpdateAddExpenseButton(tripData, button) {
    const hasParticipants = tripData.participants && Object.keys(tripData.participants).length > 0;
    const isTripInFuture = tripData.startDate ? new Date(tripData.startDate) > new Date() : false;
    
    if (!hasParticipants || isTripInFuture) {
      button.disabled = true;
      button.classList.add('disabled-btn');
      
      // Add tooltip to explain why button is disabled
      let tooltipText = "";
      if (!hasParticipants) {
        tooltipText = "Add participants to enable expense tracking";
      } else if (isTripInFuture) {
        tooltipText = "Expenses can only be added once the trip has started";
      }
      
      button.setAttribute('title', tooltipText);
    } else {
      button.disabled = false;
      button.classList.remove('disabled-btn');
      button.removeAttribute('title');
    }
}

function populateParticipantDropdowns(participants) {
    const paidBySelect = document.getElementById('paid-by-final');
    const splitCheckboxes = document.getElementById('split-among-checkboxes-final');

    paidBySelect.innerHTML = '';
    splitCheckboxes.innerHTML = '';

    const currentUserEmail = localStorage.getItem('userEmail');

    Object.keys(participants).forEach(userId => {
        const participant = participants[userId];
        const email = participant.email || 'Unknown User';

        const option = document.createElement('option');
        option.value = userId;
        option.textContent = email;

        if (email === currentUserEmail) {
            option.selected = true;
        }

        paidBySelect.appendChild(option);

        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'checkbox-item-final';
        checkboxDiv.innerHTML = `
            <input type="checkbox" id="split-${userId}" class="split-checkbox-final" value="${userId}" checked>
            <label for="split-${userId}">${email}</label>
        `;
        splitCheckboxes.appendChild(checkboxDiv);
    });
}

function saveExpense(tripId, tripData) {
    
    const expenseName = document.getElementById('expense-name-final').value;
    const expenseAmount = parseFloat(document.getElementById('expense-amount-final').value);
    const paidById = document.getElementById('paid-by-final').value;

    const splitAmong = [];
    document.querySelectorAll('.split-checkbox-final:checked').forEach(checkbox => {
        splitAmong.push(checkbox.value);
    });

    if (!expenseName || isNaN(expenseAmount) || expenseAmount <= 0 || splitAmong.length === 0) {
        alert('Please fill all required fields');
        return;
    }

    const splitAmount = expenseAmount / splitAmong.length;
    const splits = {};

    splitAmong.forEach(userId => {
        splits[userId] = splitAmount;
    });

    const expenseData = {
        name: expenseName,
        amount: expenseAmount,
        currency: tripData.currency || 'USD',
        paidBy: paidById,
        splits: splits,
        createdAt: Date.now(),
        id: 'exp_' + Date.now()
    };

    const userEmail = localStorage.getItem('userEmail');
    const formattedEmail = userEmail.replace('.', ',');
    const tripExpensesRef = ref(database, `travel-bookings/${formattedEmail}/public-trips/${tripId}/expenses/${expenseData.id}`);
 console.log('saveExpense called at:', Date.now());
    
    set(tripExpensesRef, expenseData)
        .then(() => {
            document.getElementById('expense-form-final').reset();
            document.getElementById('expense-form-container-final').style.display = 'none';
            document.getElementById('show-add-expense-final').style.display = 'block';
            loadExpenses(tripId);
        })
        .catch(error => {
            alert('Error adding expense: ' + error.message);
        });
}

function loadExpenses(tripId) {
    const userEmail = localStorage.getItem('userEmail');
    const formattedEmail = userEmail.replace('.', ',');
    const expensesRef = ref(database, `travel-bookings/${formattedEmail}/public-trips/${tripId}/expenses`);

    onValue(expensesRef, (snapshot) => {
        const expensesList = document.getElementById('expenses-list-final');

        if (!snapshot.exists()) {
            expensesList.innerHTML = `
                <div class="expense-item-final" style="text-align: center; color: #888;">
                    No expenses added yet.
                </div>
            `;
            return;
        }

        const expenses = [];
        snapshot.forEach((childSnapshot) => {
            expenses.push(childSnapshot.val());
        });

        expenses.sort((a, b) => b.createdAt - a.createdAt);

        get(ref(database, `travel-bookings/${formattedEmail}/public-trips/${tripId}`))
            .then((tripSnapshot) => {
                const tripData = tripSnapshot.val();
                renderExpenseList(expenses, tripData.participants || {});
                renderBalanceSummary(expenses, tripData.participants || {});
            });
    });
}

function renderExpenseList(expenses, participants) {
    const expensesList = document.getElementById('expenses-list-final');
    
    // Get participants from the dropdown instead
    const paidByDropdown = document.getElementById('paid-by-final');
    const participantsFromDropdown = {};
    
    // Extract participants information from the dropdown options
    if (paidByDropdown) {
        Array.from(paidByDropdown.options).forEach(option => {
            if (option.value) {
                participantsFromDropdown[option.value] = {
                    id: option.value,
                    email: option.text || option.value
                };
            }
        });
    }
    
    console.log("Participants from dropdown:", participantsFromDropdown);
    
    if (expenses.length === 0) {
        expensesList.innerHTML = `
            <div class="expense-item-final" style="text-align: center; color: #888;">
                No expenses added yet.
            </div>
        `;
        return;
    }
    
    let expensesHTML = '';
    
    expenses.forEach(expense => {
        // Try to get email from the dropdown data
        let paidByEmail = 'Unknown';
        
        if (participantsFromDropdown[expense.paidBy]) {
            paidByEmail = participantsFromDropdown[expense.paidBy].email;
        } else {
            // Fallback to just showing the ID
            paidByEmail = expense.paidBy;
        }
        
        const formattedDate = new Date(expense.createdAt).toLocaleDateString();
        
        expensesHTML += `
            <div class="expense-item-final" data-expense-id="${expense.id}">
                <div class="expense-header-final">
                    <span class="expense-name-final">${expense.name}</span>
                    <span class="expense-amount-final">${expense.currency} ${expense.amount.toFixed(2)}</span>
                </div>
                <div class="expense-details-final">
                    <span class="paid-by-final">Paid by: ${paidByEmail}</span>
                    <span class="expense-date-final">${formattedDate}</span>
                </div>
                <button class="btn-info-final view-expense-details">Details</button>
            </div>
        `;
    });
    
    expensesList.innerHTML = expensesHTML;
    
    document.querySelectorAll('.view-expense-details').forEach(button => {
        button.addEventListener('click', (e) => {
            const expenseId = e.target.closest('.expense-item-final').getAttribute('data-expense-id');
            const expense = expenses.find(exp => exp.id === expenseId);
            showExpenseDetailsModal(expense, participantsFromDropdown);
        });
    });
}


// Function to show expense details modal
function showExpenseDetailsModal(expense, participants) {

    // Create modal HTML
const detailsModalHTML = `
<div class="expense-details-modal">
    <div class="expense-details-content">
        <div class="details-header">
            <h3>${expense.name}</h3>
            <button class="close-details-final" style="background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #7f8c8d;">&times;</button>
        </div>
        <div class="details-body">
            <p><strong>Amount:</strong> ${expense.currency} ${expense.amount.toFixed(2)}</p>
            <p><strong>Paid By:</strong> ${participants[expense.paidBy]?.email || 'Unknown'}</p>
            <p><strong>Date:</strong> ${new Date(expense.createdAt).toLocaleString()}</p>
            
            <h4>Split Details:</h4>
            <ul class="split-details-list">
                ${Object.entries(expense.splits).map(([userId, amount]) => `
                    <li>
                        ${participants[userId]?.email || 'Unknown'}: 
                        ${expense.currency} ${amount.toFixed(2)}
                    </li>
                `).join('')}
            </ul>
        </div>
    </div>
</div>
`;




// Add modal to DOM
const detailsModalContainer = document.createElement('div');
detailsModalContainer.className = 'details-modal-container-final';
detailsModalContainer.innerHTML = detailsModalHTML;
document.body.appendChild(detailsModalContainer);

// Show modal
setTimeout(() => {
detailsModalContainer.classList.add('active');
}, 10);

// Add close button event listener
const closeButton = detailsModalContainer.querySelector('.close-details-final');
closeButton.addEventListener('click', function() {
    detailsModalContainer.classList.remove('active');
    setTimeout(() => {
        if (detailsModalContainer.parentNode) {
            detailsModalContainer.parentNode.removeChild(detailsModalContainer);
        }
    }, 300); // Match this with your CSS transition duration
});

// Add click outside modal to close
detailsModalContainer.addEventListener('click', function(e) {
    if (e.target === detailsModalContainer) {
        closeButton.click();
    }
});

}

// Function to calculate balances
function calculateBalances(expenses, participants) {
const balances = {};

// Initialize balances for all participants
Object.keys(participants).forEach(userId => {
balances[userId] = 0;
});

// Process each expense
expenses.forEach(expense => {
// Add full amount to payer's balance (they are owed this money)
balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;

// Subtract each person's share from their balance
Object.entries(expense.splits).forEach(([userId, splitAmount]) => {
    balances[userId] = (balances[userId] || 0) - splitAmount;
});
});

return balances;
}

// Function to render balance summary
function renderBalanceSummary(expenses, participants) {
const balances = calculateBalances(expenses, participants);
const balancesList = document.getElementById('balances-list-final');
const settlementsList = document.getElementById('settlements-list-final');

if (expenses.length === 0) {
balancesList.innerHTML = '<div class="no-data">No expenses to calculate balances.</div>';
settlementsList.innerHTML = '<div class="no-data">No settlements needed.</div>';
return;
}

const currency = expenses[0].currency || 'USD';

// Render balances
let balancesHTML = '';
Object.keys(balances).forEach(userId => {
const participant = participants[userId] || { email: 'Unknown' };
const balance = balances[userId];
const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral';

balancesHTML += `
    <div class="balance-item ${balanceClass}">
        <span class="user-email">${participant.email}</span>
        <span class="balance-amount">${balance > 0 ? '+' : ''}${balance.toFixed(2)} ${currency}</span>
        <span class="balance-status">
            ${balance > 0 ? 'gets back' : balance < 0 ? 'owes' : 'settled'}
        </span>
    </div>
`;
});

balancesList.innerHTML = balancesHTML || '<div class="no-data">No balances to show.</div>';

// Calculate simplified settlements
const transactions = simplifyDebts(balances);

if (transactions.length === 0) {
settlementsList.innerHTML = '<div class="all-settled">All expenses are settled! 🎉</div>';
return;
}

let settlementsHTML = '';
transactions.forEach(transaction => {
const fromUser = participants[transaction.from] || { email: 'Unknown' };
const toUser = participants[transaction.to] || { email: 'Unknown' };

settlementsHTML += `
    <div class="settlement-item">
        <div class="settlement-details">
            <span class="from-user">${fromUser.email}</span>
            <span class="amount-arrow">→ ${transaction.amount.toFixed(2)} ${currency} →</span>
            <span class="to-user">${toUser.email}</span>
        </div>
        <button class="btn-success mark-settled" data-from="${transaction.from}" data-to="${transaction.to}" data-amount="${transaction.amount}">
            Mark as Settled
        </button>
    </div>
`;
});

settlementsList.innerHTML = settlementsHTML;

// Add event listeners for settle buttons
document.querySelectorAll('.mark-settled').forEach(button => {
button.addEventListener('click', (e) => {
    const fromId = e.target.getAttribute('data-from');
    const toId = e.target.getAttribute('data-to');
    const amount = parseFloat(e.target.getAttribute('data-amount'));
    
    addSettlementTransaction(currentTripId, fromId, toId, amount, currency);
});
});
}

// Function to simplify debts
function simplifyDebts(balances) {
const transactions = [];
const debtors = [];
const creditors = [];

// Separate into debtors and creditors
Object.entries(balances).forEach(([userId, balance]) => {
if (balance < -0.01) {  // Using threshold to avoid floating point issues
    debtors.push({ id: userId, amount: balance });
} else if (balance > 0.01) {
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

if (amount > 0.01) {  // Only add non-zero transactions
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

// Function to add settlement transaction
function addSettlementTransaction(tripId, fromId, toId, amount, currency) {
// Create a settlement expense
const settlementData = {
name: "Settlement Payment",
amount: amount,
currency: currency,
paidBy: fromId,
isSettlement: true,
splits: {
    [toId]: amount
},
createdAt: Date.now(),
id: 'settlement_' + Date.now()
};

// Get current user email
const userEmail = localStorage.getItem('userEmail');
const formattedEmail = userEmail.replace('.', ',');

// Reference to add settlement
const settlementRef = ref(database, `travel-bookings/${formattedEmail}/public-trips/${tripId}/expenses/${settlementData.id}`);

// Save to database
set(settlementRef, settlementData)
.then(() => {
    alert('Settlement marked as completed!');
    // Will automatically update via the onValue listener
})
.catch(error => {
    alert('Error recording settlement: ' + error.message);
});
}

// Function to get trip expenses (used by external functions)
function getTripExpenses(tripId, callback) {
const userEmail = localStorage.getItem('userEmail');
const formattedEmail = userEmail.replace('.', ',');

// Reference to expenses
const expensesRef = ref(database, `travel-bookings/${formattedEmail}/public-trips/${tripId}/expenses`);

get(expensesRef).then((snapshot) => {
const expenses = [];
if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
        expenses.push(childSnapshot.val());
    });
}
callback(expenses);
}).catch(error => {
console.error("Error fetching expenses:", error);
callback([]);
});
}
