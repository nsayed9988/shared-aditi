import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getDatabase, ref, get, update, remove } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";// Firebase configuration
import { getDatabase, ref, get, update, remove, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
const firebaseConfig = {
    apiKey: "AIzaSyCIIwPjnFskKiEvEIhSb5KXgevBNyduSDk",
    authDomain: "ty-project-80ab7.firebaseapp.com",
    projectId: "ty-project-80ab7",
    storageBucket: "ty-project-80ab7.firebasestorage.app",
    messagingSenderId: "491495110151",
    appId: "1:491495110151:web:035795af4bc8eebff79ca2",
    measurementId: "G-XFS1VYTHSM"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Initialize the database
const database = getDatabase();

// Helper function to format date
function formatDate(timestamp) {
    if (!timestamp) return 'Unknown date';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Helper function to get badge class based on status
function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'approved':
            return 'bg-success';
        case 'rejected':
            return 'bg-danger';
        case 'pending':
            return 'bg-warning text-dark';
        default:
            return 'bg-secondary';
    }
}

// Helper function to escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Function to load trip requests in the dashboard
async function loadTripRequests() {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
        console.error('User not logged in');
        return;
    }
    
    try {
        // Create container for sent and received requests
        const dashboardContent = `
            <div class="requests-container mb-5">
                <div class="row mb-4">
                    <div class="col-12">
                        <h5 class="text-lg-bold neutral-900">Requests You've Sent</h5>
                        <div id="sent-requests-container" class="mt-3">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-12">
                        <h5 class="text-lg-bold neutral-900">Requests You've Received</h5>
                        <div id="received-requests-container" class="mt-3">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert the containers into the panel body
        document.querySelector('.panel-body').innerHTML = dashboardContent;
        
        // Get all trips data
        const tripsRef = ref(database, 'travel-bookings');
        const snapshot = await get(tripsRef);
        const allData = snapshot.val();
        
        if (!allData) {
            document.getElementById('sent-requests-container').innerHTML = '<p>No requests found.</p>';
            document.getElementById('received-requests-container').innerHTML = '<p>No requests found.</p>';
            return;
        }
        
        // Find sent requests
        const sentRequests = [];
        Object.keys(allData).forEach(userEmail => {
            const userData = allData[userEmail];
            if (userData && userData['public-trips']) {
                Object.keys(userData['public-trips']).forEach(tripId => {
                    const trip = userData['public-trips'][tripId];
                    if (trip.requests && trip.requests[currentUser.uid]) {
                        const request = trip.requests[currentUser.uid];
                        sentRequests.push({
                            tripId: tripId,
                            tripName: trip.travelerName || 'Unnamed Trip',
                            destination: trip.destination || 'Unknown Location',
                            status: request.status,
                            timestamp: request.timestamp,
                            tripCreator: userEmail
                        });
                    }
                });
            }
        });
        
        // Find received requests (where current user is trip creator)
        const receivedRequests = [];
        const normalizedCurrentEmail = currentUser.email.toLowerCase().trim();
        
        // Helper function to sanitize email
        function sanitizeEmail(email) {
            return email.replace(/,/g, '.').toLowerCase().trim();
        }
        
        Object.keys(allData).forEach(userEmail => {
            if (sanitizeEmail(userEmail) === sanitizeEmail(normalizedCurrentEmail)) {
                const userData = allData[userEmail];
                if (userData && userData['public-trips']) {
                    Object.keys(userData['public-trips']).forEach(tripId => {
                        const trip = userData['public-trips'][tripId];
                        if (trip.requests) {
                            Object.keys(trip.requests).forEach(requesterId => {
                                const request = trip.requests[requesterId];
                                receivedRequests.push({
                                    tripId: tripId,
                                    tripName: trip.travelerName  || 'Unnamed Trip',
                                    destination: trip.destination || 'Unknown Location',
                                    status: request.status,
                                    timestamp: request.timestamp,
                                    requesterEmail: request.requesterEmail,
                                    requesterId: requesterId
                                });
                            });
                        }
                    });
                }
            }
        });
        
        // Render sent requests
        if (sentRequests.length > 0) {
            const sentRequestsHTML = sentRequests.map(request => `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title">${escapeHtml(request.tripName)}</h6>
                                <p class="card-text">Destination: ${escapeHtml(request.destination)}</p>
                                <p class="card-text text-muted">Requested to: ${request.tripCreator}</p>
                                <p class="card-text text-muted">Requested on: ${formatDate(request.timestamp)}</p>
                            </div>
                            <div>
     // In your sentRequestsHTML construction, replace the conflicting buttons with:
<button class="btn btn-outline-success view-details-btn" 
        data-trip-id="${request.tripId}" 
        data-user-email="${request.tripCreator}">
    View Details
</button>
                                <span class="badge ${getStatusBadgeClass(request.status)}">${request.status.toUpperCase()}</span>
                                ${request.status === 'pending' ? 
                                    `<button class="btn btn-sm btn-outline-danger ms-2" onclick="cancelRequest('${request.tripCreator}', '${request.tripId}')">Cancel</button>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
            document.getElementById('sent-requests-container').innerHTML = sentRequestsHTML;
        } else {
            document.getElementById('sent-requests-container').innerHTML = '<p>You haven\'t sent any requests yet.</p>';
        }
        
        // Render received requests
        if (receivedRequests.length > 0) {
            const receivedRequestsHTML = receivedRequests.map(request => `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title">${escapeHtml(request.tripName)}</h6>
                                <p class="card-text">From: ${escapeHtml(request.requesterEmail)}</p>
                                <p class="card-text text-muted">Requested on: ${formatDate(request.timestamp)}</p>
                            </div>
                            <div>
                                ${request.status === 'pending' ? `
                                    <button class="btn btn-sm btn-success me-2" onclick="respondToRequest('${request.tripId}', '${request.requesterId}', 'approved')">Approve</button>
                                    <button class="btn btn-sm btn-danger" onclick="respondToRequest('${request.tripId}', '${request.requesterId}', 'rejected')">Reject</button>
                                ` : `
                                    <span class="badge ${getStatusBadgeClass(request.status)}">${request.status.toUpperCase()}</span>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
            document.getElementById('received-requests-container').innerHTML = receivedRequestsHTML;
        } else {
            document.getElementById('received-requests-container').innerHTML = '<p>You haven\'t received any requests yet.</p>';
        }
        
    } catch (error) {
        console.error('Error loading trip requests:', error);
        document.querySelector('.panel-body').innerHTML = `
            <div class="alert alert-danger" role="alert">
                Failed to load trip requests. Please try again later.
            </div>
        `;
    }
}

// Function to cancel a request
window.cancelRequest = async function(tripCreatorEmail, tripId) {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
        alert('Please log in to cancel requests');
        return;
    }
    
    if (!confirm('Are you sure you want to cancel this request?')) {
        return;
    }
    
    try {
        // Sanitize email to handle potential typos
        function sanitizeEmail(email) {
            return email.replace(/,/g, '.').toLowerCase().trim();
        }
        
        const tripsRef = ref(database, 'travel-bookings');
        const snapshot = await get(tripsRef);
        const allData = snapshot.val();
        
        // Find the actual creator email with proper formatting
        let actualCreatorEmail = null;
        Object.keys(allData).forEach(userEmail => {
            if (sanitizeEmail(userEmail) === sanitizeEmail(tripCreatorEmail)) {
                actualCreatorEmail = userEmail;
            }
        });
        
        if (!actualCreatorEmail) {
            throw new Error('Trip creator not found');
        }
        
        const requestRef = ref(
            database,
            `travel-bookings/${actualCreatorEmail}/public-trips/${tripId}/requests/${currentUser.uid}`
        );
        
        // Remove the request
        await remove(requestRef);
        alert('Request cancelled successfully');
        
        // Reload requests
        loadTripRequests();
    } catch (error) {
        console.error('Error cancelling request:', error);
        alert('Failed to cancel request. Please try again.');
    }
};

// Function to respond to a request
window.respondToRequest = async function(tripId, requesterId, status) {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
        alert('Please log in to respond to requests');
        return;
    }
    
    try {
        // Find the current user's email in the database
        const sanitizedCurrentEmail = currentUser.email.replace(/,/g, '.').toLowerCase().trim();
        const tripsRef = ref(database, 'travel-bookings');
        const snapshot = await get(tripsRef);
        const allData = snapshot.val();
        
        // Find actual user email as stored in database
        let actualUserEmail = null;
        Object.keys(allData).forEach(userEmail => {
            const sanitizedEmail = userEmail.replace(/,/g, '.').toLowerCase().trim();
            if (sanitizedEmail === sanitizedCurrentEmail) {
                actualUserEmail = userEmail;
            }
        });
        
        if (!actualUserEmail) {
            throw new Error('User not found in database');
        }
        
        // Update request status
        const requestRef = ref(
            database,
            `travel-bookings/${actualUserEmail}/public-trips/${tripId}/requests/${requesterId}`
        );
        
        // Update only the status field
        await update(requestRef, {
            status: status
        });
        
        alert(`Request ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
        
        // Reload requests
        loadTripRequests();
    } catch (error) {
        console.error('Error responding to request:', error);
        alert('Failed to respond to request. Please try again.');
    }
};

// Run the request loading when page is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load the requests view if on the dashboard page
    const panelBody = document.querySelector('.panel-white .panel-body');
    if (panelBody) {
        // Initialize after a short delay to ensure auth is ready
        setTimeout(() => {
            if (auth.currentUser) {
                loadTripRequests();
            } else {
                console.log("User not logged in yet, waiting...");
                // Add auth state change listener
                auth.onAuthStateChanged((user) => {
                    if (user) {
                        loadTripRequests();
                    }
                });
            }
        }, 1000);
    }
});


const style = document.createElement('style');
style.textContent = `
/* Trip Container Styles */
.slider-container {
    position: relative;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    overflow: hidden;
    padding: 20px;
    background: linear-gradient(to right, #f0f8ff, #e6f7ff); /* Soft gradient background */
    border-radius: 15px;
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1); /* Soft shadow for depth */
}

.trip-slider {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    padding: 10px;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
}

/* Trip Card Styles */
.trip-card {
    min-width: 300px;
    max-width: 350px;
    background: white;
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1); /* Elevated shadow */
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    overflow-wrap: break-word;
    word-break: break-word;
    white-space: normal;
    flex-shrink: 0;
    background: #ffffff;
    border: 1px solid #f1f1f1; /* Subtle border */
}

.trip-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2);
}

.trip-card p {
    margin: 8px 0;
    line-height: 1.6;
    color: #444;
}

.trip-card strong {
    color: #333;
    font-weight: 600;
}

.trip-card span {
    color: #666;
}

/* Navigation Buttons */
.nav-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    padding: 12px;
    cursor: pointer;
    font-size: 24px;
    border-radius: 50%;
    transition: background 0.3s ease, transform 0.2s ease;
    z-index: 10;
}

.nav-button:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1); /* Slight zoom effect on hover */
}

.prev {
    left: 10px;
}

.next {
    right: 10px;
}

/* Message Styles */
.no-trips-message, .error-message {
    padding: 20px;
    text-align: center;
    color: #666;
    width: 100%;
    font-size: 18px;
}

.error-message {
    color: #dc3545;
    font-weight: bold;
}

/* Modal Styles */
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
    background-color: #fefefe;
    margin: 10% auto;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    width: 80%;
    max-width: 800px;
    position: relative;
    transition: all 0.3s ease;
}

.modal-content:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15); /* Subtle hover effect */
}

.close-btn {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
}

.close-btn:hover,
.close-btn:focus {
    color: black;
    text-decoration: none;
}

.daily-activities {
    margin-top: 15px;
}

.trip-details {
    margin: 20px 0;
    padding: 15px;
    border-bottom: 2px solid #f1f1f1;
    background: #f9f9f9;
    border-radius: 5px;
}

.details-btn {
    background: #00d2ff;
    color: white;
    border: none;
    padding: 10px 18px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.2s ease;
    font-size: 16px;
}

.details-btn:hover {
    background: #00b8e6;
    transform: scale(1.05);
}

/* Section title */
.section-title {
    font-size: 26px;
    font-weight: bold;
    margin: 30px 0 15px;
    padding-left: 20px;
    color: #333;
    font-family: 'Arial', sans-serif;
    letter-spacing: 1px;
}

/* Custom Scrollbar */
.trip-slider::-webkit-scrollbar {
    height: 8px;
}

.trip-slider::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 5px;
}

.trip-slider::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 5px;
}

.trip-slider::-webkit-scrollbar-thumb:hover {
    background: #555;
}

/* Responsive Styles */
@media (max-width: 768px) {
    .trip-card {
        min-width: 260px;
    }
    
    .nav-button {
        display: none; /* Hide buttons on smaller screens */
    }
    
    .modal-content {
        width: 95%;
        margin: 5% auto;
    }
}

`;
document.head.appendChild(style);

// Function to retrieve and display public trips from all users
function retrieveAndDisplayPublicTrips() {
    console.log('Fetching all public trips...');
    
    const tripsRef = ref(database, 'travel-bookings');
    const tripContainer = document.getElementById('trip-container');
    
    if (!tripContainer) {
        console.error('Trip container element not found');
        return;
    }
    
    onValue(tripsRef, (snapshot) => {
        console.log('Data received');
        tripContainer.innerHTML = ''; // Clear existing cards
        
        if (!snapshot.exists()) {
            tripContainer.innerHTML = '<p class="no-trips-message">No trips found.</p>';
            return;
        }
        
        const allData = snapshot.val();
        let allTrips = [];
        
        // Collect all public trips from all users
        Object.keys(allData).forEach(userEmail => {
            if (allData[userEmail] && allData[userEmail]['public-trips']) {
                const userTrips = allData[userEmail]['public-trips'];
                Object.keys(userTrips).forEach(tripId => {
                    allTrips.push({ 
                        id: tripId,
                        userEmail: userEmail.replace(/,/g, '.'),
                        ...userTrips[tripId] 
                    });
                });
            }
        });
        
        // Sort trips by timestamp or apply date (newest first)
        allTrips.sort((a, b) => {
            if (a.timestamp && b.timestamp) {
                return b.timestamp - a.timestamp;
            }
            // Fallback to applyByDate
            const dateA = new Date(a.applyByDate || 0).getTime();
            const dateB = new Date(b.applyByDate || 0).getTime();
            return dateB - dateA;
        });
        
        if (allTrips.length === 0) {
            tripContainer.innerHTML = '<p class="no-trips-message">No public trips found.</p>';
            return;
        }
        
        // Create card for each trip
        allTrips.forEach(trip => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'trip-card';
            
            // Format dates
            const startDate = trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'N/A';
            const endDate = trip.endDate ? new Date(trip.endDate).toLocaleDateString() : 'N/A';
            const applyDate = trip.applyByDate ? new Date(trip.applyByDate).toLocaleDateString() : 'N/A';
            
            // Format gender options if they exist
            const genderOptions = trip.gender ? Object.entries(trip.gender)
                .filter(([_, value]) => value)
                .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
                .join(', ') : 'None specified';
            
            cardDiv.innerHTML = `
                <p><strong>Trip Name:</strong> <span>${trip.travelerName || 'N/A'}</span></p>
                <p><strong>Destination:</strong> <span>${trip.destination || 'N/A'}</span></p>
                <p><strong>Start Date:</strong> <span>${startDate}</span></p>
                <p><strong>End Date:</strong> <span>${endDate}</span></p>
                <p><strong>Duration:</strong> <span>${trip.numberOfDays || 'N/A'} days</span></p>
                <p><strong>Max People:</strong> <span>${trip.maxPeople || 'N/A'}</span></p>
                <p><strong>Gender Options:</strong> <span>${genderOptions}</span></p>
                <p><strong>Travel Essentials:</strong> <span>${trip.savedEssentials || 'None selected'}</span></p>
                <p><strong>Apply By:</strong> <span>${applyDate}</span></p>
             
                <br>
                <button class="details-btn" data-trip-id="${trip.id}" data-user-email="${trip.userEmail}">View More Details</button>
            `;
            
            tripContainer.appendChild(cardDiv);
        });
        
        // Add event listeners to the view details buttons
        document.querySelectorAll('.details-btn').forEach(button => {
            button.addEventListener('click', function() {
                const tripId = this.getAttribute('data-trip-id');
                const userEmail = this.getAttribute('data-user-email');
                openTripModal(tripId, userEmail);
            });
        });
    }, (error) => {
        console.error('Error fetching trips:', error);
        tripContainer.innerHTML = '<p class="error-message">Error loading trips. Please try again later.</p>';
    });
}
// Add this after you set the innerHTML in the loadTripRequests function:
document.querySelectorAll('.view-details-btn').forEach(button => {
    button.addEventListener('click', function() {
        const tripId = this.getAttribute('data-trip-id');
        const userEmail = this.getAttribute('data-user-email');
        openTripModal(tripId, userEmail);
    });
});

// Function to retrieve and display public trips from all users
function retrieveAndDisplayPublicTrips() {
    console.log('Fetching all public trips...');
    
    const tripsRef = ref(database, 'travel-bookings');
    const tripContainer = document.getElementById('trip-container');
    
    if (!tripContainer) {
        console.error('Trip container element not found');
        return;
    }
    
    onValue(tripsRef, (snapshot) => {
        console.log('Data received');
        tripContainer.innerHTML = ''; // Clear existing cards
        
        if (!snapshot.exists()) {
            tripContainer.innerHTML = '<p class="no-trips-message">No trips found.</p>';
            return;
        }
        
        const allData = snapshot.val();
        let allTrips = [];
        
        // Collect all public trips from all users
        Object.keys(allData).forEach(userEmail => {
            if (allData[userEmail] && allData[userEmail]['public-trips']) {
                const userTrips = allData[userEmail]['public-trips'];
                Object.keys(userTrips).forEach(tripId => {
                    allTrips.push({ 
                        id: tripId,
                        userEmail: userEmail.replace(/,/g, '.'),
                        ...userTrips[tripId] 
                    });
                });
            }
        });
        
        // Sort trips by timestamp or apply date (newest first)
        allTrips.sort((a, b) => {
            if (a.timestamp && b.timestamp) {
                return b.timestamp - a.timestamp;
            }
            // Fallback to applyByDate
            const dateA = new Date(a.applyByDate || 0).getTime();
            const dateB = new Date(b.applyByDate || 0).getTime();
            return dateB - dateA;
        });
        
        if (allTrips.length === 0) {
            tripContainer.innerHTML = '<p class="no-trips-message">No public trips found.</p>';
            return;
        }
        
        // Create card for each trip
        allTrips.forEach(trip => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'trip-card';
            
            // Format dates
            const startDate = trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'N/A';
            const endDate = trip.endDate ? new Date(trip.endDate).toLocaleDateString() : 'N/A';
            const applyDate = trip.applyByDate ? new Date(trip.applyByDate).toLocaleDateString() : 'N/A';
            
            // Format gender options if they exist
            const genderOptions = trip.gender ? Object.entries(trip.gender)
                .filter(([_, value]) => value)
                .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
                .join(', ') : 'None specified';
            
            cardDiv.innerHTML = `
                <p><strong>Trip Name:</strong> <span>${trip.travelerName || 'N/A'}</span></p>
                <p><strong>Destination:</strong> <span>${trip.destination || 'N/A'}</span></p>
                <p><strong>Start Date:</strong> <span>${startDate}</span></p>
                <p><strong>End Date:</strong> <span>${endDate}</span></p>
                <p><strong>Duration:</strong> <span>${trip.numberOfDays || 'N/A'} days</span></p>
                <p><strong>Max People:</strong> <span>${trip.maxPeople || 'N/A'}</span></p>
                <p><strong>Gender Options:</strong> <span>${genderOptions}</span></p>
                <p><strong>Travel Essentials:</strong> <span>${trip.savedEssentials || 'None selected'}</span></p>
                <p><strong>Apply By:</strong> <span>${applyDate}</span></p>
             
                <br>
                <button class="details-btn" data-trip-id="${trip.id}" data-user-email="${trip.userEmail}">View More Details</button>
            `;
            
            tripContainer.appendChild(cardDiv);
        });
        
        // Add event listeners to the view details buttons
        document.querySelectorAll('.details-btn').forEach(button => {
            button.addEventListener('click', function() {
                const tripId = this.getAttribute('data-trip-id');
                const userEmail = this.getAttribute('data-user-email');
                openTripModal(tripId, userEmail);
            });
        });
    }, (error) => {
        console.error('Error fetching trips:', error);
        tripContainer.innerHTML = '<p class="error-message">Error loading trips. Please try again later.</p>';
    });
}

// Function to open modal and display trip details and activities
function openTripModal(tripId, userEmail) {
    const modal = document.getElementById('trip-modal');
    if (!modal) {
        console.error('Modal element not found');
        return;
    }
    
    const dailyActivitiesContainer = modal.querySelector('.daily-activities');
    if (!dailyActivitiesContainer) {
        console.error('Daily activities container not found in modal');
        return;
    }
    
    // Clear previous content
    dailyActivitiesContainer.innerHTML = '';
    modal.style.display = 'block';
    
    // Format email for Firebase path
    const sanitizedEmail = userEmail.replace(/\./g, ',');
    const tripRef = ref(database, `travel-bookings/${sanitizedEmail}/public-trips/${tripId}`);
    
    get(tripRef).then((snapshot) => {
        if (!snapshot.exists()) {
            dailyActivitiesContainer.innerHTML = '<h2>Error</h2><p>Trip not found.</p>';
            return;
        }
        
        const tripData = snapshot.val();
        displayTripInModal(tripData, dailyActivitiesContainer);
    }).catch((error) => {
        console.error("Error getting trip details:", error);
        dailyActivitiesContainer.innerHTML = '<h2>Error</h2><p>Failed to load trip details. Please try again.</p>';
    });
}

// Helper function to display trip data in the modal
function displayTripInModal(tripData, container) {
    let activitiesHTML = `<h3>${tripData.destination || tripData.tripName || 'Trip Details'}</h3>`;
    
    // Basic trip details
    activitiesHTML += `
        <div class="trip-details">
            <p><strong>Traveler/Trip Name:</strong> ${tripData.travelerName || tripData.tripName || 'N/A'}</p>
            <p><strong>Destination:</strong> ${tripData.destination || 'N/A'}</p>
            <p><strong>Start Date:</strong> ${tripData.startDate ? new Date(tripData.startDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>End Date:</strong> ${tripData.endDate ? new Date(tripData.endDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Duration:</strong> ${tripData.numberOfDays || tripData.duration || 'N/A'} days</p>
    `;
    
    // Conditionally add fields that might only exist in one type of trip
    if (tripData.maxPeople) {
        activitiesHTML += `<p><strong>Max People:</strong> ${tripData.maxPeople}</p>`;
    }
    
    if (tripData.gender) {
        const genderOptions = Object.entries(tripData.gender)
            .filter(([_, value]) => value)
            .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
            .join(', ');
        activitiesHTML += `<p><strong>Gender Options:</strong> ${genderOptions || 'None specified'}</p>`;
    }
    
    if (tripData.budget) {
        activitiesHTML += `<p><strong>Budget:</strong> ${tripData.budget} ${tripData.currency || ''}</p>`;
    }
    
    activitiesHTML += `
        <p><strong>Travel Essentials:</strong> ${tripData.savedEssentials || tripData.essentials || 'None selected'}</p>
    `;
    
    if (tripData.applyByDate) {
        activitiesHTML += `<p><strong>Apply By:</strong> ${new Date(tripData.applyByDate).toLocaleDateString()}</p>`;
    }
    
    activitiesHTML += `</div>`;
    
    // Display daily activities if available
    if (tripData.dayActivities) {
        activitiesHTML += `<h3>Daily Activities</h3>`;
        
        const sortedDays = Object.keys(tripData.dayActivities)
            .filter(key => key.startsWith('day'))
            .sort((a, b) => parseInt(a.replace('day', '')) - parseInt(b.replace('day', '')));
        
        sortedDays.forEach(day => {
            activitiesHTML += `
                <div class="trip-details">
                    <p><strong>Day ${day.replace('day', '')}:</strong> ${tripData.dayActivities[day]}</p>
                </div>
            `;
        });
    } else if (tripData.activities) {
        activitiesHTML += `
            <h4>Activities</h4>
            <div class="trip-details">
                <p>${tripData.activities}</p>
            </div>
        `;
    } else {
        activitiesHTML += `<p>No activities specified for this trip.</p>`;
    }
    
    container.innerHTML = activitiesHTML;
}