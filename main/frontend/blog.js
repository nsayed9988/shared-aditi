// First, update the imports to give distinct names
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref as dbRef, push, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

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
const storage = getStorage(app);

// Modified event listener for form submission
document.getElementById('custom_form_2024').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form submission started');
    
    try {
        const form = document.getElementById('custom_form_2024');
        const formElements = {
            name: form.querySelector('#custom_form_name_2024').value,
            email: form.querySelector('#custom_form_email_2024').value,
            title: form.querySelector('#custom_form_title_2024').value,
            category: form.querySelector('#custom_form_category_2024').value,
            content: form.querySelector('#custom_form_content_2024').value
        };

        // Check for empty fields
        const emptyFields = Object.entries(formElements)
            .filter(([_, value]) => !value.trim())
            .map(([key, _]) => key);

        if (emptyFields.length > 0) {
            alert(`Please fill in the following fields: ${emptyFields.join(', ')}`);
            return;
        }

        // Handle images
        const imageFiles = form.querySelector('#custom_form_images_2024').files;
        const imageData = [];

        // Convert images to base64
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const base64 = await convertToBase64(file);
            imageData.push({
                name: file.name,
                type: file.type,
                data: base64
            });
        }

        // Create the data object
        const formData = {
            name: formElements.name.trim(),
            email: formElements.email.trim(),
            title: formElements.title.trim(),
            category: formElements.category.trim(),
            content: formElements.content.trim(),
            images: imageData,
            timestamp: Date.now()
        };

        // Save to Firebase
        const newPostRef = push(dbRef(database, 'blog-posts'));
        await set(newPostRef, formData);
        console.log('Data saved successfully with ID:', newPostRef.key);

        // Reset form and UI
        form.reset();
        document.getElementById('custom_form_images_preview_2024').innerHTML = '';
        document.getElementById('custom_overlay_background_2024').style.display = 'none';
        alert('Post saved successfully!');

    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error saving data: ' + error.message);
    }
});

// Function to convert file to base64
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
// Add image preview functionality
