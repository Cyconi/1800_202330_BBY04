/**
 * Loads and displays the current user's feedbacks. This function authenticates the user and then
 * retrieves the user's feedback IDs from Firestore based on their user ID and location. It then
 * fetches each feedback using the retrieved IDs and displays them by calling `populateFeedbackData`.
 */
function loadUserFeedbacks() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            let userID = user.uid; // Get the user's ID

            // Fetch the user's document from Firestore
            db.collection('users').doc(userID).get().then(userDoc => {
                let userLocation = userDoc.data().location; // Get the user's location
                let feedbackArray = userDoc.data().feedbacks || []; // Get the user's feedbacks or an empty array if none

                // For each feedback ID in the user's feedbacks array
                feedbackArray.forEach(feedbackID => {
                    // Fetch the feedback document from Firestore
                    db.collection(`feedbacks-${userLocation}`).doc(feedbackID).get().then(doc => {
                        // Display the feedback using `populateFeedbackData`
                        populateFeedbackData(doc, userID, userLocation);
                    });
                });
            });
        }
    });
}
loadUserFeedbacks();

/**
 * Adds an event listener to the 'Close' button on the delete confirmation dialog. When clicked,
 * it hides the delete confirmation dialog, allowing the user to cancel the deletion process.
 */
document.querySelector('.delete-confirm-button').addEventListener('click', function() {
    // Hide the delete confirmation dialog
    document.querySelector('.delete-confirm-container').style.display = 'none';
});

/**
 * Adds an event listener to the 'Yes' button on the delete confirmation dialog for feedback.
 * When clicked, it performs the deletion of the selected feedback from Firestore and updates
 * the user's document to reflect the removal of the feedback. The page is reloaded post-deletion
 * to update the displayed feedbacks.
 */
document.querySelector('.yes').addEventListener('click', function() {
    let feedbackID = document.querySelector('.yes').value; // Get the ID of the feedback to be deleted

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            let userID = user.uid; // Get the user's ID

            // Fetch the user's document from Firestore
            db.collection('users').doc(userID).get().then(userDoc => {
                let userLocation = userDoc.data().location; // Get the user's location

                // Delete the feedback from Firestore
                db.collection(`feedbacks-${userLocation}`).doc(feedbackID).delete().then(() => {
                    // Update the user's document to remove the feedback ID
                    db.collection('users').doc(userID).update({
                        feedbacks: firebase.firestore.FieldValue.arrayRemove(feedbackID)
                    }).then(() => {
                        // Hide the delete confirmation dialog and reload the page
                        document.querySelector('.delete-confirm-container').style.display = 'none';
                        window.location.reload();
                    });
                });
            });
        }
    });
});
