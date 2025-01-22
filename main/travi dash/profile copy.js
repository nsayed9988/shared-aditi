import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
import {
  getDatabase,
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIIwPjnFskKiEvEIhSb5KXgevBNyduSDk",
  authDomain: "ty-project-80ab7.firebaseapp.com",
  projectId: "ty-project-80ab7",
  storageBucket: "ty-project-80ab7.firebasestorage.app",
  messagingSenderId: "491495110151",
  appId: "1:491495110151:web:035795af4bc8eebff79ca2",
  measurementId: "G-XFS1VYTHSM",
};
window.onload = function () {
  const email = localStorage.getItem("userEmail");
  if (email) {
    document.getElementById("email").value = email;
  }
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
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
      document.getElementById("fullName").disabled = true;
      document.getElementById("email").disabled = true;
      document.getElementById("bio").disabled = true;
      document.getElementById("nationality").disabled = true;
      document.getElementById("languages").disabled = true;
      // Rebuilding the profile view after update
      //userdisplay.innerHTML = `
      /* <h3>Profile Summary</h3>
        <br>
      </br>  <h6>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Bio:</strong> ${bio}</p>
          <p><strong>Languages:</strong> ${languages}</p>
          <p><strong>Nationality:</strong> ${nationality}</p>
        </h6>
        <br>
       
      `;*/
      // Attach event listener to Edit Profile button after updating profile
     
    })
    .catch((error) => {
      alert("Error saving changes: " + error.message);
    });
});

document.getElementById("editProfile").addEventListener("click", function (e) {
  e.preventDefault();
  document.getElementById("fullName").disabled = false;
  document.getElementById("email").disabled = false;
  document.getElementById("bio").disabled = false;
  document.getElementById("nationality").disabled = false;
  document.getElementById("languages").disabled = false;
});
// Social media link saving
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
    Instagram: insta || null,  // if empty, save null to avoid saving empty strings
    Twitter: twitter || null,
    Facebook: facebook || null,
  })
    .then(() => {
      alert("Changes saved successfully.");
      document.getElementById("insta").disabled = true;
      document.getElementById("twit").disabled = true;
      document.getElementById("face").disabled = true;
    })
    .catch((error) => {
      alert("Error saving changes: " + error.message);
    });
});

document.getElementById("editlink").addEventListener("click", function (e) {
  e.preventDefault();
  document.getElementById("insta").disabled =false;
  document.getElementById("twit").disabled = false;
  document.getElementById("face").disabled = false;
});



// Fetch user profile dynamically
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User logged in:", user.email);

    // Replace '.' in the email with ',' as Firebase keys don't allow '.'
    const sanitizedEmail = user.email.replace(/\./g, ",");
    console.log("Sanitized Email:", sanitizedEmail);

    // Fetch the user's profile using the sanitized email
    fetchUserProfile(sanitizedEmail);
  } else {
    alert("No user is logged in.");
    console.log("No user is logged in.");
    // Redirect to login page or handle unauthenticated state
   
  }
});

// Fetch user profile data
function fetchUserProfile(emailKey) {
  const userRef = ref(db, `User Profile/${emailKey}`);

  onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log("User Profile:", data);

      // Display the profile on the page
      displayUserProfile(data);
    } else {
      console.log("No profile found for this user.");
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
    <p><strong>Instagram:</strong> ${data["User Socials"].Instagram}</p>
  `;
}