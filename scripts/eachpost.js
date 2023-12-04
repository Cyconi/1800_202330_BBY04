/**
 * Retrieves and displays detailed information about a specific post. This includes the poster's image,
 * name, post time, text content, likes, comments, and an image if available. Additionally, it sets up
 * the like button's functionality and updates its appearance based on the user's interaction.
 */
function displayPostInfo() {
    let params = new URL(window.location.href)
    let ID = params.searchParams.get("docID")

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            db.collection('users').doc(user.uid).get().then(doc => {

                let userLocation = doc.data().location
                let userID = user.uid

                db.collection(`posts-${userLocation}`)
                    .doc(ID)
                    .get()
                    .then(doc => {
                        let data = doc.data()

                        let postTime = doc.data().timestamp
                        let date = postTime.toDate()
                        let voteUsers = doc.data().voteUser || []
                        let userIndex = voteUsers.indexOf(userID)
                        let likeButton = document.querySelector('#like-button')
                        if (userIndex === -1) {
                            likeButton.classList.add('fa-regular')
                        } else {
                            likeButton.classList.add('fa-solid')
                        }
                        document.querySelector('.posterImg').src = data.posterImg
                        document.querySelector('.posterName-goes-here').innerText = data.poster
                        document.querySelector('.postTime-goes-here').innerHTML = new Date(date).toLocaleString()
                        document.querySelector('.postText-goes-here').innerText = data.text
                        document.querySelector('.likes-number').innerText = data.likesNumber
                        document.querySelector('.comments-number').innerText = data.commentsNumber

                        if (data.imageUrl) {
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
    event.preventDefault()
    firebase.auth().onAuthStateChanged(function(user) {
        let comment = document.querySelector('#comment-input').value
        if (user&& comment.trim() !== "") {
            db.collection('users').doc(user.uid).get().then(doc => {

                let userLocation = doc.data().location

                let params = new URL(window.location.href)
                let ID = params.searchParams.get("docID")
                let commenterImg = doc.data().photoURL
                let comment = document.querySelector('#comment-input').value
                let commenter = doc.data().name
                let commenterID = user.uid

                firebase.firestore().collection("posts-comments").add({
                    postID: ID,
                    commenter: commenter,
                    commenterID: commenterID,
                    commenterImg: commenterImg,
                    comment: comment,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                }).then(function () {
                    console.log("Comment added!")
                    document.querySelector('#comment-input').value = ""
                    addCommentsNumber(userLocation, "posts")
                })
            })
        } else {
            console.log("user is not login")
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
    let ID = params.searchParams.get("docID");

    db.collection('posts-comments').where("postID", "==", ID)
        .orderBy("timestamp")
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                const commentData = change.doc.data();
                const commentId = `comment-${change.doc.id}`;
                let commentElement = document.getElementById(commentId);

                if (change.type === 'added') {
                    let commentTemplate = document.querySelector('#comment-template');
                    let newComment = commentTemplate.content.cloneNode(true);

                    let commentContainer = newComment.querySelector('.user-comment-container');
                    commentContainer.id = commentId; // Set a unique ID

                    commentContainer.querySelector('.comment-name').innerText = commentData.commenter;
                    commentContainer.querySelector('.commenter-img').src = commentData.commenterImg || 'default-avatar.png';
                    commentContainer.querySelector('.comment-text').innerText = commentData.comment;

                    // Check if the timestamp exists
                    let commentTimeElement = commentContainer.querySelector('.comment-time');
                    if (commentData.timestamp) {
                        let time = commentData.timestamp.toDate();
                        commentTimeElement.innerText = new Date(time).toLocaleString();
                    } else {
                        commentTimeElement.innerText = 'Date processing...';
                    }

                    document.querySelector('#comment-display').appendChild(commentContainer);
                }

                // Handle modifications (like the addition of the timestamp)
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
    let params = new URL(window.location.href)
    let ID = params.searchParams.get("docID")

    db.collection(`${section}-${userLocation}`).doc(ID).get().then(doc => {
        let commentsNumber = doc.data().commentsNumber
        commentsNumber += 1
        db.collection(`${section}-${userLocation}`).doc(ID).update({
            commentsNumber: commentsNumber
        }).then(() => {
            console.log("Comments number added")
            document.querySelector('.comments-number').innerText = commentsNumber
        })
    })
}