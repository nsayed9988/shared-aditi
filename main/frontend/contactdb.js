import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

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
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Console log to verify script is loading
console.log('Contact form script loaded');

// Form handling
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    const contactForm = document.getElementById('contactForm');
    console.log('Form found:', !!contactForm);

    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log('Form submitted');

            // Get form data
            const formData = {
                first_name: document.getElementById('first_name').value.trim(),
                last_name: document.getElementById('last_name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                message: document.getElementById('message').value.trim(),
                submitted_at: new Date().toISOString(),
               
            };

            console.log('Form data:', formData);

            // Basic validation
            if (!formData.first_name || !formData.last_name || !formData.email || !formData.message) {
                alert('Please fill in all required fields');
                return;
            }

            try {
              
                
                // Clear form
                contactForm.reset();
                
                // Success message
                alert('Thank you! Your message has been sent successfully.');
                
            } catch (error) {
                console.error('Error saving to Firestore:', error);
               
            }
        });
    } else {
        console.error('Contact form not found in the document');
    }
});