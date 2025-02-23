
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
        import { getDatabase, ref, push, onValue, remove, set, get } 
            from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
        
        const firebaseConfig = {
            apiKey: "AIzaSyCIIwPjnFskKiEvEIhSb5KXgevBNyduSDk",
            authDomain: "ty-project-80ab7.firebaseapp.com",
            projectId: "ty-project-80ab7",
            storageBucket: "ty-project-80ab7.appspot.com",
            messagingSenderId: "491495110151",
            appId: "1:491495110151:web:035795af4bc8eebff79ca2",
            measurementId: "G-XFS1VYTHSM",
            databaseURL: "https://ty-project-80ab7-default-rtdb.firebaseio.com/"
        };
        
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const database = getDatabase(app);
        
        // Get user email from localStorage
        function getUserEmail() {
            return localStorage.getItem('userEmail') || null;
        }
        
        // Load user trips function
        function loadUserTrips() {
        const tripSelect = document.getElementById('tripSelect');
        const userEmail = getUserEmail();
    
        if (!userEmail) {
            console.error("User email is missing.");
            return;
        }
    
        const emailPath = userEmail.replace(/\./g, ',');
        console.log("Fetching from:", `travel-bookings/${emailPath}`);
    
        const tripsRef = ref(database, `travel-bookings/${emailPath}`);
    
        onValue(tripsRef, (snapshot) => {
            if (!snapshot.exists()) {
                console.warn("No trips found.");
                return;
            }
    
            const data = snapshot.val();
            const publicTrips = data['public-trips'] || {};
            const privateTrips = data['private-trips'] || {}; // Default to empty object if missing
    
            if (Object.keys(publicTrips).length === 0 && Object.keys(privateTrips).length === 0) {
                console.warn("No trips found.");
                return;
            }
    
            tripSelect.innerHTML = ""; // Clear previous options
    
            // Populate dropdown
            Object.entries(publicTrips).forEach(([tripId, trip]) => {
                const option = document.createElement("option");
                option.value = tripId;
                option.textContent = `Public Expedition: ${trip.destination}`;
                tripSelect.appendChild(option);
            });
    
            Object.entries(privateTrips).forEach(([tripId, trip]) => {
                const option = document.createElement("option");
                option.value = tripId;
                option.textContent = `Private Getaway to: ${trip.destination}`;
                tripSelect.appendChild(option);
            });

    
        }, (error) => {
            console.error("Firebase error:", error);
        });
    }
    
// Initialize everything when page loads
        document.addEventListener('DOMContentLoaded', function() {
            displayUserInfo();
            loadUserTrips();
            loadImages();
        });
    
            // Display user info if available
            function displayUserInfo() {
                const userEmail = getUserEmail();
                const userInfoDisplay = document.getElementById('userInfoDisplay');
                const loginReminder = document.getElementById('loginReminder');
                const uploadSection = document.querySelector('.upload-section');
                
                if (userEmail) {
                    userInfoDisplay.textContent = `Logged in as: ${userEmail}`;
                    loginReminder.style.display = 'none';
                    uploadSection.style.display = 'block';
                } else {
                    userInfoDisplay.textContent = 'Not logged in';
                    loginReminder.style.display = 'block';
                    // Uncomment the line below if you want to hide the upload section for non-logged in users
                    // uploadSection.style.display = 'none';
                }
            }
    
            // Call this function when page loads
            document.addEventListener('DOMContentLoaded', function() {
                displayUserInfo();
                loadImages();
            });
    
            // Preview image function
            window.previewImage = function() {
                const fileInput = document.getElementById('imageInput');
                const preview = document.getElementById('preview');
                const file = fileInput.files[0];
    
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        preview.innerHTML = `
                            <img src="${e.target.result}" class="img-preview">
                        `;
                    };
                    reader.readAsDataURL(file);
                }
            };
    
            // Upload function
            window.uploadImage = function() {
                const fileInput = document.getElementById('imageInput');
                const titleInput = document.getElementById('imageTitle');
                const locationInput = document.getElementById('imageLocation');
                const statusDiv = document.getElementById('uploadStatus');
                const uploadBtn = document.getElementById('uploadBtn');
                const userEmail = getUserEmail();
                
                if (!userEmail) {
                    statusDiv.innerHTML = '<div class="error">Please log in to upload images</div>';
                    return;
                }
                
                if (!fileInput.files.length) {
                    statusDiv.innerHTML = '<div class="error">Please select an image</div>';
                    return;
                }
    
                if (!titleInput.value.trim()) {
                    statusDiv.innerHTML = '<div class="error">Please enter an image title</div>';
                    return;
                }
    
                if (!locationInput.value.trim()) {
                    statusDiv.innerHTML = '<div class="error">Please enter the location where the photo was taken</div>';
                    return;
                }
    
                const file = fileInput.files[0];
                
                // Check file size (limit to 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    statusDiv.innerHTML = '<div class="error">File size exceeds 5MB limit</div>';
                    return;
                }
                
                uploadBtn.disabled = true;
                uploadBtn.textContent = "Uploading...";
                
                const reader = new FileReader();
                
                reader.onload = async function(e) {
                    try {
                        const imageData = {
                            title: titleInput.value.trim(),
                            location: locationInput.value.trim(),
                            image: e.target.result,
                            timestamp: Date.now(),
                            uploader: userEmail
                        };
    
                        statusDiv.innerHTML = '<div>Saving to database...</div>';
                        
                        const imagesRef = ref(database, 'gallery');
                        await push(imagesRef, imageData);
    
                        statusDiv.innerHTML = '<div class="success">Upload successful!</div>';
                        fileInput.value = '';
                        titleInput.value = '';
                        locationInput.value = '';
                        document.getElementById('preview').innerHTML = `
                            <div class="preview-placeholder">
                                <p>Image preview will appear here</p>
                            </div>
                        `;
                    } catch (error) {
                        console.error('Upload error:', error);
                        statusDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
                    } finally {
                        uploadBtn.disabled = false;
                        uploadBtn.textContent = "Upload Image";
                    }
                };
    
                reader.onerror = function(error) {
                    statusDiv.innerHTML = `<div class="error">Error reading file: ${error}</div>`;
                    uploadBtn.disabled = false;
                    uploadBtn.textContent = "Upload Image";
                };
    
                reader.readAsDataURL(file);
            };
    
            // Delete function
            window.deleteImage = async function(id) {
                const userEmail = getUserEmail();
                
                // Get the image data to check uploader
                const imageRef = ref(database, `gallery/${id}`);
                const snapshot = await get(imageRef);
                
                if (!snapshot.exists()) {
                    alert('Image not found');
                    return;
                }
                
                const imageData = snapshot.val();
                
                // Only allow delete if current user is the uploader or admin
                if (userEmail !== imageData.uploader && userEmail !== 'admin@example.com') {
                    alert('You can only delete your own images');
                    return;
                }
                
                if (!confirm('Are you sure you want to delete this image?')) {
                    return;
                }
                
                try {
                    const loadingIndicator = document.getElementById('loadingIndicator');
                    loadingIndicator.style.display = 'block';
                    
                    await remove(imageRef);
                    
                    loadingIndicator.style.display = 'none';
                    console.log('Image deleted successfully');
                    
                    // Close the modal after successful deletion
                    const imageModal = document.getElementById('imageModal'); // Adjust if your modal has a different ID
                    if (imageModal) {
                        // Using Bootstrap modal method if you're using Bootstrap
                        $(imageModal).modal('hide');
                        // OR using vanilla JS
                        imageModal.style.display = 'none';
                    }
                    
                    // Refresh gallery if needed
                  // Implement this function if you need to refresh the gallery
                    
                } catch (error) {
                    console.error('Delete error:', error);
                    alert(`Error deleting image: ${error.message}`);
                }
            };
    
            // Load images function
           // Load images function
function loadImages() {
    const gallery = document.getElementById('imageGallery');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const imagesRef = ref(database, 'gallery');
    
    loadingIndicator.style.display = 'block';
    
    onValue(imagesRef, (snapshot) => {
        gallery.innerHTML = '';
        loadingIndicator.style.display = 'none';
        // Remove this problematic line that references undefined emailPath
        // console.log("Fetching from:", `travel-bookings/${emailPath}`);

        if (!snapshot.exists()) {
            gallery.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">No images uploaded yet</div>';
            return;
        }

        const images = [];
        snapshot.forEach((child) => {
            images.push({
                id: child.key,
                ...child.val()
            });
        });
        
        // Sort by timestamp, newest first
        images.sort((a, b) => b.timestamp - a.timestamp);

        images.forEach((image) => {
            const card = document.createElement('div');
            card.className = 'card';
            
            const date = new Date(image.timestamp);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            
            // Check if current user is the uploader
            const currentUserEmail = getUserEmail();
            const canDelete = currentUserEmail === image.uploader || currentUserEmail === 'admin@example.com';
            
            card.innerHTML = `
                <img src="${image.image}" alt="${image.title}" class="card-image">
                <div class="card-info">
                    <div class="card-title">
                      <h4>  <span>${image.title}</span></h4>
                       
                    </div>
                    <div class="card-location">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        ${image.location || 'Location not specified'}
                    </div>
                    <div class="card-uploader">Uploaded by: ${image.uploader || 'Anonymous'}</div>
                    <div class="card-timestamp">Uploaded on ${formattedDate}</div>
                  <div style="float:right;">    ${canDelete ? `<button class="delete-button" onclick="deleteImage('${image.id}')">Delete</button>` : ''}</div>
                </div>
            `;

card.addEventListener("click", function () {
    openImageModal(image);
});

            gallery.appendChild(card);
        });
    }, (error) => {
        loadingIndicator.style.display = 'none';
        gallery.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #dc3545;">
            Error loading images: ${error.message}
        </div>`;
        console.error("Error fetching images:", error);
    });
}
function openImageModal(image) {
    document.getElementById("modalImage").src = image.image;
    document.getElementById("modalTitle").textContent = image.title;
    document.getElementById("modalLocation").textContent = "📍 " + (image.location || 'Location not specified');
    document.getElementById("modalUploader").textContent = "Uploaded by: " + (image.uploader || 'Anonymous');
 
    
    document.getElementById("imageModal").style.display = "flex";
}

function closeImageModal() {
    document.getElementById("imageModal").style.display = "none";
}
