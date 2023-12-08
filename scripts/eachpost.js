/**
 * Retrieves and displays detailed information about a specific post. This includes the poster's image,
 * name, post time, text content, likes, comments, and an image if available. Additionally, it sets up
 * the like button's functionality and updates its appearance based on the user's interaction.
 */
function displayPostInfo() {
    let params = new URL(window.location.href)
    let ID = params.searchParams.get("docID")  // read postID from the URL

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {  // check if user is login
            db.collection('users').doc(user.uid).get().then(doc => { // get the current user document

                let userLocation = doc.data().location // read user location field from the document
                let userID = user.uid

                db.collection(`posts-${userLocation}`) // use user location to find the correct collection
                    .doc(ID)                           // use the postID to get the document
                    .get() //
                    .then(doc => {
                        let data = doc.data()

                        let postTime = doc.data().timestamp
                        let date = postTime.toDate()
                        let voteUsers = doc.data().voteUser || []  // an array storing the userID that liked this post before
                        let userIndex = voteUsers.indexOf(userID) // check whether the current userID is in the array or not
                        let likeButton = document.querySelector('#like-button')
                        if (userIndex === -1) {   //  change the style of like button based on whether current user like this post before
                            likeButton.classList.add('fa-regular')
                        } else {
                            likeButton.classList.add('fa-solid')
                        }

                        // populating data to the HTML
                        document.querySelector('.posterImg').src = data.posterImg
                        document.querySelector('.posterName-goes-here').innerText = data.poster
                        document.querySelector('.postTime-goes-here').innerHTML = new Date(date).toLocaleString()
                        document.querySelector('.postText-goes-here').innerText = data.text
                        document.querySelector('.likes-number').innerText = data.likesNumber
                        document.querySelector('.comments-number').innerText = data.commentsNumber

                        if (data.imageUrl) {  // hide the container for post image if user didn't upload one
                            document.querySelector('.postImg-goes-here').src = data.imageUrl
                        } else {
                            document.querySelector('.postImg-goes-here').style.display = 'none'
                        }

                        let likesNumber = document.querySelector('.likes-number')
                        document.querySelector('#post-icon-like').addEventListener('click', function () {
                            handleLikeLogic('posts', ID, userID, userLocation, likeButton, likesNumber)
                        })

                    })
            })
        }
    })
}
displayPostInfo()

/**
 * Adds an event listener to the comment form for submitting comments. When the form is submitted, it prevents
 * the default action and posts the comment to the 'posts-comments' collection in Firestore if the user is logged in.
 * It also increments and updates the comments count for the post.
 */
document.querySelector('#comment-form').addEventListener('submit', function(event) {
    event.preventDefault() // Prevent the default form submission behavior

    firebase.auth().onAuthStateChanged(function(user) {
        let comment = document.querySelector('#comment-input').value // Get the value of the comment input field

        if (user && comment.trim() !== "") { // Check if the user is logged in and the comment is not empty
            db.collection('users').doc(user.uid).get().then(doc => { // Retrieve the current user's document from Firestore

                let userLocation = doc.data().location // Extract the user's location from the document

                let params = new URL(window.location.href)
                let ID = params.searchParams.get("docID") // Extract the post ID from the URL
                let commenterImg = doc.data().photoURL // Get the commenter's profile image URL
                let commenter = doc.data().name // Get the commenter's name
                let commenterID = user.uid // Get the commenter's user ID

                // Add a new comment to the 'posts-comments' collection in Firestore
                firebase.firestore().collection("posts-comments").add({
                    postID: ID,
                    commenter: commenter,
                    commenterID: commenterID,
                    commenterImg: commenterImg,
                    comment: comment,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp() // Set the timestamp for the comment
                }).then(function () {
                    console.log("Comment added!") // Log the success message
                    document.querySelector('#comment-input').value = "" // Clear the comment input field
                    addCommentsNumber(userLocation, "posts") // Increment and update the comments count for the post
                })
            })
        } else {
            console.log("User is not logged in or comment is empty") // Log if the user is not logged in or the comment is empty
        }
    })
})


/**
 * Loads and displays comments for a specific post. It listens to changes in the 'posts-comments' collection in
 * Firestore, fetching comments associated with the current post, and appends them to the comment display area.
 * It also handles updates to existing comments, like the addition of timestamps.
 */
function loadComments() {
    let params = new URL(window.location.href);
    let ID = params.searchParams.get("docID"); // Extract the post ID from the URL

    db.collection('posts-comments').where("postID", "==", ID)
        .orderBy("timestamp")
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                const commentData = change.doc.data(); // Extract comment data from the document
                const commentId = `comment-${change.doc.id}`; // Generate a unique ID for the comment
                let commentElement = document.getElementById(commentId); // Find the comment element in the DOM

                if (change.type === 'added') {
                    // If a new comment is added, create a template for it
                    let commentTemplate = document.querySelector('#comment-template');
                    let newComment = commentTemplate.content.cloneNode(true); // Clone the template

                    let commentContainer = newComment.querySelector('.user-comment-container');
                    commentContainer.id = commentId; // Set the unique ID to the comment container

                    // Populate the comment data in the template
                    commentContainer.querySelector('.comment-name').innerText = commentData.commenter;
                    commentContainer.querySelector('.commenter-img').src = commentData.commenterImg || 'default-avatar.png';
                    commentContainer.querySelector('.comment-text').innerText = commentData.comment;

                    // Display the timestamp if available
                    let commentTimeElement = commentContainer.querySelector('.comment-time');
                    if (commentData.timestamp) {
                        let time = commentData.timestamp.toDate();
                        commentTimeElement.innerText = new Date(time).toLocaleString();
                    } else {
                        commentTimeElement.innerText = 'Date processing...';
                    }

                    // Append the new comment to the comment display area
                    document.querySelector('#comment-display').appendChild(commentContainer);
                }

                // If an existing comment is modified, update the timestamp
                if (change.type === 'modified' && commentElement) {
                    if (commentData.timestamp) {
                        let time = commentData.timestamp.toDate();
                        commentElement.querySelector('.comment-time').innerText = new Date(time).toLocaleString();
                    }
                }
            });
        });
}
loadComments();


/**
 * Increments and updates the comment count for a specific post in Firestore. Once updated,
 * the new comments count is also reflected in the user interface.
 *
 * @param {string} userLocation - Location of the user, used to specify the Firestore collection.
 * @param {string} section - The section type ('posts' in this case), used to determine the correct Firestore collection.
 */
function addCommentsNumber(userLocation, section) {
    let params = new URL(window.location.href);
    let ID = params.searchParams.get("docID"); // Extract the post ID from the URL

    // Fetch the current post document from Firestore
    db.collection(`${section}-${userLocation}`).doc(ID).get().then(doc => {
        let commentsNumber = doc.data().commentsNumber; // Get the current number of comments
        commentsNumber += 1; // Increment the comment count

        // Update the comments count in Firestore
        db.collection(`${section}-${userLocation}`).doc(ID).update({
            commentsNumber: commentsNumber
        }).then(() => {
            // Update the comment count in the user interface
            document.querySelector('.comments-number').innerText = commentsNumber;
        })
    })
}
