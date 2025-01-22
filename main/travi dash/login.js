import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

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
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
    // Get form and remember me checkbox
    const loginForm = document.getElementById('login-form');
    const rememberMeCheckbox = document.querySelector('.cb-remember');
    
    if (!loginForm) {
        console.error('Login form not found');
        return;
    }

    // Handle form submission
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        
        const emailInput = document.getElementById("login-username");
        const passwordInput = document.getElementById("login-password");
        
        if (!emailInput || !passwordInput) {
            console.error('Form inputs not found');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Remember me functionality
        if (rememberMeCheckbox && rememberMeCheckbox.checked) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Store user data
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem("loggedIn","true");
            
            // Redirect to dashboard
            window.location.href = "../frontend/index-2.html";
            
        } catch (error) {
            console.log('Login error:', error);

            // Handle authentication errors
            let errorMessage;
            switch(error.code) {
                case 'auth/invalid-credential':
                    errorMessage="Wrong password or email";
                    break
                case 'auth/wrong-password':
                    errorMessage="Wrong password or email";
                    break
                case 'auth/user-not-found':
                    errorMessage = "No account exists with this email";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "Please enter a valid email address.";
                    break;
                case 'auth/user-disabled':
                    errorMessage = "This account has been disabled. Please contact support.";
                    break;
                case 'auth/too-many-requests':
                    errorMessage = "Too many login attempts. Please try again later.";
                    break;
                case 'auth/network-request-failed':
                    errorMessage = "Network error. Please check your internet connection.";
                    break;
                default:
                    errorMessage = "An error occurred during login. Please try again.";
            }
            alert(errorMessage);
        }
    });

    // Handle remembered email on page load
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        const emailInput = document.getElementById("login-username");
        if (emailInput) {
            emailInput.value = rememberedEmail;
            if (rememberMeCheckbox) {
                rememberMeCheckbox.checked = true;
            }
        }
    }
});
//save to local storgae
document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission
    const email = document.getElementById("login-username").value;
    localStorage.setItem("userEmail", email);
     // Store email in local storage
   // Redirect to another page
});