// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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

// Add consolidated styles
const style = document.createElement('style');
style.textContent = `
    /* Trip Container Styles (for both public and private) */
    .slider-container {
        position: relative;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        overflow: hidden;
        padding: 20px;
    }

    .trip-slider {
        display: flex;
        gap: 20px;
        overflow-x: auto;
        padding: 10px;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
    }

    /* Generic Trip Card Styles (for both public and private) */
    .trip-card {
        min-width: 300px;
        max-width: 350px;
        background: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
        overflow-wrap: break-word;
        word-break: break-word;
        white-space: normal;
        flex-shrink: 0;
    }

    .trip-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 15px rgba(0,0,0,0.2);
    }

    .trip-card p {
        margin: 8px 0;
        line-height: 1.4;
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
        padding: 10px;
        cursor: pointer;
        font-size: 20px;
        border-radius: 50%;
        transition: background 0.3s;
        z-index: 10;
    }

    .nav-button:hover {
        background: rgba(0, 0, 0, 0.9);
    }

    .prev {
        left: 10px;
    }

    .next {
        right: 10px;
    }

    /* Private Trip Section */
    #private-section-1 {
        padding: 20px;
        max-width: 1200px;
        margin: 20px auto;
    }

    #private-section-1 h2 {
        margin-bottom: 20px;
        color: #333;
        padding-left: 10px;
    }

    /* Message Styles */
    .no-trips-message, .error-message {
        padding: 20px;
        text-align: center;
        color: #666;
        width: 100%;
    }

    .error-message {
        color: #dc3545;
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
        overflow: auto;
        background-color: rgba(0,0,0,0.5);
    }

    .modal-content {
        background-color: #fefefe;
        margin: 10% auto;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        width: 80%;
        max-width: 800px;
        position: relative;
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

    .details-btn {
        background: #00d2ff;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 5px;
        cursor: pointer;
        transition: background 0.3s;
    }

    .details-btn:hover {
        background: #00b8e6;
    }

    /* Section titles */
    .section-title {
        font-size: 24px;
        font-weight: bold;
        margin: 30px 0 15px;
        padding-left: 20px;
        color: #333;
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

function retrieveAndDisplayTrips() {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        console.error('No user email found in localStorage');
        const tripContainer = document.getElementById('trip-container');
        if (tripContainer) {
            tripContainer.innerHTML = '<p class="no-trips-message">Please log in to view trips.</p>';
        }
        return;
    }

    const sanitizedEmail = userEmail.replace(/\./g, ',');
    const tripsRef = ref(database, `travel-bookings/${sanitizedEmail}/public-trips`);
    const tripContainer = document.getElementById('trip-container');

    if (!tripContainer) {
        console.error('Trip container element not found');
        return;
    }

    onValue(tripsRef, (snapshot) => {
        const data = snapshot.val();
        tripContainer.innerHTML = ''; // Clear existing cards
        
        if (!data) {
            tripContainer.innerHTML = '<p class="no-trips-message">No trips found.</p>';
            return;
        }

        // Convert object to array and sort by applyByDate (newest first)
        const trips = Object.entries(data)
            .map(([id, trip]) => ({ id, ...trip }))
            .sort((a, b) => {
                // Convert dates to timestamps for comparison
                const dateA = new Date(a.applyByDate).getTime();
                const dateB = new Date(b.applyByDate).getTime();
                return dateB - dateA; // Sort in descending order (newest first)
            });

        // Create a card for each trip
        trips.forEach(trip => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'trip-card';
            
            // Format dates
            const startDate = new Date(trip.startDate).toLocaleDateString();
            const endDate = new Date(trip.endDate).toLocaleDateString();
            const applyDate = new Date(trip.applyByDate).toLocaleDateString();
            
            // Format gender options
            const genderOptions = Object.entries(trip.gender || {})
                .filter(([_, value]) => value)
                .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
                .join(', ');

            // Card Content
            cardDiv.innerHTML = `
                <p><strong>Traveler Name:</strong> <span>${trip.travelerName || 'N/A'}</span></p>
                <p><strong>Destination:</strong> <span>${trip.destination || 'N/A'}</span></p>
                <p><strong>Start Date:</strong> <span>${startDate}</span></p>
                <p><strong>End Date:</strong> <span>${endDate}</span></p>
                <p><strong>Duration:</strong> <span>${trip.numberOfDays || 'N/A'} days</span></p>
                <p><strong>Max People:</strong> <span>${trip.maxPeople || 'N/A'}</span></p>
                <p><strong>Gender Options:</strong> <span>${genderOptions || 'None selected'}</span></p>
                <p><strong>Travel Essentials:</strong> <span>${trip.savedEssentials || 'None selected'}</span></p>
                <p><strong>Apply By:</strong> <span>${applyDate}</span></p>
                <br>
                <button class="details-btn" data-trip='${JSON.stringify(trip)}'>View More Details</button>
            `;

            tripContainer.appendChild(cardDiv);
        });
        
        document.querySelectorAll('#trip-container .details-btn').forEach(button => {
            button.addEventListener('click', function() {
                const tripData = JSON.parse(this.getAttribute('data-trip'));
                openTripModal(tripData);
            });
        });
    }, (error) => {
        console.error('Error fetching trips:', error);
        tripContainer.innerHTML = '<p class="error-message">Error loading trips. Please try again later.</p>';
    });
}

function retrievePrivateTrips() {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        console.error('No user email found in localStorage');
        const privateSection = document.getElementById('private-section-1');
        if (privateSection) {
            privateSection.innerHTML = '<p class="no-trips-message">Please log in to view private trips.</p>';
        }
        return;
    }

    const sanitizedEmail = userEmail.replace(/\./g, ',');
    const privateTripsRef = ref(database, `travel-bookings/${sanitizedEmail}/private-trips`);
    const privateSection = document.getElementById('private-section-1');
    
    if (!privateSection) {
        console.error('Element with ID "private-section-1" not found');
        return;
    }
    
    // Clear previous content except the heading
    const heading = privateSection.querySelector('h2');
    privateSection.innerHTML = '';
    if (heading) {
        privateSection.appendChild(heading);
    } else {
        const newHeading = document.createElement('h2');
        newHeading.textContent = 'Your Private Trips';
        privateSection.appendChild(newHeading);
    }
    
    // Create slider container for private trips
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'slider-container';
    privateSection.appendChild(sliderContainer);

    // Add navigation buttons
    const prevButton = document.createElement('button');
    prevButton.className = 'nav-button prev';
    prevButton.id = 'private-prev-btn';
    prevButton.innerHTML = '&#9664;';
    sliderContainer.appendChild(prevButton);

    const nextButton = document.createElement('button');
    nextButton.className = 'nav-button next';
    nextButton.id = 'private-next-btn';
    nextButton.innerHTML = '&#9654;';
    sliderContainer.appendChild(nextButton);

    // Create the slider itself
    const tripsSlider = document.createElement('div');
    tripsSlider.className = 'trip-slider';
    tripsSlider.id = 'private-trip-slider';
    sliderContainer.appendChild(tripsSlider);

    onValue(privateTripsRef, (snapshot) => {
        const data = snapshot.val();
        tripsSlider.innerHTML = ''; // Clear existing cards
        
        if (!data) {
            const noTripsMessage = document.createElement('p');
            noTripsMessage.textContent = 'No private trips found.';
            noTripsMessage.className = 'no-trips-message';
            tripsSlider.appendChild(noTripsMessage);
            return;
        }

        // Convert to array and sort by timestamp (if available) or startDate
        const trips = Object.entries(data)
            .map(([id, trip]) => ({ id, ...trip }))
            .sort((a, b) => {
                if (a.timestamp && b.timestamp) {
                    return b.timestamp - a.timestamp; // Sort by timestamp if available
                }
                // Fallback to startDate
                const dateA = new Date(a.startDate || 0).getTime();
                const dateB = new Date(b.startDate || 0).getTime();
                return dateB - dateA;
            });

        trips.forEach(trip => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'trip-card';
            cardDiv.id = `trip-card-${trip.id}`;
            
            // Format dates if they exist
            const startDate = trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'N/A';
            const endDate = trip.endDate ? new Date(trip.endDate).toLocaleDateString() : 'N/A';
            
            // Card Content
            cardDiv.innerHTML = `
                <p><strong>Trip Name:</strong> <span>${trip.tripName || 'N/A'}</span></p>
                <p><strong>Destination:</strong> <span>${trip.destination || 'N/A'}</span></p>
                <p><strong>Start Date:</strong> <span>${startDate}</span></p>
                <p><strong>End Date:</strong> <span>${endDate}</span></p>
                <p><strong>Duration:</strong> <span>${trip.duration || trip.numberOfDays || 'N/A'} days</span></p>
                <p><strong>Activities:</strong> <span>${trip.activities || 'None specified'}</span></p>
                <p><strong>Essentials:</strong> <span>${trip.essentials || trip.savedEssentials || 'None specified'}</span></p>
                <p><strong>Budget:</strong> <span>${trip.budget || 'N/A'}</span></p>
                <p><strong>Currency:</strong> <span>${trip.currency || 'N/A'}</span></p>
                <br>
                <button class="details-btn" data-trip='${JSON.stringify(trip)}'>View More Details</button>
            `;

            tripsSlider.appendChild(cardDiv);
        });
        
        // Add event listeners to the view details buttons
        tripsSlider.querySelectorAll('.details-btn').forEach(button => {
            button.addEventListener('click', function() {
                const tripData = JSON.parse(this.getAttribute('data-trip'));
                openTripModal(tripData);
            });
        });

        // Set up navigation buttons for private trips slider
        const privatePrevButton = document.getElementById('private-prev-btn');
        const privateNextButton = document.getElementById('private-next-btn');
        
        if (privatePrevButton && privateNextButton) {
            privatePrevButton.addEventListener('click', () => {
                tripsSlider.scrollBy({ left: -300, behavior: 'smooth' });
            });
            
            privateNextButton.addEventListener('click', () => {
                tripsSlider.scrollBy({ left: 300, behavior: 'smooth' });
            });
        }
    }, (error) => {
        console.error('Error fetching private trips:', error);
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Error loading trips. Please try again later.';
        errorMessage.className = 'error-message';
        tripsSlider.appendChild(errorMessage);
    });
}

function openTripModal(tripData) {
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
    
    if (!tripData) {
        dailyActivitiesContainer.innerHTML = '<p>No trip data available.</p>';
        modal.style.display = 'block';
        return;
    }
    
    // Create header
    const header = document.createElement('h2');
    header.textContent = tripData.tripName || tripData.destination || 'Trip Details';
    dailyActivitiesContainer.appendChild(header);
    
    // Add trip details section
    const detailsSection = document.createElement('div');
    detailsSection.className = 'trip-details';
    
    // Determine if it's a public or private trip based on available properties
    const isPublicTrip = tripData.hasOwnProperty('travelerName') && tripData.hasOwnProperty('applyByDate');
    
    if (isPublicTrip) {
        // Format dates
        const startDate = new Date(tripData.startDate).toLocaleDateString();
        const endDate = new Date(tripData.endDate).toLocaleDateString();
        const applyDate = new Date(tripData.applyByDate).toLocaleDateString();
        
        // Format gender options
        const genderOptions = Object.entries(tripData.gender || {})
            .filter(([_, value]) => value)
            .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
            .join(', ');
            
        detailsSection.innerHTML = `
            <p><strong>Traveler Name:</strong> ${tripData.travelerName || 'N/A'}</p>
            <p><strong>Destination:</strong> ${tripData.destination || 'N/A'}</p>
            <p><strong>Start Date:</strong> ${startDate}</p>
            <p><strong>End Date:</strong> ${endDate}</p>
            <p><strong>Duration:</strong> ${tripData.numberOfDays || 'N/A'} days</p>
            <p><strong>Max People:</strong> ${tripData.maxPeople || 'N/A'}</p>
            <p><strong>Gender Options:</strong> ${genderOptions || 'None selected'}</p>
            <p><strong>Travel Essentials:</strong> ${tripData.savedEssentials || 'None selected'}</p>
            <p><strong>Apply By:</strong> ${applyDate}</p>
        `;
    } else {
        // Format dates for private trip
        const startDate = tripData.startDate ? new Date(tripData.startDate).toLocaleDateString() : 'N/A';
        const endDate = tripData.endDate ? new Date(tripData.endDate).toLocaleDateString() : 'N/A';
        
        detailsSection.innerHTML = `
            <p><strong>Trip Name:</strong> ${tripData.tripName || 'N/A'}</p>
            <p><strong>Destination:</strong> ${tripData.destination || 'N/A'}</p>
            <p><strong>Start Date:</strong> ${startDate}</p>
            <p><strong>End Date:</strong> ${endDate}</p>
            <p><strong>Duration:</strong> ${tripData.duration || tripData.numberOfDays || 'N/A'} days</p>
            <p><strong>Activities:</strong> ${tripData.activities || 'None specified'}</p>
            <p><strong>Essentials:</strong> ${tripData.essentials || tripData.savedEssentials || 'None specified'}</p>
            <p><strong>Budget:</strong> ${tripData.budget || 'N/A'}</p>
            <p><strong>Currency:</strong> ${tripData.currency || 'N/A'}</p>
        `;
    }
    
    dailyActivitiesContainer.appendChild(detailsSection);
    
    // Display additional information if available
    if (tripData.notes || tripData.description) {
        const notesSection = document.createElement('div');
        notesSection.className = 'trip-notes';
        
        const notesTitle = document.createElement('h3');
        notesTitle.textContent = 'Notes';
        notesSection.appendChild(notesTitle);
        
        const notesPara = document.createElement('p');
        notesPara.textContent = tripData.notes || tripData.description || '';
        notesSection.appendChild(notesPara);
        
        dailyActivitiesContainer.appendChild(notesSection);
    }
    
    // Show the modal
    modal.style.display = 'block';
}

// Add modal structure to HTML if not present
function ensureModalExists() {
    if (!document.getElementById('trip-modal')) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="trip-modal" class="modal">
                <div class="modal-content">
                    <span class="close-btn">&times;</span>
                    <div class="daily-activities"></div>
                </div>
            </div>
        `);
        
        // Add event listener for closing modal
        document.querySelector('.close-btn').addEventListener('click', () => {
            document.getElementById('trip-modal').style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('trip-modal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }
}

// Ensure main sections exist
function ensureSectionsExist() {
    // Check and create the public trips section if it doesn't exist
    if (!document.getElementById('public-trips-section')) {
        const publicSection = document.createElement('div');
        publicSection.id = 'public-trips-section';
        
        // Create title
        const publicTitle = document.createElement('h2');
        publicTitle.className = 'section-title';
        publicTitle.textContent = 'Public Trips';
        publicSection.appendChild(publicTitle);
        
        // Create slider container
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';
        publicSection.appendChild(sliderContainer);
        
        // Add navigation buttons for public trips
        const publicPrevButton = document.createElement('button');
        publicPrevButton.className = 'nav-button prev';
        publicPrevButton.id = 'prev-btn';
        publicPrevButton.innerHTML = '&#9664;';
        sliderContainer.appendChild(publicPrevButton);
        
        const publicNextButton = document.createElement('button');
        publicNextButton.className = 'nav-button next';
        publicNextButton.id = 'next-btn';
        publicNextButton.innerHTML = '&#9654;';
        sliderContainer.appendChild(publicNextButton);
        
        // Create the trip container
        const tripContainer = document.createElement('div');
        tripContainer.className = 'trip-slider';
        tripContainer.id = 'trip-container';
        sliderContainer.appendChild(tripContainer);
        
        // Append to body or a specific wrapper
        const wrapper = document.getElementById('app-wrapper') || document.body;
        wrapper.appendChild(publicSection);
    }
    
    // Check and create the private trips section if it doesn't exist
    if (!document.getElementById('private-section-1')) {
        const privateSection = document.createElement('div');
        privateSection.id = 'private-section-1';
        
        // Create title
        const privateTitle = document.createElement('h2');
        privateTitle.textContent = 'Your Private Trips';
        privateSection.appendChild(privateTitle);
        
        // Append to body or a specific wrapper
        const wrapper = document.getElementById('app-wrapper') || document.body;
        wrapper.appendChild(privateSection);
    }
}

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing trips retrieval...');
    
    // Ensure all necessary sections exist
    ensureSectionsExist();
    
    // Ensure modal exists
    ensureModalExists();
    
    // Initialize public trips
    retrieveAndDisplayTrips();
    
    // Initialize private trips
    retrievePrivateTrips();
});