// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
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

// Form submission handler
document.getElementById('custom_form_2024').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form submission started');
    
    try {
        // Get the form element
        const form = document.getElementById('custom_form_2024');
        
        // Get form values using formData API
        const formElements = {
            name: form.querySelector('#custom_form_name_2024').value,
            email: form.querySelector('#custom_form_email_2024').value,
            title: form.querySelector('#custom_form_title_2024').value,
            category: form.querySelector('#custom_form_category_2024').value,
            content: form.querySelector('#custom_form_content_2024').value
        };

        // Debug log
        console.log('Raw form values:', formElements);

        // Check if any field is empty
        const emptyFields = Object.entries(formElements)
            .filter(([_, value]) => !value.trim())
            .map(([key, _]) => key);

        if (emptyFields.length > 0) {
            console.log('Empty fields:', emptyFields);
            alert(`Please fill in the following fields: ${emptyFields.join(', ')}`);
            return;
        }

        // Create the data object
        const formData = {
            name: formElements.name.trim(),
            email: formElements.email.trim(),
            title: formElements.title.trim(),
            category: formElements.category.trim(),
            content: formElements.content.trim(),
            timestamp: Date.now()
        };

        console.log('Processed form data:', formData);

        // Save to Firebase
        const newPostRef = push(ref(database, 'blog-posts'));
        await set(newPostRef, formData);
        console.log('Data saved successfully with ID:', newPostRef.key);

        // Reset form and close overlay
        form.reset();
        document.getElementById('custom_overlay_background_2024').style.display = 'none';
        
        alert('Data saved successfully!');
        
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error saving data: ' + error.message);
    }
});

// Function to retrieve and display blog posts
function retrieveBlogPosts() {
    console.log('Starting to retrieve blog posts');
    const postsRef = ref(database, 'blog-posts');
    
    onValue(postsRef, (snapshot) => {
        console.log('Retrieved data:', snapshot.val());
        const data = snapshot.val();
        const blogContainer = document.getElementById('modern_blog_cards_container_jan2024');
        
        if (!blogContainer) {
            console.error('Blog container not found!');
            return;
        }
        
        blogContainer.innerHTML = '';
        
        if (!data) {
            blogContainer.innerHTML = '<p>No blog posts found.</p>';
            return;
        }

        // Sort posts by timestamp (newest first)
        const sortedPosts = Object.entries(data)
            .sort(([, a], [, b]) => b.timestamp - a.timestamp);

        sortedPosts.forEach(([key, post]) => {
            const postElement = document.createElement('div');
            postElement.className = 'modern_blog_card_item_jan2024';
            
            // Format the date
            const postDate = new Date(post.timestamp).toLocaleDateString();
            
            postElement.innerHTML = `
                <!--<img src="${post.imageUrl || '/placeholder-image.jpg'}" alt="${post.title}" class="modern_blog_card_image_jan2024">-->
                <div class="modern_blog_card_content_jan2024">
                    <div class="modern_blog_card_title_jan2024">${post.title || 'Untitled'}</div>
                    <div class="modern_blog_card_author_jan2024">${post.name || 'Anonymous'} • ${postDate}</div>
                    <div class="modern_blog_card_category_jan2024">${post.category || 'Uncategorized'}</div>
                </div>
            `;

            // Add click handler for detail view
            postElement.addEventListener('click', () => showDetailView(post));
            
            blogContainer.appendChild(postElement);
        });
    }, (error) => {
        console.error('Error fetching blog posts:', error);
        const blogContainer = document.getElementById('modern_blog_cards_container_jan2024');
        if (blogContainer) {
            blogContainer.innerHTML = '<p>Error loading blog posts. Please try again later.</p>';
        }
    });
}

// Detail view functionality
function showDetailView(post) {
    const overlay = document.getElementById('blog_cards_container_2024') || createDetailOverlay();
    const postDate = new Date(post.timestamp).toLocaleDateString();
    
    overlay.innerHTML = `
        <div id="modern_blog_detail_content_jan2024">
            <button id="modern_blog_detail_close_jan2024">&times;</button>
           <!-- <img id="modern_blog_detail_image_jan2024" src="${post.imageUrl || '/placeholder-image.jpg'}" alt="${post.title}">-->
            <h1 class="modern_blog_detail_title_jan2024">${post.title || 'Untitled'}</h1>
            <div class="modern_blog_detail_meta_jan2024">
                <span>${post.name || 'Anonymous'}</span>
                <span>${postDate}</span>
                <span class="modern_blog_card_category_jan2024">${post.category || 'Uncategorized'}</span>
            </div>
            <div class="modern_blog_detail_content_jan2024">${post.content || ''}</div>
        </div>
    `;
    
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    document.getElementById('modern_blog_detail_close_jan2024').addEventListener('click', () => {
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

function createDetailOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'blog_cards_container_2024';
    document.body.appendChild(overlay);
    return overlay;
}

// Add styling
const style = document.createElement('style');
style.textContent = `
    #modern_blog_cards_container_jan2024 {
        margin-top: 30px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        padding: 20px;
    }

    .modern_blog_card_item_jan2024 {
        border: 1px solid #ddd;
        border-radius: 20px;
        overflow: hidden;
        transition: transform 0.2s;
        cursor: pointer;
        background: white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .modern_blog_card_item_jan2024:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }

    .modern_blog_card_image_jan2024 {
        width: 100%;
        height: 200px;
        object-fit: cover;
    }

    .modern_blog_card_content_jan2024 {
        padding: 15px;
    }

    .modern_blog_card_title_jan2024 {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 8px;
        color: #333;
    }

    .modern_blog_card_author_jan2024 {
        font-size: 16px;
        color: #666;
        margin-bottom: 5px;
    }

    .modern_blog_card_category_jan2024 {
        display: inline-block;
        padding: 3px 8px;
        background-color: lightgray;
        color: rgb(0, 0, 0);
        border-radius: 4px;
        font-size: 14px;
    }

    #blog_cards_container_2024 {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        overflow-y: auto;
    }

    #modern_blog_detail_content_jan2024 {
        position: relative;
        background: white;
        width: 90%;
        max-width: 800px;
        margin: 40px auto;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(0,0,0,0.2);
    }

    #modern_blog_detail_close_jan2024 {
        position: absolute;
        top: 15px;
        right: 15px;
        font-size: 24px;
        cursor: pointer;
        background: none;
        border: none;
        color: #333;
    }

    #modern_blog_detail_image_jan2024 {
        width: 100%;
        max-height: 400px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 20px;
    }

    .modern_blog_detail_title_jan2024 {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #333;
    }

    .modern_blog_detail_meta_jan2024 {
        display: flex;
        gap: 15px;
        margin-bottom: 20px;
        color: #666;
    }

    .modern_blog_detail_content_jan2024 {
        line-height: 1.6;
        color: #444;
    }
`;

document.head.appendChild(style);

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing blog posts retrieval');
    retrieveBlogPosts();
});

