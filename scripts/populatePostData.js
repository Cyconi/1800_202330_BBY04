/**
 * Populates a post template with data from a Firestore document and appends it to the post section.
 * It sets up the content, photo, like button, and delete functionality for the post.
 *
 * @param {Object} doc - Firestore document containing the post's data.
 * @param {string} userID - ID of the current user.
 * @param {string} userLocation - Location of the user, used to specify the Firestore collection for likes.
 */
function populatePostData(doc, userID, userLocation) {
    let docID = doc.id; // Get the document ID from the Firestore document
    const firestoreTimeStamp = doc.data().timestamp; // Retrieve the timestamp from the document
    const date = firestoreTimeStamp.toDate(); // Convert Firestore timestamp to JavaScript Date object

    let voteUsers = doc.data().voteUser || []; // Get the list of users who voted or an empty array if none
    let userIndex = voteUsers.indexOf(userID); // Check if the current user is in the list of users who voted

    let posterID = doc.data().posterID; // Retrieve the poster's user ID from the document

    // Fetch the poster's user document from Firestore
    db.collection('users').doc(posterID).get().then(posterDoc => {
        let postsTemplate = document.getElementById("userPostTemplate"); // Get the post template element
        let newpost = postsTemplate.content.cloneNode(true); // Clone the post template

        setUpPostContent(newpost, doc, posterDoc, date); // Populate the post content
        setUpPostPhoto(newpost, doc, posterDoc); // Set up the post photo
        setUpDeleteButton(newpost, docID); // Set up the delete button (function not provided in the snippet)

        let likeIcon = newpost.querySelector('i.fa-thumbs-up'); // Select the like icon element
        let postLikesNumber = newpost.querySelector('.likes-number'); // Select the likes number element
        setUpLikeButton(newpost, docID, userID, userLocation, likeIcon, postLikesNumber); // Set up the like button

        document.getElementById("posts-goes-here").appendChild(newpost); // Append the new post to the DOM

        // Update the like icon based on whether the user has liked the post
        if (userIndex === -1) {
            likeIcon.classList.add('fa-regular');
        } else {
            likeIcon.classList.add('fa-solid');
        }
    });
}

/**
 * Sets up the text content of a post, including the post's text, poster's name, likes, comments,
 * and the time the post was created. It also sets the hyperlink reference for the post.
 *
 * @param {Element} newpost - The new post element being set up.
 * @param {Object} doc - Firestore document of the post.
 * @param {Object} posterDoc - Firestore document of the poster.
 * @param {Date} date - The date the post was created.
 */
function setUpPostContent(newpost, doc, posterDoc, date) {
    // Populate the new post element with data from the Firestore documents
    newpost.querySelector('.postImg').id = `post-img-${doc.id}`;
    newpost.querySelector('.postText-goes-here').innerText = doc.data().text;
    newpost.querySelector('.posterName-goes-here').innerText = posterDoc.data().name;
    newpost.querySelector('.likes-number').innerText = doc.data().likesNumber;
    newpost.querySelector('.comments-number').innerText = doc.data().commentsNumber;
    newpost.querySelector('.postTime-goes-here').innerHTML = new Date(date).toLocaleString();
    newpost.querySelector('a').href = "eachPost.html?docID=" + doc.id;
}

/**
 * Sets up the photo of the post and the poster's profile picture. If a photo URL is provided,
 * it is set as the source of the corresponding image element. If not, the image container is hidden.
 *
 * @param {Element} newpost - The new post element.
 * @param {Object} doc - Firestore document containing the post's data.
 * @param {Object} posterDoc - Firestore document of the poster.
 */
function setUpPostPhoto(newpost, doc, posterDoc) {
    let imageUrl = doc.data().imageUrl; // Get the image URL from the post document
    let posterImg = posterDoc.data().photoURL; // Get the poster's profile picture URL

    // Set up the post's image if it exists
    if (imageUrl) {
        let imgElement = newpost.querySelector('.postImg-goes-here');
        imgElement.src = imageUrl;
        imgElement.style.display = 'block';
    } else {
        newpost.querySelector(`#post-img-${doc.id}`).style.display = 'none';
    }

    // Set up the poster's profile picture if it exists
    if (posterImg) {
        let posterPhoto = newpost.querySelector('.posterImg');
        posterPhoto.src = posterImg;
    }
}

/**
 * Attaches an event listener to the like button of a post. When clicked, it triggers the like logic,
 * which handles the liking or unliking of a post and updates the like count and icon appearance.
 *
 * @param {Element} newpost - The post element containing the like button.
 * @param {string} docID - The document ID of the post.
 * @param {string} userID - The user ID of the current user.
 * @param {string} userLocation - The user's location, used to specify the Firestore collection.
 * @param {Element} likeIcon - The DOM element representing the like icon.
 * @param {Element} postLikesNumber - The DOM element displaying the number of likes.
 */
function setUpLikeButton(newpost, docID, userID, userLocation, likeIcon, postLikesNumber) {
    // Add event listeners to handle the like functionality
    newpost.querySelector('.post-icon-like').addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        // Call function to handle the like logic for the post
        handleLikeLogic("posts", docID, userID, userLocation, likeIcon, postLikesNumber);
    });
}
