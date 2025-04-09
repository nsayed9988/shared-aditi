// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

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
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const rememberMeCheckbox = document.querySelector('.cb-remember');
    const loginButton = document.getElementById('login-submit');

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            
            // Disable the login button to prevent double submission
            if (loginButton) loginButton.disabled = true;

            try {
                const emailInput = document.getElementById("login-username");
                const passwordInput = document.getElementById("login-password");

                if (!emailInput || !passwordInput) {
                    throw new Error('Form inputs not found');
                }

                const email = emailInput.value.trim();
                const password = passwordInput.value;

                // Basic validation
                if (!email || !password) {
                    throw new Error("Please enter both email and password.");
                }

                // Remember me functionality
                if (rememberMeCheckbox && rememberMeCheckbox.checked) {
                    localStorage.setItem('rememberedEmail', email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                // Attempt login
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                // Store user data
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('userId', user.uid);
                
                // Successful login - redirect
                window.location.href = "/";
                
            } catch (error) {
                console.error('Login error:', error);

                let errorMessage = "An error occurred during login.";
                
                switch(error.code) {
                    case 'auth/invalid-credential':
                    case 'auth/wrong-password':
                        errorMessage = "Invalid email or password.";
                        break;
                    case 'auth/user-not-found':
                        errorMessage = "No account exists with this email.";
                        break;
                    case 'auth/invalid-email':
                        errorMessage = "Please enter a valid email address.";
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = "Too many login attempts. Please try again later.";
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = "Network error. Please check your internet connection.";
                        break;
                }
                
                alert(errorMessage);
            } finally {
                // Re-enable the login button
                if (loginButton) loginButton.disabled = false;
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
    }
});