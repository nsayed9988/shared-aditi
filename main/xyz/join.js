// Make joinTrip function available globally
/*window.joinTrip = async function(tripId) {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
        alert('Please log in to join trips');
        return;
    }
    
    try {
        const tripsRef = ref(database, 'travel-bookings');
        
        // Find trip creator's email
        let tripCreatorEmail = null;
        const snapshot = await get(tripsRef);
        const allData = snapshot.val();
        
        // Debug logs
        console.log('Current user email:', currentUser.email);
        
        Object.keys(allData).forEach(userEmail => {
            if (allData[userEmail]?.['public-trips']?.[tripId]) {
                tripCreatorEmail = userEmail;
                console.log('Found trip creator email:', tripCreatorEmail);
            }
        });
        
        if (!tripCreatorEmail) {
            throw new Error('Trip not found');
        }
        
        // Sanitize and normalize emails for comparison
        function sanitizeEmail(email) {
            // Replace commas with periods (fixes the common typo)
            let sanitized = email.replace(/,/g, '.');
            
            // Convert to lowercase and trim whitespace
            sanitized = sanitized.toLowerCase().trim();
            
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(sanitized)) {
                console.warn(`Potentially invalid email format: ${sanitized}`);
            }
            
            return sanitized;
        }
        
        const normalizedUserEmail = sanitizeEmail(currentUser.email);
        const normalizedCreatorEmail = sanitizeEmail(tripCreatorEmail);
        
        console.log('Normalized current user email:', normalizedUserEmail);
        console.log('Normalized trip creator email:', normalizedCreatorEmail);
        console.log('Are emails equal?', normalizedUserEmail === normalizedCreatorEmail);
        
        // Check if the current user is the trip creator
        if (normalizedUserEmail === normalizedCreatorEmail) {
            console.log('Self-join attempt prevented');
            alert('You cannot request to join your own trip');
            return;
        }
        
        const requestData = {
            requesterId: currentUser.uid,
            requesterEmail: currentUser.email,
            tripId: tripId,
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        
        // Log the request data
        console.log('Creating request with data:', requestData);
        
        const requestRef = ref(
            database, 
            `travel-bookings/${tripCreatorEmail}/public-trips/${tripId}/requests/${currentUser.uid}`
        );
        
        await set(requestRef, requestData);
        console.log('Request successfully created');
        alert('Your request to join has been submitted!');
    } catch (error) {
        console.error('Error joining trip:', error);
        alert('Failed to submit join request. Please try again.');
    }
};
*/





async function joinTrip(tripId) {
    // Get the currently logged-in user
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
        alert('Please log in to join trips');
        return;
    }

    try {
        // Create a new request entry
        const requestData = {
            requesterId: currentUser.uid,
            requesterEmail: currentUser.email,
            tripId: tripId,
            status: 'pending',
            timestamp: new Date().toISOString()
        };

        // Create a reference for the new request
        // Store requests at: travel-bookings/{tripCreatorEmail}/public-trips/{tripId}/requests/{requesterId}
        const tripsRef = ref(database, 'travel-bookings');
        
        // First, find the trip creator's email by searching through all users
        let tripCreatorEmail = null;
        const snapshot = await get(tripsRef);
        const allData = snapshot.val();
        
        // Search through all users to find the trip
        Object.keys(allData).forEach(userEmail => {
            if (allData[userEmail]?.['public-trips']?.[tripId]) {
                tripCreatorEmail = userEmail;
            }
        });

        if (!tripCreatorEmail) {
            throw new Error('Trip not found');
        }

        // Create the request in the database
        const requestRef = ref(
            database, 
            `travel-bookings/${tripCreatorEmail}/public-trips/${tripId}/requests/${currentUser.uid}`
        );

        await set(requestRef, requestData);
        
        alert('Your request to join has been submitted!');
    } catch (error) {
        console.error('Error joining trip:', error);
        alert('Failed to submit join request. Please try again.');
    }
}

