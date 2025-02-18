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
 
 function retrieveAndDisplayTrips() {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        console.error('No user email found in localStorage');
        const tripContainer = document.getElementById('trip-container');
        tripContainer.innerHTML = '<p>Please log in to view trips.</p>';
        return;
    }

    const sanitizedEmail = userEmail.replace(/\./g, ',');
    const tripsRef = ref(database, `travel-bookings/${sanitizedEmail}/public-trips`);
    const tripContainer = document.getElementById('trip-container');
 
     onValue(tripsRef, (snapshot) => {
         const data = snapshot.val();
         tripContainer.innerHTML = ''; // Clear existing cards
         
         if (!data) {
             tripContainer.innerHTML = '<p>No trips found.</p>';
             return;
         }
 
         // Convert object to array and sort by timestamp (newest first)
         const trips = Object.entries(data)
             .map(([id, trip]) => ({ id, ...trip }))
             .sort((a, b) => b.timestamp - a.timestamp);
 
         // Create a card for each trip
         trips.forEach(trip => {
             const cardDiv = document.createElement('div');
             cardDiv.className = 'trip-card';
             
             // Format dates
             const startDate = new Date(trip.startDate).toLocaleDateString();
             const endDate = new Date(trip.endDate).toLocaleDateString();
             const applyDate = new Date(trip.applyByDate).toLocaleDateString();
             
             // Format gender options
             const genderOptions = Object.entries(trip.gender)
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
                 <button style="text-align:right"><strong>View More Details</strong></button>
                 
             `;
 
             tripContainer.appendChild(cardDiv);
         });
         document.querySelectorAll('.details-btn').forEach(button => {
            button.addEventListener('click', function () {
                const tripData = JSON.parse(this.getAttribute('data-trip'));
                openTripModal(tripData);
            });
        });
     }, (error) => {
         console.error('Error fetching trips:', error);
         tripContainer.innerHTML = '<p>Error loading trips. Please try again later.</p>';
     });
 }
 
 
 // Add styling
 const style = document.createElement('style');
 style.textContent = `
     .slider-container {
         position: relative;
         width: 100%;
         overflow: hidden;
         padding: 20px;
     }
 
     #trip-container {
         display: flex;
         gap: 15px;
         overflow-x: auto;
         padding: 10px;
         scroll-behavior: smooth;
         white-space: nowrap;
     }
 
  .trip-card {
    min-width: 300px;
    max-width: 350px; /* Allow some flexibility */
    background: white;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
    overflow-wrap: break-word; /* Ensures long words break properly */
    word-break: break-word; /* Forces long text to wrap */
    white-space: normal; /* Allows text to wrap */
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
     }
 
     .trip-card span {
         color: #666;
     }
 
     /* Custom Scrollbar */
     #trip-container::-webkit-scrollbar {
         height: 8px;
     }
 
     #trip-container::-webkit-scrollbar-track {
         background: #f1f1f1;
         border-radius: 5px;
     }
 
     #trip-container::-webkit-scrollbar-thumb {
         background: #888;
         border-radius: 5px;
     }
 
     #trip-container::-webkit-scrollbar-thumb:hover {
         background: #555;
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
 
     @media (max-width: 768px) {
         .trip-card {
             min-width: 250px;
         }
 
         .nav-button {
             display: none; /* Hide buttons on smaller screens */
         }
     }
 `;
 
 document.head.appendChild(style);
 
 // Add navigation buttons
 document.addEventListener('DOMContentLoaded', () => {
     console.log('Loading trip details...');
     retrieveAndDisplayTrips();
 
     const container = document.getElementById('trip-container');
     const prevButton = document.getElementById('prev-btn');
     const nextButton = document.getElementById('next-btn');
 
     prevButton.addEventListener('click', () => {
         container.scrollBy({ left: -300, behavior: 'smooth' });
     });
 
     nextButton.addEventListener('click', () => {
         container.scrollBy({ left: 300, behavior: 'smooth' });
     });
 });

 function retrievePrivateTrips() {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        console.error('No user email found in localStorage');
        return;
    }

    const sanitizedEmail = userEmail.replace(/\./g, ',');
    const privateTripsRef = ref(database, `travel-bookings/${sanitizedEmail}/private-trips`);
    const tripSection = document.getElementById('private-section-1');
    const templateCard = document.getElementById('trip-card-container');

    onValue(privateTripsRef, (snapshot) => {
        const data = snapshot.val();
        
        // Remove any existing cards except the template
        const existingCards = tripSection.querySelectorAll('.trip-card:not(#trip-card-container)');
        existingCards.forEach(card => card.remove());

        if (!data) {
            const noTripsMessage = document.createElement('p');
            noTripsMessage.textContent = 'No private trips found.';
            noTripsMessage.className = 'no-trips-message';
            tripSection.appendChild(noTripsMessage);
            return;
        }

        // Convert to array and sort by timestamp
        const trips = Object.entries(data)
            .map(([id, trip]) => ({ id, ...trip }))
            .sort((a, b) => b.timestamp - a.timestamp);

        trips.forEach(trip => {
            // Clone the template card
            const newCard = templateCard.cloneNode(true);
            newCard.id = `trip-card-${trip.id}`;
            newCard.style.display = 'block';

            // Update card content
            newCard.querySelector('#card-trip-name').textContent = trip.tripName || 'N/A';
            newCard.querySelector('#priv-card-destination').textContent = trip.destination || 'N/A';
            newCard.querySelector('#priv-card-start-date').textContent = trip.startDate || 'N/A';
            newCard.querySelector('#priv-card-end-date').textContent = trip.endDate || 'N/A';
            newCard.querySelector('#priv-card-duration').textContent = trip.duration || 'N/A';
            newCard.querySelector('#card-activities').textContent = trip.activities || 'N/A';
            newCard.querySelector('#priv-card-essentials').textContent = trip.essentials || 'N/A';
            newCard.querySelector('#card-budget').textContent = trip.budget || 'N/A';
            newCard.querySelector('#card-currency').textContent = trip.currency || 'N/A';

            // Add the new card to the section
            tripSection.appendChild(newCard);
        });
    }, (error) => {
        console.error('Error fetching private trips:', error);
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Error loading trips. Please try again later.';
        errorMessage.className = 'error-message';
        tripSection.appendChild(errorMessage);
    });
}

// Add some styles for the cards
const styles = `
    .trip-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        margin: 15px 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.2s ease;
    }

    .trip-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .no-trips-message, .error-message {
        padding: 20px;
        text-align: center;
        color: #666;
    }

    .error-message {
        color: #dc3545;
    }

    #private-section-1 {
        padding: 20px;
    }

    #private-section-1 h2 {
        margin-bottom: 20px;
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing private trips retrieval...');
    retrievePrivateTrips();
});