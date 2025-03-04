
    // Uncomment the import for initializeApp
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
    import { getDatabase, ref, onValue, get, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
    import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
    
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
    const db = getDatabase(app);
    
    // Make Firebase available globally
    window.db = db;
    window.dbRef = ref;
    window.dbGet = get;
    
    // Function to fetch past public trips
    // Modify your fetchPastPublicTrips function to include more debugging
    async function fetchPastPublicTrips() {
      try {
        // Get current date for comparison
        const currentDate = new Date();
        console.log('Current date:', currentDate);
        
        // Get all users
        const usersRef = ref(db, 'travel-bookings');
        const usersSnapshot = await get(usersRef);
        
        let pastPublicTrips = [];
        
        // Check if users exist at all
        if (!usersSnapshot.exists()) {
          console.error('No users found in travel-bookings');
          return [];
        }
        
        const users = usersSnapshot.val();
        console.log('Found users:', Object.keys(users));
        
        // Loop through each user
        for (const userEmail in users) {
          console.log(`Checking user: ${userEmail}`);
          
          // Check if this user has public trips
          const publicTripsRef = ref(db, `travel-bookings/${userEmail}/public-trips`);
          const publicTripsSnapshot = await get(publicTripsRef);
          
          if (!publicTripsSnapshot.exists()) {
            console.log(`No public-trips node found for user: ${userEmail}`);
            continue;
          }
          
          const publicTrips = publicTripsSnapshot.val();
          console.log(`User ${userEmail} has ${Object.keys(publicTrips).length} public trips`);
          
          // Process each public trip
          for (const tripId in publicTrips) {
            const trip = publicTrips[tripId];
            console.log(`Examining trip ${tripId}:`, trip);
            
            // Check if the trip has the required date fields
            if (!trip.startDate && !trip.applyByDate) {
              console.log(`Trip ${tripId} is missing both startDate and applyByDate`);
              continue;
            }
            
            if (!trip.endDate) {
              console.log(`Trip ${tripId} is missing endDate`);
              // You might want to include these trips anyway by setting a default endDate
              // trip.endDate = new Date().toISOString(); // Set to today
              continue;
            }
            
            // For debugging - show all date checks
            const tripStartDate = new Date(trip.startDate || trip.applyByDate);
            const tripEndDate = new Date(trip.endDate);
            console.log(`Trip dates: start=${tripStartDate}, end=${tripEndDate}`);
            console.log(`Is this trip in the past? ${tripEndDate < currentDate}`);
            
            // TEMPORARY: Remove date filtering for testing
            // if (tripEndDate < currentDate) {
              // Add user information to the trip object
              trip.id = tripId;
              trip.user = userEmail;
              trip.userInitial = userEmail.charAt(0).toUpperCase();
              
              // Add default values for rating and reviews if not present
              if (!trip.rating) trip.rating = 0;
              if (!trip.reviewCount) trip.reviewCount = 0;
              if (!trip.reviews) trip.reviews = [];
              if (!trip.highlights) trip.highlights = 0;
              
              // Calculate trip duration using available dates
              const startDate = new Date(trip.startDate || trip.applyByDate);
              const endDate = new Date(trip.endDate);
              const durationTime = endDate.getTime() - startDate.getTime();
              trip.duration = Math.ceil(durationTime / (1000 * 3600 * 24)) || 1; // Convert to days, default to 1
              
              pastPublicTrips.push(trip);
              console.log(`Added trip ${tripId} to results`);
            // } else {
            //  console.log(`Trip ${tripId} is in the future, skipping`);
            // }
          }
        }
        
        console.log('Final past public trips count:', pastPublicTrips.length);
        console.log('Trips found:', pastPublicTrips);
        return pastPublicTrips;
        
      } catch (error) {
        console.error('Error fetching past trips:', error);
        throw error;
      }
    }
    // Function to format dates nicely
    function formatDateRange(startDate, endDate) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const start = new Date(startDate).toLocaleDateString('en-US', options);
        const end = new Date(endDate).toLocaleDateString('en-US', options);
        return `${start} - ${end}`;
    }
    
    // Function to display trips
    // Update the displayTrips function to pass the correct trip user information
    function displayTrips(trips) {
        const sliderElement = document.getElementById('trips-slider-review');
        sliderElement.innerHTML = ''; // Clear existing content first
        
        console.log('Displaying trips:', trips);
        
        if (trips.length === 0) {
            sliderElement.innerHTML = `
                <div class="empty-state-review">
                    <h3>No past trips available</h3>
                    <p>Check back later for community shared travel experiences</p>
                </div>
            `;
            return;
        }
        
        trips.forEach(trip => {
            // Create checklist items HTML
            let checklistHTML = '';
            if (trip.checkedItems) {
                const items = Object.keys(trip.checkedItems).filter(key => trip.checkedItems[key]);
                // Display max 3 items to save space
                const displayItems = items.slice(0, 3);
                
                displayItems.forEach(item => {
                    checklistHTML += `<span class="checklist-item-review">${item}</span>`;
                });
                
                // Show "more" indicator if there are additional items
                if (items.length > 3) {
                    checklistHTML += `<span class="checklist-item-review">+${items.length - 3} more</span>`;
                }
            }
            
            // Create rating stars HTML
            let starsHTML = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= Math.floor(trip.rating)) {
                    starsHTML += '<span class="star-review filled-review">★</span>';
                } else if (i - 0.5 <= trip.rating && i > Math.floor(trip.rating)) {
                    starsHTML += '<span class="star-review filled-review">★</span>'; // For simplicity using full stars
                } else {
                    starsHTML += '<span class="star-review">★</span>';
                }
                // At the end of displayTrips function, add:
    initializeReviewSliders();
            }
            
            // Get a random review to display (if available)
           // Replace the current reviewHTML code block with this:
    let reviewHTML = '';
    if (trip.reviews && trip.reviews.length > 0) {
        // Create a slider container for all reviews
        reviewHTML = `
            <div class="trip-reviews-slider-container">
                <div class="trip-reviews-slider">
                    ${trip.reviews.map((review, index) => `
                        <div class="trip-review-review" data-index="${index}">
                            <p class="review-text">${review.text}</p>
                            <p class="review-author">- ${review.displayName || 'Anonymous'}</p>
                        </div>
                    `).join('')}
                </div>
                <div class="slider-controls">
                    <button class="slider-prev" data-trip-id="${trip.id}">❮</button>
                    <div class="slider-dots">
                        ${trip.reviews.map((_, index) => `
                            <span class="slider-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
                        `).join('')}
                    </div>
                    <button class="slider-next" data-trip-id="${trip.id}">❯</button>
                </div>
            </div>
        `;
    }
            
            const tripCard = document.createElement('div');
            tripCard.className = 'trip-card-review';
            tripCard.innerHTML = `
                <h3 class="trip-destination-review">${trip.destination}</h3>
                <p class="trip-date-review">${formatDateRange(trip.startDate || trip.applyByDate, trip.endDate)}</p>
                <div class="trip-user-review">
                    <div class="user-avatar-review">${trip.userInitial}</div>
                    <span class="user-name-review">${trip.user}</span>
                </div>
                <div class="trip-budget-review">
                    ${trip.currency || '$'} ${trip.budget || 'N/A'}
                </div>
                <div class="trip-stats-review">
                    <div class="stat-item-review">
                        <div class="stat-value-review">${trip.duration}</div>
                        <div class="stat-label-review">Days</div>
                    </div>
                    <div class="stat-item-review">
                        <div class="stat-value-review">${trip.reviewCount || 0}</div>
                        <div class="stat-label-review">Reviews</div>
                    </div>
                    <div class="stat-item-review">
                        <div class="stat-value-review">${trip.highlights || 0}</div>
                        <div class="stat-label-review">Highlights</div>
                    </div>
                </div>
                <div class="rating-display-review">
                    <div class="stars-review">${starsHTML}</div>
                    <span class="rating-value-review">${(trip.rating || 0).toFixed(1)}</span>
                    <span class="review-count-review">(${trip.reviewCount || 0})</span>
                </div>
                ${reviewHTML}
                
                <div class="action-buttons-review">
                    <button class="action-btn-review view-btn-review" data-id="${trip.id}" data-user="${trip.user}">View Details</button>
                    <button class="action-btn-review review-btn-review" data-id="${trip.id}" data-user="${trip.user}">Write Review</button>
                </div>
            `;
            
            sliderElement.appendChild(tripCard);
        });
        
        // Add event listeners to buttons
    // Add event listeners to buttons
    document.querySelectorAll('.review-btn-review').forEach(btn => {
        btn.addEventListener('click', function() {
            openReviewModal(this.getAttribute('data-id'));
        });
    });
    
    document.querySelectorAll('.view-btn-review').forEach(btn => {
        btn.addEventListener('click', function() {
            const tripId = this.getAttribute('data-id');
            const tripUser = this.getAttribute('data-user');
            console.log('View details for trip:', tripId, 'by user:', tripUser);
            openDetailsModal(tripId, tripUser);
        });
    });
    
    // Add this new line
    console.log('Attaching view button listeners');
    updateViewButtonListeners();
    }
    
    
    
    function initializeReviewSliders() {
        // Get all slider containers
        const sliderContainers = document.querySelectorAll('.trip-reviews-slider-container');
        
        sliderContainers.forEach(container => {
            const slider = container.querySelector('.trip-reviews-slider');
            const reviews = slider.querySelectorAll('.trip-review-review');
            const dots = container.querySelectorAll('.slider-dot');
            const prevBtn = container.querySelector('.slider-prev');
            const nextBtn = container.querySelector('.slider-next');
            
            let currentIndex = 0;
            
            // Show only the first review initially
            reviews.forEach((review, index) => {
                review.style.display = index === currentIndex ? 'block' : 'none';
            });
            
            // Function to show a specific slide
            function showSlide(index) {
                // Hide all reviews
                reviews.forEach(review => {
                    review.style.display = 'none';
                });
                
                // Reset active dots
                dots.forEach(dot => {
                    dot.classList.remove('active');
                });
                
                // Show the selected review and activate its dot
                reviews[index].style.display = 'block';
                dots[index].classList.add('active');
                currentIndex = index;
            }
            
            // Add event listeners to dots
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    showSlide(index);
                });
            });
            
            // Add event listeners to prev/next buttons
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    const newIndex = (currentIndex - 1 + reviews.length) % reviews.length;
                    showSlide(newIndex);
                });
            }
            
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    const newIndex = (currentIndex + 1) % reviews.length;
                    showSlide(newIndex);
                });
            }
        });
    }
    // Function to check if the current user is logged in
    /*function checkUserLogin() {
        const auth = getAuth();
        return new Promise((resolve) => {
            auth.onAuthStateChanged((user) => {
                resolve(user !== null);
            });
        });
    }*/
    
    // Function to open the review modal
    function openReviewModal(tripId) {
        // Find the trip data to get the user
        const tripCards = document.querySelectorAll('.trip-card-review');
        let tripUser = null;
        
        tripCards.forEach(card => {
            const cardTripId = card.querySelector('.action-btn-review').getAttribute('data-id');
            if (cardTripId === tripId) {
                const userElement = card.querySelector('.user-name-review');
                if (userElement) {
                    // Extract email from the displayed username + @ + domain
                    const displayName = userElement.textContent.trim();
                    tripUser = displayName.includes('@') ? displayName : displayName + '@example.com';
                }
            }
        });
        
        if (!tripUser) {
            console.error('Could not find trip user information');
            alert('Error: Could not determine trip owner. Please try again.');
            return;
        }
        
        // Reset the modal inputs
        document.getElementById('review-text-review').value = '';
        document.querySelectorAll('#rating-stars-review .star-review').forEach(star => {
            star.classList.remove('filled-review');
        });
        
        // Store the current trip ID and user
        const modal = document.getElementById('review-modal-review');
        modal.setAttribute('data-trip-id', tripId);
        modal.setAttribute('data-trip-user', tripUser);
        
        // Check if user is logged in
        /*const auth = getAuth();
        if (!auth.currentUser) {
            alert('You must be logged in to write a review.');
            return;
        }*/
        
        // Show the modal
        modal.style.display = 'flex';
    }
    // Navigation buttons functionality
    function setupNavigation() {
        const sliderWrapper = document.querySelector('.slider-wrapper-review');
        const prevButton = document.querySelector('.prev-button-review');
        const nextButton = document.querySelector('.next-button-review');
        
        // Scroll amount - approximately one card width plus gap
        const scrollAmount = 320;
        
        prevButton.addEventListener('click', () => {
            sliderWrapper.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });
        
        nextButton.addEventListener('click', () => {
            sliderWrapper.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });
    }
    // Function to submit a review
    async function submitReview(tripId, tripUser, rating, reviewText) {
      try {
        // Reference to the specific public trip
        const tripRef = ref(db, `travel-bookings/${tripUser}/public-trips/${tripId}`);
        const tripSnapshot = await get(tripRef);
        
        if (!tripSnapshot.exists()) {
          console.error("Trip not found");
          return false;
        }
        
        const trip = tripSnapshot.val();
        
        // Create review object with anonymous user info
        const review = {
          rating: rating,
          text: reviewText,
          timestamp: new Date().toISOString(),
          userId: "anonymous",
          userEmail: "anonymous@user.com",
          displayName: "Guest Reviewer"
        };
        
        // Initialize reviews array if it doesn't exist
        if (!trip.reviews) {
          trip.reviews = [];
        }
        
        // Add the new review
        trip.reviews.push(review);
        
        // Update review count
        trip.reviewCount = (trip.reviewCount || 0) + 1;
        
        // Calculate new average rating
        const totalRating = trip.reviews.reduce((sum, rev) => sum + rev.rating, 0);
        trip.rating = totalRating / trip.reviews.length;
        
        // Save the updated trip back to Firebase
        await set(tripRef, trip);
        
        console.log("Review saved successfully");
        return true;
      } catch (error) {
        console.error("Error saving review:", error);
        return false;
      }
    }
    
    
    
    // Update the setupReviewModal function to use our new submitReview function
    function setupReviewModal() {
        const modal = document.getElementById('review-modal-review');
        const closeBtn = document.querySelector('.close-modal-review');
        const submitBtn = document.querySelector('.submit-review-review');
        const stars = document.querySelectorAll('#rating-stars-review .star-review');
        
        // Close modal
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Star rating functionality
        let currentRating = 0;
        
        stars.forEach(star => {
            // Click to set rating
            star.addEventListener('click', function() {
                const value = parseInt(this.getAttribute('data-value'));
                currentRating = value;
                
                // Update stars display
               // Update stars display
    stars.forEach(s => {
        const starValue = parseInt(s.getAttribute('data-value'));
        if (starValue <= value) {
            s.classList.add('filled-review'); // Changed to 'filled-review'
        } else {
            s.classList.remove('filled-review'); // Changed to 'filled-review'
        }
    });
            });
        });
        
        // Submit review
        submitBtn.addEventListener('click', async () => {
            const tripId = modal.getAttribute('data-trip-id');
            const tripUser = modal.getAttribute('data-trip-user');
            const reviewText = document.getElementById('review-text-review').value;
            
            if (currentRating === 0) {
                alert('Please select a star rating');
                return;
            }
            
            if (reviewText.trim() === '') {
                alert('Please write a review');
                return;
            }
            
            try {
                // Show loading state
                submitBtn.textContent = 'Submitting...';
                submitBtn.disabled = true;
                
                // Use our new function to submit the review
                const success = await submitReview(tripId, tripUser, currentRating, reviewText);
                
                if (success) {
                    // Close the modal
                    modal.style.display = 'none';
                    
                    // Provide feedback to the user
                    alert('Thank you for your review!');
                    
                    // Reload trips to show the updated data
                    const pastTrips = await fetchPastPublicTrips();
                    displayTrips(pastTrips);
                } else {
                    alert('Failed to submit review. Please try again.');
                }
            } catch (error) {
                console.error('Error submitting review:', error);
                alert('Failed to submit review: ' + error.message);
            } finally {
                // Reset button state
                submitBtn.textContent = 'Submit Review';
                submitBtn.disabled = false;
            }
        });
    }
    // Add this HTML for the details modal after your review modal HTML
    const detailsModalHTML = `
    <div class="modal-review" id="details-modal-review">
        <div class="modal-content-review" style="max-width: 600px;">
            <div class="modal-header-review">
                <h3 class="modal-title-review" id="details-title">Trip Details</h3>
                <button class="close-modal-review">&times;</button>
            </div>
            <div class="trip-info">
                <p id="trip-date-range"></p>
                <div id="trip-budget-display" class="trip-budget-review"></div>
            </div>
            <div class="details-content">
                <h4 style="margin-top: 20px; margin-bottom: 10px;">Daily Activities</h4>
                <div id="daily-activities" style="max-height: 300px; overflow-y: auto;"></div>
            </div>
        </div>
    </div>
    `;
    
    // Append this to the document body
    document.body.insertAdjacentHTML('beforeend', detailsModalHTML);
    
    // Add this CSS to style the daily activities
    const detailsCSS = `
    <style>
        .day-item {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 10px;
        }
        
        .day-title {
            font-weight: 600;
            margin-bottom: 5px;
            color: #212529;
        }
        
        .day-description {
            color: #495057;
            font-size: 14px;
        }
    </style>
    `;
    
    // Add the CSS to the document head
    document.head.insertAdjacentHTML('beforeend', detailsCSS);
    
    // Function to open the details modal
    async function openDetailsModal(tripId, tripUser) {
        console.log('Opening details modal for trip:', tripId, 'by user:', tripUser);
        
        // Get reference to the modal
        const modal = document.getElementById('details-modal-review');
        if (!modal) {
            console.error('Details modal element not found!');
            return;
        }
        
        try {
            // Get trip data from Firebase
            const tripRef = ref(db, `travel-bookings/${tripUser}/public-trips/${tripId}`);
            console.log('Fetching trip from:', `travel-bookings/${tripUser}/public-trips/${tripId}`);
            
            const tripSnapshot = await get(tripRef);
            
            if (!tripSnapshot.exists()) {
                console.error("Trip not found in database");
                alert("Trip details could not be loaded.");
                return;
            }
            
            const trip = tripSnapshot.val();
            console.log("Trip details loaded successfully:", trip);
            
            // Populate the modal with trip details
            document.getElementById('details-title').textContent = `Trip to ${trip.destination}`;
            
            // Format and display date range
            const startDate = new Date(trip.startDate || trip.applyByDate);
            const endDate = new Date(trip.endDate);
            document.getElementById('trip-date-range').textContent = formatDateRange(startDate, endDate);
            
            // Display budget
            const budgetDisplay = document.getElementById('trip-budget-display');
            budgetDisplay.textContent = `${trip.currency || '$'} ${trip.budget || 'Budget not specified'}`;
            
            // Display daily activities if they exist
            // Display daily activities if they exist
    const activitiesContainer = document.getElementById('daily-activities');
    activitiesContainer.innerHTML = ''; // Clear existing content
    
    if (trip.dayActivities) {
        // If there are day-by-day activities
        for (const dayNum in trip.dayActivities) {
            const dayActivity = trip.dayActivities[dayNum];
            const dayElement = document.createElement('div');
            dayElement.className = 'day-item';
            dayElement.innerHTML = `
                <div class="day-title">Day ${dayNum.replace('day', '')}</div>
                <div class="day-description">${dayActivity}</div>
            `;
            activitiesContainer.appendChild(dayElement);
        }
    } else if (trip.activities && trip.activities.length > 0) {
        // If there's just a list of activities
        const dayElement = document.createElement('div');
        dayElement.className = 'day-item';
        dayElement.innerHTML = `
            <div class="day-title">Planned Activities</div>
            <div class="day-description">${trip.activities.join('<br>')}</div>
        `;
        activitiesContainer.appendChild(dayElement);
    } else if (trip.details) {
        // If there are general trip details
        const dayElement = document.createElement('div');
        dayElement.className = 'day-item';
        dayElement.innerHTML = `
            <div class="day-title">Trip Details</div>
            <div class="day-description">${trip.details}</div>
        `;
        activitiesContainer.appendChild(dayElement);
    } else {
        // No details available
        const dayElement = document.createElement('div');
        dayElement.className = 'day-item';
        dayElement.innerHTML = `
            <div class="day-title">No Details Available</div>
            <div class="day-description">This trip doesn't have any daily activities or details specified.</div>
        `;
        activitiesContainer.appendChild(dayElement);
    }
            
            // Display the modal
            modal.style.display = 'flex';
            
        } catch (error) {
            console.error("Error loading trip details:", error, error.stack);
            alert("Failed to load trip details. Please try again.");
        }
    }
    
    
    
    // Replace the existing updateViewButtonListeners function with this:
    function updateViewButtonListeners() {
        const viewButtons = document.querySelectorAll('.view-btn-review');
        console.log('Found view buttons:', viewButtons.length);
        
        viewButtons.forEach(btn => {
            // Remove any existing listeners to prevent duplicates
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', function() {
                const tripId = this.getAttribute('data-id');
                const tripUser = this.getAttribute('data-user');
                console.log('View button clicked for trip:', tripId, 'by user:', tripUser);
                openDetailsModal(tripId, tripUser);
            });
        });
    }
    
    
    // Initialize everything when the page loads
    // Add this to your DOMContentLoaded event listener
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            console.log('DOM loaded, initializing trip display');
            
            // Get past trips
            const pastTrips = await fetchPastPublicTrips();
            console.log('Fetched past trips:', pastTrips);
            
            // Display them in the slider
            displayTrips(pastTrips);
            
            // Setup navigation
            setupNavigation();
            
            // Setup review modal
            setupReviewModal();
            
            // Make sure details modal close button works
            const detailsModal = document.getElementById('details-modal-review');
            if (detailsModal) {
                const closeBtn = detailsModal.querySelector('.close-modal-review');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        detailsModal.style.display = 'none';
                    });
                }
                
                // Close when clicking outside
                window.addEventListener('click', (event) => {
                    if (event.target === detailsModal) {
                        detailsModal.style.display = 'none';
                    }
                });
            } else {
                console.error('Details modal not found in DOM');
            }
        } catch (error) {
            console.error('Error loading trips:', error);
            // ... error handling ...
        }
    });
    