/**
 * Adds an event listener to the 'Post' button. When clicked, it uploads an image if provided,
 * retrieves the post text content, and then creates a new post using these details. It also
 * displays a thank-you message after the button is clicked.
 */
const postButton = document.getElementById("postButton");
postButton.addEventListener("click", () => {
    const textInput = document.getElementById("user-story"); // Get the text input element for the post
    const fileInput = document.getElementById('photoUpload'); // Get the file input element for the photo upload
    const file = fileInput.files[0]; // Retrieve the first file from the file input
    const postTextContent = textInput.value; // Get the text content of the post

    showThankYouMessage(); // Display a thank-you message

    if (file) {
        // If a file is provided for the post
        let storageRef = firebase.storage().ref('photos/' + file.name); // Create a reference in Firebase Storage for the photo
        storageRef.put(file).then(function(snapshot) {
            // Upload the file to Firebase Storage
            snapshot.ref.getDownloadURL().then(function(downloadURL) {
                // Get the download URL of the uploaded photo
                createPostWithImage(postTextContent, downloadURL); // Create a new post with the text content and photo URL
            });
        });
    } else {
        // If no file is provided
        createPostWithImage(postTextContent, null); // Create a new post with only the text content
    }
});

/**
 * Creates a new post with the provided text content and image URL (if available). The function
 * checks if the user is logged in, retrieves the user's details, and then writes the new post
 * to the Firestore database. It also updates the user's document with the new post reference.
 *
 * @param {string} postTextContent - The text content of the post.
 * @param {string|null} imageUrl - The URL of the uploaded image, if available; otherwise null.
 */
function createPostWithImage(postTextContent, imageUrl) {
    firebase.auth().onAuthStateChanged(user => {
        // Check if a user is logged in
        if (user) {
            let userID = user.uid; // Get the user's ID
            let userRef = db.collection('users').doc(userID); // Reference to the user's document in Firestore

            db.collection("users").doc(userID).get().then((doc) => {
                // Get the user's document from Firestore
                let userLocation = doc.data().location; // Retrieve the user's location
                let postWrite = db.collection(`posts-${userLocation}`); // Reference to the posts collection for the user's location
                let userName = doc.data().name; // Get the user's name

                // Construct the post data
                let postData = {
                    posterID: userID,
                    poster: userName,
                    posterLocation: userLocation,
                    text: postTextContent,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(), // Set the current timestamp
                    likesNumber: 0,
                    commentsNumber: 0
                };

                // Add poster's profile picture URL if available
                if (doc.data().photoURL) {
                    postData.posterImg = doc.data().photoURL;
                }

                // Add the image URL if provided
                if (imageUrl) {
                    postData.imageUrl = imageUrl;
                }

                // Add the new post to Firestore
                return postWrite.add(postData);
            }).then(function(postRef) {
                console.log("Post success with ID ", postRef.id); // Log the success message with the new post's ID
                // Update the user's document with the reference to the new post
                return userRef.update({
                    posts: firebase.firestore.FieldValue.arrayUnion(postRef.id)
                });
            }).then(() => {
                // Redirect to the main page after successfully creating the post
                window.location.assign('main.html');
            });
        }
    });
}

/**
 * Displays a 'Thank You' message for 20 seconds. This function is called after a user
 * submits a post, providing visual feedback that the post submission process is complete.
 */
function showThankYouMessage() {
    const thankYouDiv = document.querySelector('.post-thankyou'); // Select the thank-you message container
    thankYouDiv.style.display = 'flex'; // Display the thank-you message

    setTimeout(() => {
        thankYouDiv.style.display = 'none'; // Hide the thank-you message after 2 seconds
    }, 2000);
}
