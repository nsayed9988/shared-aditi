import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIIwPjnFskKiEvEIhSb5KXgevBNyduSDk",
  authDomain: "ty-project-80ab7.firebaseapp.com",
  databaseURL: "https://ty-project-80ab7-default-rtdb.firebaseio.com/", // Your database URL
  projectId: "ty-project-80ab7",
  storageBucket: "ty-project-80ab7.appspot.com",
  messagingSenderId: "491495110151",
  appId: "1:491495110151:web:035795af4bc8eebff79ca2",
  measurementId: "G-XFS1VYTHSM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

window.onload = function () {
  const email = localStorage.getItem("userEmail");
  if (email) {
    document.getElementById("email").value = email;
  }
};

// Helper function to toggle field states
function toggleFields(disable) {
  const fields = [
    "fullName",
    "email",
    "bio",
    "languages",
    "nationality",
    "insta",
    "twit",
    "face",
  ];

  fields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.disabled = disable;
    }
  });
}

// Disable fields initially
toggleFields(true);

// Save profile event listener
document.getElementById("saveprofile").addEventListener("click", function (e) {
  e.preventDefault();

  // Form validation
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const bio = document.getElementById("bio").value.trim();
  const languages = document.getElementById("languages").value.trim();
  const nationality = document.getElementById("nationality").value;

  if (!fullName || !email || !bio || !languages || !nationality) {
    alert("Please fill out all required fields.");
    return;
  }

  const emailKey = email.replace(/\./g, ",");

  // Save to Firebase
  set(ref(db, `User Profile/${emailKey}/AboutUser`), {
    name: fullName,
    email: email,
    bio: bio,
    languages: languages,
    nationality: nationality,
  })
    .then(() => {
      alert("Profile Updated");
      toggleFields(true); // Disable fields after saving
    })
    .catch((error) => {
      alert("Error saving changes: " + error.message);
    });
});

// Edit profile event listener
document.getElementById("editProfile").addEventListener("click", function (e) {
  e.preventDefault();
  toggleFields(false); // Enable fields for editing
});

// Save social media links
document.getElementById("savelink").addEventListener("click", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  if (!email) {
    alert("Please fill out email field first");
    return;
  }

  const emailKey = email.replace(/\./g, ",");

  // Form validation for social media links
  const insta = document.getElementById("insta").value.trim();
  const twitter = document.getElementById("twit").value.trim();
  const facebook = document.getElementById("face").value.trim();

  // Save social media links to Firebase
  set(ref(db, `User Profile/${emailKey}/User Socials`), {
    Instagram: insta || null, // if empty, save null to avoid saving empty strings
    Twitter: twitter || null,
    Facebook: facebook || null,
  })
    .then(() => {
      alert("Social Media Links Updated");
      toggleFields(true); // Disable fields after saving
    })
    .catch((error) => {
      alert("Error saving changes: " + error.message);
    });
});

// Edit social media links event listener
document.getElementById("editlink").addEventListener("click", function (e) {
  e.preventDefault();
  toggleFields(false); // Enable fields for editing
});

// Fetch user profile dynamically
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User logged in:", user.email);

    const sanitizedEmail = user.email.replace(/\./g, ",");
    console.log("Sanitized Email:", sanitizedEmail);

    fetchUserProfile(sanitizedEmail); // Pass sanitized email to fetch user data
  } else {
    alert("No user is logged in.");
    console.log("No user is logged in.");
  }
});

// Fetch user profile data
function fetchUserProfile(emailKey) {
  const userRef = ref(db, `User Profile/${emailKey}`);

  onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log("Fetched User Profile:", data);  // Log data to see the structure

      // Check if AboutUser exists before accessing
      if (data.AboutUser) {
        displayUserProfile(data);
      } else {
        console.log("No profile data found for AboutUser.");
      }
    } else {
      console.log("No data found for the user.");
    }
  });
}

// Display the user profile on the page
function displayUserProfile(data) {
  const container = document.getElementById("user-profile-container");
  container.innerHTML = `
    <h2>${data.AboutUser.name}'s Profile</h2>
    <p><strong>Email:</strong> ${data.AboutUser.email}</p>
    <p><strong>Bio:</strong> ${data.AboutUser.bio}</p>
    <p><strong>Languages:</strong> ${data.AboutUser.languages}</p>
    <p><strong>Nationality:</strong> ${data.AboutUser.nationality}</p>
    <p><strong>Instagram:</strong> ${data["User Socials"]?.Instagram || "N/A"}</p>
    <p><strong>Twitter:</strong> ${data["User Socials"]?.Twitter || "N/A"}</p>
    <p><strong>Facebook:</strong> ${data["User Socials"]?.Facebook || "N/A"}</p>
  `;
}
