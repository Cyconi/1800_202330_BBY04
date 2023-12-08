/**
 * Adds an event listener to the feedback post button. When clicked, it retrieves feedback title,
 * text content, and an optional photo. It then calls a function to show a thank-you message and
 * proceeds to create the feedback with or without an image, based on the user input.
 */
document.querySelector('#postButton').addEventListener('click', function() {
    let feedbackTitle = document.querySelector('#feedback-title').value; // Retrieve the value of the feedback title input
    let feedbackText = document.querySelector('#user-story').value; // Retrieve the value of the feedback text area
    let feedbackPhoto = document.querySelector('#photoUpload').files[0]; // Retrieve the uploaded photo, if any

    showThankYouMessage(); // Call a function to display a thank - ou message

    if (feedbackPhoto) {
        // If a photo is uploaded
        let storageRef = firebase.storage().ref('photos-feedback/' + feedbackPhoto.name); // Create a reference to store the photo in Firebase Storage
        storageRef.put(feedbackPhoto).then(function(snapshot) {
            // Upload the photo
            snapshot.ref.getDownloadURL().then(function(downloadURL) {
                // After the upload, get the photo's download URL
                createFeedbackWithImage(feedbackTitle, feedbackText, downloadURL); // Create the feedback with the photo URL
            })
        })
    } else {
        // If no photo is uploaded
        createFeedbackWithImage(feedbackTitle, feedbackText, null); // Create the feedback without a photo
    }
})


/**
 * Creates and posts new feedback with the provided title, text, and an optional photo URL.
 * It first verifies user authentication, then constructs the feedback object and posts it
 * to Firestore. If a photo is provided, it's uploaded and included in the feedback.
 * Additionally, the function updates the user's document with the new feedback reference.
 *
 * @param {string} title - The title of the feedback.
 * @param {string} text - The text content of the feedback.
 * @param {string|null} photoURL - The URL of the uploaded photo, if available; otherwise null.
 */
function createFeedbackWithImage(title, text, photoURL) {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // If a user is logged in
            let userID = user.uid; // Store the user's UID
            let userRef = db.collection('users').doc(userID); // Reference to the user's document in Firestore

            // Fetch the user's document to get additional details
            db.collection('users').doc(userID).get().then(userDoc => {

                let userLocation = userDoc.data().location; // Get the user's location

                // Construct the feedback object
                let feedback = {
                    posterName: userDoc.data().name, // User's name
                    posterID: userID, // User's ID
                    posterLocation: userLocation, // User's location
                    title: title, // Feedback title
                    text: text, // Feedback text
                    likesNumber: 0, // Initialize likes count
                    commentsNumber: 0, // Initialize comments count
                    timestamp: firebase.firestore.FieldValue.serverTimestamp() // Timestamp for the feedback
                }

                // Add photo URL to the feedback if provided
                if (photoURL) {
                    feedback.photoURL = photoURL;
                }

                // Add the feedback to the Firestore collection
                return db.collection(`feedbacks-${userLocation}`).add(feedback);
            }).then(feedbackRef => {
                console.log("Feedback sent with ID", feedbackRef.id); // Log the feedback ID for confirmation
                // Update the user's document with the new feedback reference
                return userRef.update({
                    feedbacks: firebase.firestore.FieldValue.arrayUnion(feedbackRef.id)
                });
            }).then(() => {
                // Redirect to the feedback page after successful posting
                window.location.assign('feedback.html');
            }).catch(error => {
                // Log any errors during the feedback posting process
                console.log("Error posting feedback: ", error);
            });
        }
    });
}


/**
 * Displays a 'Thank You' message for 20 seconds after a user submits feedback.
 * This function enhances the user experience by providing visual feedback
 * that the feedback submission process is complete.
 */
function showThankYouMessage() {
    const thankYouDiv = document.querySelector('.post-thankyou'); // Select the 'Thank You' message container
    thankYouDiv.style.display = 'flex'; // Display the 'Thank You' message

    setTimeout(() => {
        thankYouDiv.style.display = 'none'; // Hide the 'Thank You' message after 2 seconds
    }, 2000); // 2000 milliseconds (2 seconds)
}
