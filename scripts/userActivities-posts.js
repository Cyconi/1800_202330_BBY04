/**
 * Loads and displays the current user's posts. This function first verifies user authentication
 * and then fetches the user's posts from Firestore based on their user ID and location. Each post
 * is displayed by calling `populatePostData`.
 */
function loadUserPosts() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            let userID = user.uid; // Get the user's ID

            // Fetch the user's document from Firestore
            db.collection('users').doc(userID).get().then(userDoc => {
                let userLocation = userDoc.data().location; // Get the user's location
                let postsArray = userDoc.data().posts || []; // Get the user's posts or an empty array if none

                // For each post ID in the user's posts array
                postsArray.forEach(postID => {
                    // Fetch the post document from Firestore
                    db.collection(`posts-${userLocation}`).doc(postID).get().then(doc => {
                        // Display the post using `populatePostData`
                        populatePostData(doc, userID, userLocation);
                    });
                });
            });
        }
    });
}
loadUserPosts(); // Execute the function

/**
 * Adds an event listener to the 'Close' button on the delete confirmation dialog. When clicked,
 * it hides the delete confirmation dialog without performing any deletion action.
 */
document.querySelector('.delete-confirm-button').addEventListener('click', function() {
    // Hide the delete confirmation dialog
    document.querySelector('.delete-confirm-container').style.display = 'none';
});

/**
 * Adds an event listener to the 'Yes' button on the delete confirmation dialog. When clicked,
 * it deletes the selected post from Firestore and updates the user's document to reflect the
 * removal of the post. After successfully deleting the post, it reloads the page to update
 * the displayed posts.
 */
document.querySelector('.yes').addEventListener('click', function() {
    let postID = document.querySelector('.yes').value; // Get the ID of the post to be deleted

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            let userID = user.uid; // Get the user's ID

            // Fetch the user's document from Firestore
            db.collection('users').doc(userID).get().then(userDoc => {
                let userLocation = userDoc.data().location; // Get the user's location

                // Delete the post from Firestore
                db.collection(`posts-${userLocation}`).doc(postID).delete().then(() => {
                    // Update the user's document to remove the post ID
                    db.collection('users').doc(userID).update({
                        posts: firebase.firestore.FieldValue.arrayRemove(postID)
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
