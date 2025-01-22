// First, ensure Firebase is properly initialized
import { getDatabase, ref, get, child } from 'firebase/database';

const db = getDatabase();

const fetchUsername = () => {
    console.log("1. Function started");

    // Check if we have the email
    const userEmail = localStorage.getItem('userEmail');
    console.log("2. Email from localStorage:", userEmail);

    if (!userEmail) {
        console.log("3. No email found in localStorage");
        document.getElementById('updateName').textContent = "Please login first";
        return;
    }

    // Log the sanitized email
    const sanitizedEmail = userEmail.replace(/\./g, ',');
    console.log("4. Sanitized email:", sanitizedEmail);

    // Create database reference
    const dbRef = ref(db, `User Profile/${sanitizedEmail}/AboutUser/name`);
    console.log("5. Database path:", `User Profile/${sanitizedEmail}/AboutUser/name`);

    get(dbRef)
        .then((snapshot) => {
            console.log("6. Got snapshot");
            console.log("7. Snapshot exists?", snapshot.exists());
            
            if (snapshot.exists()) {
                const name = snapshot.val();
                console.log("8. Name found:", name);
                document.getElementById('updateName').textContent = name;
            } else {
                console.log("8. No data available");
                document.getElementById('updateName').textContent = "Name not found";
            }
        })
        .catch((error) => {
            console.error("9. Error:", error);
            document.getElementById('updateName').textContent = "Error loading name";
        });
};

// Call the function
console.log("0. Starting to fetch username");
fetchUsername();