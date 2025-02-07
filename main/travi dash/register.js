import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { GoogleAuthProvider } from "firebase/auth";
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
const db = getDatabase(app);

// Generate unique user ID
function generateUserId() {
  return `user_${Math.random().toString(36).substr(2, 9)}`;
}

const submit = document.getElementById('submit');

submit.addEventListener("click", function (event) {
  event.preventDefault();
  const email = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert("Please fill in both email and password.");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;

      // Generate unique user ID
      const userId = generateUserId();

      // Format email to use as a key
      const emailKey = email.replace(/\./g, ',');

      // Store user data in Realtime Database
      try {
        await set(ref(db, `User Profile/${emailKey}`), {
          userId: userId,
          email: email,
          createdAt: new Date().toISOString(),
          authUid: user.uid  // Firebase Auth UID
        });

        alert("Account created successfully!");
        localStorage.setItem('userEmail', email);
        localStorage.setItem("loggedIn", "true");

        setTimeout(() => {
          window.location.href = "my-profile.html";
        }, 500);

      } catch (dbError) {
        console.error("Error storing user data in database:", dbError);
        alert("Account created but failed to save additional data. Please contact support.");
      }
    })
    .catch((error) => {
      let errorMessage = error.message;

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Please use a different email.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters long.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }

      alert(`Error: ${errorMessage}`);
      console.error("Error details:", error);
    });
});







