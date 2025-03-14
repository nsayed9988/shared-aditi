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
    // Only fetch if we have an email in localStorage
    fetchUserProfileByEmail();
  } else {
    console.log("No user email found, please log in first");
    // You might want to redirect to a login page here
  }
};
// Add this after your initialization code
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    localStorage.setItem('userEmail', user.email);
    fetchUserProfileByEmail();
  } else {
    // User is signed out
    localStorage.removeItem('userEmail');
    // Clear form fields
    const fields = [fullNameField, emailField, bioField, languagesField, nationalityField, 
                   instagramField, twitterField, facebookField];
    fields.forEach(field => {
      if (field) field.value = '';
    });
  }
});
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
    "face"
  ];

  fields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.disabled = disable;
    } else {
      console.warn(`Field with ID "${fieldId}" not found in the document.`);
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
// Reference to the form elements
const fullNameField = document.getElementById('fullName');
const emailField = document.getElementById('email');
const bioField = document.getElementById('bio');
const languagesField = document.getElementById('languages');
const nationalityField = document.getElementById('nationality');
const instagramField = document.getElementById('insta');







// Function to fetch user profile based on email
function fetchUserProfileByEmail() {
  const userEmail = localStorage.getItem('userEmail');
  
  if (!userEmail) {
    console.log('No user email found in localStorage');
    return;
  }
  
  const sanitizedEmail = userEmail.replace(/\./g, ',');
  const userRef = ref(db, `User Profile/${sanitizedEmail}`);

  onValue(userRef, (snapshot) => {
    const userProfile = snapshot.val();
    
    if (!userProfile) {
      console.log('User profile not found');
      return;
    }

    try {
      // Fill the form fields with the fetched data
      if (userProfile.AboutUser) {
        fullNameField.value = userProfile.AboutUser.name || '';
        emailField.value = userProfile.AboutUser.email || '';
        bioField.value = userProfile.AboutUser.bio || '';
        languagesField.value = userProfile.AboutUser.languages || '';
        nationalityField.value = userProfile.AboutUser.nationality || '';
      }

      // Check and fill the social media fields
      if (userProfile["User Socials"]) {
        instagramField.value = userProfile["User Socials"].Instagram || '';
        twitterField.value = userProfile["User Socials"].Twitter || '';
        facebookField.value = userProfile["User Socials"].Facebook || '';
      }
    } catch (error) {
      console.error('Error filling form fields:', error);
    }
  }, (error) => {
    console.error('Error fetching user profile:', error);
  });
}