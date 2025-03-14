
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
        const tripsContainer = document.getElementById('trips-container');
        const modalBackdrop = document.getElementById('modal-backdrop');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        const closeModal = document.getElementById('close-modal');
        const userInfoElement = document.getElementById('user-info');
        const participantsContainer = document.getElementById('participants-container');
        
        // Check for logged in user
        let userEmail = localStorage.getItem('userEmail');
        
        if (!userEmail) {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    userEmail = user.email;
                    localStorage.setItem('userEmail', userEmail);
                    displayUserInfo(userEmail);
                    loadTrips(userEmail);
                } else {
                    tripsContainer.innerHTML = `
                        <div class="no-trips">
                            Please sign in to view your trips.
                        </div>
                    `;
                }
            });
        } else {
            displayUserInfo(userEmail);
            loadTrips(userEmail);
        }
        
        function displayUserInfo(email) {
            if (email) {
                userInfoElement.textContent = `Logged in as: ${email}`;
            }
        }
        
        // Function to load trips from Firebase
        function loadTrips(email) {
            if (!email) return;
            
            // Format email for Firebase path
            const formattedEmail = email.replace('.', ',');
            
            // Reference to public trips
            const publicTripsRef = ref(database, `travel-bookings/${formattedEmail}/public-trips`);
            
            onValue(publicTripsRef, (snapshot) => {
                tripsContainer.innerHTML = '';
                
                if (!snapshot.exists()) {
                    tripsContainer.innerHTML = `
                        <div class="no-trips">
                            You don't have any public trips yet.
                        </div>
                    `;
                    return;
                }
                
                const trips = snapshot.val();
                
                // Loop through trips and create cards
                Object.keys(trips).forEach(tripId => {
                    const tripRef = ref(database, `travel-bookings/${formattedEmail}/public-trips/${tripId}`);
                    
                    get(tripRef).then((tripSnapshot) => {
                        if (tripSnapshot.exists()) {
                            const tripData = tripSnapshot.val();
                            
                            // Create trip card
                            const tripCard = document.createElement('div');
                            tripCard.className = 'trip-card';
                            tripCard.dataset.tripId = tripId;
                            
                            tripCard.innerHTML = `
                                <div class="trip-destination">${tripData.destination || 'Unknown Destination'}</div>
                                <div class="trip-budget">${tripData.currency || '$'} ${tripData.budget || '0'}</div>
                                <div class="trip-date">Apply by: ${tripData.applyByDate || 'Not specified'}</div>
                                
                            `;
                            
                            // Add click event to open modal
                            tripCard.addEventListener('click', () => {
                                openTripModal(tripId, tripData);
                                // Also load participants for this trip
                                loadTripParticipants(tripId);
                            });
                            
                            tripsContainer.appendChild(tripCard);
                        }
                    }).catch(error => {
                        console.error("Error getting trip data:", error);
                    });
                });
            }, (error) => {
                console.error("Error fetching trips:", error);
                tripsContainer.innerHTML = `
                    <div class="no-trips">
                        Error loading trips. Please try again later.
                    </div>
                `;
            });
        }
        
        // Function to open trip modal
        // Function to open trip modal
function openTripModal(tripId, tripData) {
    modalTitle.textContent = tripData.destination || 'Trip Details';
    
    // Format the modal content
    modalContent.innerHTML = `
        <div class="budget-box">
            <h3>Estimated Budget</h3>
            <div class="budget-amount">${tripData.currency || '$'} ${tripData.budget || '0'}</div>
        </div>
        
        <h3>Trip Details</h3>
        <p class="apply-date"><strong>Application Deadline:</strong> ${tripData.applyByDate || 'Not specified'}</p>
    `;
    
    // Show modal
    modalBackdrop.style.display = 'flex';
    
    // Load participants
    loadTripParticipants(tripId);
    
    // Initialize budget tracker
    initBudgetTracker(tripId, tripData);
}
        const participantsRef = ref(database, `participants/${`*authUid*`}`);
        

// Get all participants for the trip
onValue(participantsRef, (snapshot) => {
  const participants = snapshot.val();
  if (participants) {
    // Loop through all user IDs
    Object.keys(participants).forEach(authUid => {
      // Access the email for each user
      const userEmail = participants[authUid ].email;
      // Display the email (replace this with your display logic)
      console.log(userEmail);
      alert(userEmail);
    });
  }
});
        
function loadTripParticipants(tripId, email) {
    if (!email) {
        email = localStorage.getItem('userEmail');
    }
    
    const formattedEmail = email.replace('.', ',');
    const participantsRef = ref(database, `travel-bookings/${formattedEmail}/public-trips/${tripId}/participants`);
    
    participantsContainer.innerHTML = '<div class="loading">Loading participants...</div>';
    
    onValue(participantsRef, (snapshot) => {
        if (!snapshot.exists()) {
            participantsContainer.innerHTML = '<div class="no-participants">No confirmed participants yet.</div>';
            return;
        }
        
        const participants = snapshot.val();
        let participantsHTML = `
            <table class="participants-table">
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
            if (participant.email) {  // Only show if email exists
                hasParticipants = true;
                const joinDate = new Date(participant.joinedAt).toLocaleDateString();
                const status = participant.status || 'pending';
                participantsHTML += `
                    <tr>
                        <td>${participant.email}</td>
                        <td>${joinDate}</td>
                        <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
                    </tr>
                `;
            }
        });
        
        participantsHTML += `
                </tbody>
            </table>
        `;
        
        if (!hasParticipants) {
            participantsContainer.innerHTML = '<div class="no-participants">No participants found.</div>';
        } else {
            participantsContainer.innerHTML = participantsHTML;
        }
    }, (error) => {
        console.error("Error loading participants:", error);
        participantsContainer.innerHTML = '<div class="error-message">Failed to load participants.</div>';
    });
}

closeModal.addEventListener('click', () => {
            modalBackdrop.style.display = 'none';
        });
        
        // Close modal if user clicks outside of it
        modalBackdrop.addEventListener('click', (event) => {
            if (event.target === modalBackdrop) {
                modalBackdrop.style.display = 'none';
            }
        });
        // Budget Tracker Functions
let currentTripData = null;
let currentTripId = null;

// Updated function to initialize budget tracker
function initBudgetTracker(tripId, tripData) {
    currentTripId = tripId;
    currentTripData = tripData;
    
    // Setup tab navigation with new IDs
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            if (tabId === 'travel-budget-summary-tab') {
                getTripExpenses(tripId, (expenses) => {
                    renderBalanceSummary(expenses, tripData.participants || {});
                });
            }
        });
    });
    
    // Setup add expense form with new IDs
    const showAddExpenseBtn = document.getElementById('travel-budget-show-add-expense');
    const expenseFormContainer = document.getElementById('travel-budget-expense-form-container');
    const expenseForm = document.getElementById('travel-budget-expense-form');
    const cancelExpenseBtn = document.getElementById('travel-budget-cancel-expense');
    
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

// Updated function to populate participant dropdowns
function populateParticipantDropdowns(participants) {
    const paidBySelect = document.getElementById('travel-budget-paid-by');
    const splitCheckboxes = document.getElementById('travel-budget-split-among-checkboxes');
    
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
        checkboxDiv.className = 'checkbox-item';
        checkboxDiv.innerHTML = `
            <input type="checkbox" id="travel-budget-split-${userId}" class="split-checkbox" value="${userId}" checked>
            <label for="travel-budget-split-${userId}">${email}</label>
        `;
        splitCheckboxes.appendChild(checkboxDiv);
    });
}


// Function to save a new expense
// Updated function to save expense
function saveExpense(tripId, tripData) {
    const expenseName = document.getElementById('travel-budget-expense-name').value;
    const expenseAmount = parseFloat(document.getElementById('travel-budget-expense-amount').value);
    const paidById = document.getElementById('travel-budget-paid-by').value;
    
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
    
    const expenseData = {
        name: expenseName,
        amount: expenseAmount,
        currency: tripData.currency || 'USD',
        paidBy: paidById,
        splits: splits,
        createdAt: Date.now()
    };
    
    const userEmail = localStorage.getItem('userEmail');
    const formattedEmail = userEmail.replace('.', ',');
    
    
    // Get current trip participants to validate expense belongs to this trip
    const tripParticipantsRef = ref(database, `travel-bookings/${formattedEmail}/public-trips/${tripId}/participants`);
    
    get(tripParticipantsRef).then((snapshot) => {
        if (!snapshot.exists()) {
            alert('Error: Could not verify trip participants');
            return;
        }
        
        const tripParticipants = snapshot.val();
        
        // Verify that all people in the expense are actually in this trip
        const allParticipantsValid = [paidById, ...splitAmong].every(userId => 
            tripParticipants[userId] !== undefined
        );
        
        if (!allParticipantsValid) {
            alert('Error: Some selected participants are not part of this trip');
            return;
        }
        
        // Add new expense with generated ID
        const newExpenseId = 'exp_' + Date.now();
        expenseData.id = newExpenseId;
        
        // Save expense only to the specific trip
        const tripExpensesRef = ref(database, `travel-bookings/${formattedEmail}/public-trips/${tripId}/expenses/${newExpenseId}`);
        
        set(tripExpensesRef, expenseData)
            .then(() => {
                // Reset form and hide it
                document.getElementById('expense-form').reset();
                document.getElementById('expense-form-container').style.display = 'none';
                document.getElementById('show-add-expense').style.display = 'block';
                
                // Refresh expenses list
                loadExpenses(tripId);
            })
            .catch(error => {
                alert('Error adding expense: ' + error.message);
            });
    }).catch(error => {
        alert('Error verifying trip participants: ' + error.message);
    });
}

// Function to load expenses for a trip


function loadExpenses(tripId) {
    const userEmail = localStorage.getItem('userEmail');
    const formattedEmail = userEmail.replace('.', ',');
    
    // Reference to expenses
    const expensesRef = ref(database, `travel-bookings/${formattedEmail}/public-trips/${tripId}/expenses`);
    
    onValue(expensesRef, (snapshot) => {
        const expensesList = document.getElementById('expenses-list');
        
        if (!snapshot.exists()) {
            expensesList.innerHTML = `
                <div class="expense-item" style="text-align: center; color: #888;">
                    No expenses added yet.
                </div>
            `;
            return;
        }
        
        const expenses = [];
        snapshot.forEach((childSnapshot) => {
            const expense = childSnapshot.val();
            expenses.push(expense);
        });
        
        // Sort expenses by date (newest first)
        expenses.sort((a, b) => b.createdAt - a.createdAt);
        
        // Get trip data to access participants
        get(ref(database, `travel-bookings/${formattedEmail}/public-trips/${tripId}`))
            .then((tripSnapshot) => {
                const tripData = tripSnapshot.val();
                renderExpenseList(expenses, tripData.participants || {});
                
                // Also update the summary tab
                renderBalanceSummary(expenses, tripData.participants || {});
            });
    });
}

// Function to render the expense list
function renderExpenseList(expenses, participants) {
    const expensesList = document.getElementById('expenses-list');
    
    if (expenses.length === 0) {
        expensesList.innerHTML = `
            <div class="expense-item" style="text-align: center; color: #888;">
                No expenses added yet.
            </div>
        `;
        return;
    }
    
    let expensesHTML = '';
    
    expenses.forEach(expense => {
        const paidByUser = participants[expense.paidBy] || { email: 'Unknown' };
        const formattedDate = new Date(expense.createdAt).toLocaleDateString();
        
        expensesHTML += `
            <div class="expense-item" data-expense-id="${expense.id}">
                <div class="expense-header">
                    <span class="expense-name">${expense.name}</span>
                    <span class="expense-amount">${expense.currency} ${expense.amount.toFixed(2)}</span>
                </div>
                <div class="expense-details">
                    <span class="paid-by">Paid by: ${paidByUser.email}</span>
                    <span class="expense-date">${formattedDate}</span>
                </div>
                <button class="btn-info view-expense-details">Details</button>
            </div>
        `;
    });
    
    expensesList.innerHTML = expensesHTML;
    
    // Add event listeners for viewing expense details
    document.querySelectorAll('.view-expense-details').forEach(button => {
        button.addEventListener('click', (e) => {
            const expenseId = e.target.closest('.expense-item').getAttribute('data-expense-id');
            const expense = expenses.find(exp => exp.id === expenseId);
            showExpenseDetailsModal(expense, participants);
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
                    <button class="close-details" style="background: none;
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
    detailsModalContainer.className = 'details-modal-container';
    detailsModalContainer.innerHTML = detailsModalHTML;
    document.body.appendChild(detailsModalContainer);
    
    // Show modal
    setTimeout(() => {
        detailsModalContainer.classList.add('active');
    }, 10);
    
    // Add close event
    detailsModalContainer.querySelector('.close-details').addEventListener('click', () => {
        detailsModalContainer.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(detailsModalContainer);
        }, 300);
    });
    
    // Close on click outside
    detailsModalContainer.addEventListener('click', (e) => {
        if (e.target === detailsModalContainer) {
            detailsModalContainer.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(detailsModalContainer);
            }, 300);
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
    const balancesList = document.getElementById('balances-list');
    const settlementsList = document.getElementById('settlements-list');
    
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
  
  
  