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

// Add styles
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
// Function to retrieve and display public trips from the logged-in user only
function retrieveAndDisplayPublicTrips() {
  console.log('Fetching your public trips...');
  
  // Get current user email from localStorage
  const currentUserEmail = localStorage.getItem('userEmail');
  if (!currentUserEmail) {
      console.error('User not logged in or email not found in localStorage');
      const tripContainer = document.getElementById('trip-container');
      if (tripContainer) {
          tripContainer.innerHTML = '<p class="error-message">Please log in to view your trips.</p>';
      }
      return;
  }
  
  // Format email to match database structure (if needed)
  const formattedEmail = currentUserEmail.replace(/\./g, ',');
  
  const userTripsRef = ref(database, `travel-bookings/${formattedEmail}/public-trips`);
  const tripContainer = document.getElementById('trip-container');
  
  if (!tripContainer) {
      console.error('Trip container element not found');
      return;
  }
  
  onValue(userTripsRef, (snapshot) => {
      console.log('Data received');
      tripContainer.innerHTML = ''; // Clear existing cards
      
      if (!snapshot.exists()) {
          tripContainer.innerHTML = '<p class="no-trips-message">You have no public trips.</p>';
          return;
      }
      
      const tripsData = snapshot.val();
      let userTrips = [];
      
      // Process user's public trips
      Object.keys(tripsData).forEach(tripId => {
          userTrips.push({ 
              id: tripId,
              userEmail: currentUserEmail,
              ...tripsData[tripId] 
          });
      });
      
      // Sort trips by timestamp or apply date (newest first)
      userTrips.sort((a, b) => {
          if (a.timestamp && b.timestamp) {
              return b.timestamp - a.timestamp;
          }
          // Fallback to applyByDate
          const dateA = new Date(a.applyByDate || 0).getTime();
          const dateB = new Date(b.applyByDate || 0).getTime();
          return dateB - dateA;
      });
      
      if (userTrips.length === 0) {
          tripContainer.innerHTML = '<p class="no-trips-message">You have no public trips.</p>';
          return;
      }
      
      // Create card for each trip
      userTrips.forEach(trip => {
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
              <p><strong>Traveler Name:</strong> <span>${trip.travelerName || 'N/A'}</span></p>
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
      tripContainer.innerHTML = '<p class="error-message">Error loading your trips. Please try again later.</p>';
  });
}
// Function to open modal and display trip details and activities
// Modify the openTripModal function to handle both public and private trips
function openTripModal(tripIdOrData, userEmail) {
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

    modal.style.display = 'block';
    
    // Check if we got a full trip object (private trip) or just an ID (public trip)
    if (typeof tripIdOrData === 'object') {
        // Private trip - we already have the data
        displayTripInModal(tripIdOrData, dailyActivitiesContainer);
    } else {
        // Public trip - need to fetch from Firebase
        const tripId = tripIdOrData;
        if (!tripId || !userEmail) {
            console.error('Missing trip ID or user email for public trip');
            dailyActivitiesContainer.innerHTML = '<h2>Error</h2><p>Trip details not available.</p>';
            return;
        }
        
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

// Update the event listener in retrievePrivateTrips function
// Replace this line in retrievePrivateTrips():
// button.addEventListener('click', function() {
//     const tripData = JSON.parse(this.getAttribute('data-trip'));
//     openTripModal(tripData);
// });
// Ensure modal exists
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

// Ensure public trips section exists
function ensurePublicSectionExists() {
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
        
        // Add navigation buttons
        const prevButton = document.createElement('button');
        prevButton.className = 'nav-button prev';
        prevButton.id = 'prev-btn';
        prevButton.innerHTML = '&#9664;';
        sliderContainer.appendChild(prevButton);
        
        const nextButton = document.createElement('button');
        nextButton.className = 'nav-button next';
        nextButton.id = 'next-btn';
        nextButton.innerHTML = '&#9654;';
        sliderContainer.appendChild(nextButton);
        
        // Create the trip container
        const tripContainer = document.createElement('div');
        tripContainer.className = 'trip-slider';
        tripContainer.id = 'trip-container';
        sliderContainer.appendChild(tripContainer);
        
        // Append to body or a specific wrapper
        const wrapper = document.getElementById('app-wrapper') || document.body;
        wrapper.appendChild(publicSection);
        
        // Set up navigation button functionality
        prevButton.addEventListener('click', () => {
            tripContainer.scrollBy({ left: -300, behavior: 'smooth' });
        });
        
        nextButton.addEventListener('click', () => {
            tripContainer.scrollBy({ left: 300, behavior: 'smooth' });
        });
    }
}

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing public trips display...');
    
    // Ensure public section exists
    ensurePublicSectionExists();
    
    // Ensure modal exists
    ensureModalExists();
    
    // Retrieve and display all public trips
    retrieveAndDisplayPublicTrips();
});
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
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing public trips display...');
    ensurePublicSectionExists();
    ensureModalExists();
    retrieveAndDisplayPublicTrips();
    retrievePrivateTrips(); // Add this line
});
function ensurePrivateSectionExists() {
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
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing public trips display...');
    ensurePublicSectionExists();
    ensurePrivateSectionExists(); // Add this line
    ensureModalExists();
    retrieveAndDisplayPublicTrips();
    retrievePrivateTrips();
});