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
        const form = document.getElementById('custom_form_2024');
        const imageFiles = form.querySelector('#custom_form_images_2024').files;
        
        // Get form values
        const formElements = {
            name: form.querySelector('#custom_form_name_2024').value,
            email: form.querySelector('#custom_form_email_2024').value,
            title: form.querySelector('#custom_form_title_2024').value,
            category: form.querySelector('#custom_form_category_2024').value,
            content: form.querySelector('#custom_form_content_2024').value
        };

        // Validate form fields
        const emptyFields = Object.entries(formElements)
            .filter(([_, value]) => !value.trim())
            .map(([key, _]) => key);

        if (emptyFields.length > 0) {
            alert(`Please fill in the following fields: ${emptyFields.join(', ')}`);
            return;
        }

        // Upload images and get their URLs
        const imageUrls = [];
        
        if (imageFiles.length > 0) {
            for (const file of imageFiles) {
                const imageRef = storageRef(storage, `blog-images/${Date.now()}-${file.name}`);
                const snapshot = await uploadBytes(imageRef, file);
                const downloadUrl = await getDownloadURL(snapshot.ref);
                imageUrls.push(downloadUrl);
            }
        }

        // Create the data object with images
        const formData = {
            name: formElements.name.trim(),
            email: formElements.email.trim(),
            title: formElements.title.trim(),
            category: formElements.category.trim(),
            content: formElements.content.trim(),
            images: imageUrls,
            mainImage: imageUrls[0] || '/placeholder-image.jpg',
            timestamp: Date.now()
        };

        // Save to Firebase
        const newPostRef = push(ref(database, 'blog-posts'));
        await set(newPostRef, formData);
        console.log('Data saved successfully with ID:', newPostRef.key);

        // Reset form and close overlay
        form.reset();
        document.getElementById('custom_form_images_preview_2024').innerHTML = '';
        document.getElementById('custom_overlay_background_2024').style.display = 'none';
        
        alert('Blog post saved successfully!');
        
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error saving data: ' + error.message);
    }
});

// Image preview functionality
document.getElementById('custom_form_images_2024').addEventListener('change', (e) => {
    const previewContainer = document.getElementById('custom_form_images_preview_2024');
    previewContainer.innerHTML = '';
    
    const files = e.target.files;
    
    for (const file of files) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const preview = document.createElement('div');
            preview.className = 'image-preview-item';
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview" style="max-width: 100px; max-height: 100px; margin: 5px;">
            `;
            previewContainer.appendChild(preview);
        };
        
        reader.readAsDataURL(file);
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
            
            const postDate = new Date(post.timestamp).toLocaleDateString();
            
            postElement.innerHTML = `
                <img src="${post.mainImage}" alt="${post.title}" class="modern_blog_card_image_jan2024">
                <div class="modern_blog_card_content_jan2024">
                    <div class="modern_blog_card_title_jan2024">${post.title || 'Untitled'}</div>
                    <div class="modern_blog_card_author_jan2024">${post.name || 'Anonymous'} • ${postDate}</div>
                    <div class="modern_blog_card_category_jan2024">${post.category || 'Uncategorized'}</div>
                </div>
            `;

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

// Function to display detailed view of a blog post
function showDetailView(post) {
    const overlay = document.getElementById('blog_cards_container_2024') || createDetailOverlay();
    const postDate = new Date(post.timestamp).toLocaleDateString();
    
    // Create image gallery if multiple images exist
    const imageGallery = post.images && post.images.length > 1 
        ? `<div class="modern_blog_image_gallery_jan2024">
            ${post.images.map(img => `
                <img src="${img}" alt="Blog image" class="modern_blog_gallery_image_jan2024">
            `).join('')}
           </div>`
        : `<img id="modern_blog_detail_image_jan2024" src="${post.mainImage}" alt="${post.title}">`;
    
    overlay.innerHTML = `
        <div id="modern_blog_detail_content_jan2024">
            <button id="modern_blog_detail_close_jan2024">&times;</button>
            ${imageGallery}
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

// Helper function to create detail overlay
function createDetailOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'blog_cards_container_2024';
    document.body.appendChild(overlay);
    return overlay;
}

// Initialize blog posts retrieval when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing blog posts retrieval');
    retrieveBlogPosts();
});
