
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
    const tripsRef = ref(database, 'travel-bookings');
    const tripSection = document.getElementById('public-trip-section');
    
    onValue(tripsRef, (snapshot) => {
        const data = snapshot.val();
        tripSection.style.display = 'block'; // Show the section
        
        // Clear existing cards
        tripSection.innerHTML = '';
        
        if (!data) {
            tripSection.innerHTML = '<p>No trips found.</p>';
            return;
        }

        // Convert object to array and sort by timestamp (newest first)
        const trips = Object.entries(data)
            .map(([id, trip]) => ({ id, ...trip }))
            .sort((a, b) => b.timestamp - a.timestamp);

        // Create a card for each trip
        trips.forEach(trip => {
            // Create a new card div
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

            // Create card content
            cardDiv.innerHTML = `
                <p><strong>Traveler Name:</strong> <span>${trip.travelerName || 'N/A'}</span></p>
                <p><strong>Destination:</strong> <span>${trip.destination || 'N/A'}</span></p>
                <p><strong>Start Date:</strong> <span>${startDate}</span></p>
                <p><strong>End Date:</strong> <span>${endDate}</span></p>
                <p><strong>Duration (Days):</strong> <span>${trip.numberOfDays || 'N/A'}</span></p>
                <p><strong>Maximum People:</strong> <span>${trip.maxPeople || 'N/A'}</span></p>
                <p><strong>Gender Options:</strong> <span>${genderOptions || 'None selected'}</span></p>
                <p><strong>Travel Essentials:</strong> <span>${trip.savedEssentials || 'None selected'}</span></p>
                <p><strong>Last Apply Date:</strong> <span>${applyDate}</span></p>
            `;

            // Add hover effect and click handler if needed
            cardDiv.addEventListener('mouseover', () => {
                cardDiv.style.transform = 'translateY(-5px)';
                cardDiv.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
            });

            cardDiv.addEventListener('mouseout', () => {
                cardDiv.style.transform = 'translateY(0)';
                cardDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            });

            // Append the card to the section
            tripSection.appendChild(cardDiv);
        });
    }, (error) => {
        console.error('Error fetching trips:', error);
        tripSection.innerHTML = '<p>Error loading trips. Please try again later.</p>';
    });
}

// Add styling
const style = document.createElement('style');
style.textContent = `
    #public-trip-section {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        padding: 20px;
        margin-top: 20px;
    }

    .trip-card {
        background: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
    }

    .trip-card p {
        margin: 10px 0;
        line-height: 1.4;
    }

    .trip-card strong {
        color: #333;
    }

    .trip-card span {
        color: #666;
    }

    @media (max-width: 768px) {
        #public-trip-section {
            grid-template-columns: 1fr;
        }
        
        .trip-card {
            margin: 10px;
        }
    }
`;

document.head.appendChild(style);

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Loading trip details...');
    retrieveAndDisplayTrips();
});
