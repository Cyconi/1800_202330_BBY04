/**
 * Populates a post template with data from a Firestore document and appends it to the post section.
 * It sets up the content, photo, like button, and delete functionality for the post.
 *
 * @param {Object} doc - Firestore document containing the post's data.
 * @param {string} userID - ID of the current user.
 * @param {string} userLocation - Location of the user, used to specify the Firestore collection for likes.
 */
function populatePostData(doc, userID, userLocation) {
    let docID = doc.id
    const firestoreTimeStamp = doc.data().timestamp;
    const date = firestoreTimeStamp.toDate();

    let voteUsers = doc. data().voteUser || []
    let userIndex = voteUsers.indexOf(userID)

    let posterID = doc.data().posterID;

    db.collection('users').doc(posterID).get().then(posterDoc => {
        let postsTemplate = document.getElementById("userPostTemplate")
        let newpost = postsTemplate.content.cloneNode(true);

        setUpPostContent(newpost,doc,posterDoc, date)
        setUpPostPhoto(newpost, doc, posterDoc)
        setUpDeleteButton(newpost, docID)

        let likeIcon =  newpost.querySelector('i.fa-thumbs-up')
        let postLikesNumber = newpost.querySelector('.likes-number')
        setUpLikeButton(newpost, docID, userID, userLocation, likeIcon, postLikesNumber)

        document.getElementById("posts-goes-here").appendChild(newpost);

        if (userIndex === -1) {
            likeIcon.classList.add('fa-regular')

        } else {
            likeIcon.classList.add('fa-solid')
        }

    })

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
    newpost.querySelector('.postImg').id = `${doc.id}`
    newpost.querySelector('.postText-goes-here').innerText = doc.data().text
    newpost.querySelector('.posterName-goes-here').innerText = posterDoc.data().name
    newpost.querySelector('.likes-number').innerText = doc.data().likesNumber
    newpost.querySelector('.comments-number').innerText = doc.data().commentsNumber
    newpost.querySelector('.postTime-goes-here').innerHTML = new Date(date).toLocaleString()
    newpost.querySelector('a').href = "eachPost.html?docID=" + doc.id
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
    let imageUrl = doc.data().imageUrl;
    let posterImg = posterDoc.data().photoURL;

    if (imageUrl) {
        let imgElement = newpost.querySelector('.postImg-goes-here');
        imgElement.src = imageUrl;
        imgElement.style.display = 'block';
    } else {
        document.getElementById(`${doc.id}`).style.display = 'none';
    }

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

    newpost.querySelector('.post-icon-like').addEventListener('click', function(event){
        event.preventDefault();
        event.stopPropagation();
        handleLikeLogic("posts", docID, userID, userLocation, likeIcon, postLikesNumber);
    });
}
