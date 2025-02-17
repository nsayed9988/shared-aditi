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
             `;
 
             tripContainer.appendChild(cardDiv);
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