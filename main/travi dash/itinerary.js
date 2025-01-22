import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// Firebase configuration
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
const db = getDatabase(app);
const auth = getAuth(app);

//private trips
document.getElementById('sub1').addEventListener('click', function(e) {
    e.preventDefault(); // Add this to prevent form submission

    const user = auth.currentUser;
    
    if (!user || !user.email) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    const emailKey = user.email.replace(/\./g, ',');
    
    // Form validation
    const tripname = document.getElementById("name").value.trim();
    const dest = document.getElementById("destination").value.trim();
    const startdate = document.getElementById("dates").value.trim();
    const duration = document.getElementById("duration").value;
    const activities = document.getElementById("activities").value.trim();
    const budget = document.getElementById("budget").value.trim();
    const essentials = document.getElementById("essentials").value.trim();

    // Check if all required fields are filled
    if (!tripname || !dest || !startdate || !duration || !activities || !budget || !essentials) {
        alert("Please fill all required fields");
        return;
    }

    // Save to Firebase
    set(ref(db, `User Profile/${emailKey}/Private Trips/${tripname}`), {
        Trip_Name: tripname,
        Destination: dest,
        Start_Date: startdate,
        Duration: duration,
        Activities: activities,
        Budget: budget,
        Essentials: essentials
    })
    .then(() => {
        alert("Trip saved successfully.");
    })
    .catch((error) => {
        alert("Error saving trip: " + error.message);
    });
});