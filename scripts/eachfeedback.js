/**
 * Displays detailed information about a specific feedback item. This function fetches and shows
 * feedback details including title, text, likes, comments, and an image if available. It also sets up
 * like button functionalities and updates their appearance based on user interaction.
 */
function displayFeedbackInfo() {
    let params = new URL(window.location.href)
    let ID = params.searchParams.get("docId")
    console.log(ID)

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {  // check user is login
            db.collection('users').doc(user.uid).get().then(doc => { // get user document from firestore

                let userLocation = doc.data().location   // read the location field of document
                let userID = user.uid

                db.collection(`feedbacks-${userLocation}`) // use userLocation to find the collection that match user location
                    .doc(ID)
                    .get()
                    .then(doc => {
                        let data = doc.data()
                        let voteUsers = doc.data().voteUser || []   // check whether userId is in the array voteUser
                        let userIndex = voteUsers.indexOf(userID) // which indicate if the current user have liked this feedback before.
                        let likeButton = document.querySelector('#circle-up');

                        if (userIndex === -1) {  // change the like button style base on the check result.
                            likeButton.classList.add('fa-regular')
                        } else {
                            likeButton.classList.add('fa-solid')
                        }
                        document.querySelector('.feedback-title').innerText = data.title
                        document.querySelector('.feedback-detail').innerText = data.text
                        document.querySelector('.feedback-likes-number').innerText = data.likesNumber
                        document.querySelector('.feedback-comments-number').innerText = data.commentsNumber

                        let imageURL = data.photoURL
                        if (imageURL) {             // check if user upload a photo for the post, if didn't, hide the container for the image
                            document.querySelector('.feedback-photo').src = imageURL
                        } else {
                            document.querySelector('.feedback-photo').style.display = 'none'
                        }

                        // Set up like button on each post
                        let feedbackLikesNumber = document.querySelector('.feedback-likes-number')
                        document.querySelector('#feedback-add-like').addEventListener('click', function () {
                            handleLikeLogic('feedbacks', ID, userID, userLocation, likeButton, feedbackLikesNumber)
                        })
                        document.querySelector('.feedback-vote').addEventListener('click', function () {
                            handleLikeLogic('feedbacks', ID, userID, userLocation, likeButton, feedbackLikesNumber)
                        })
                    })
            })
        }
    })
}
displayFeedbackInfo()

/**
 * Adds an event listener to the comment submission form. When a comment is submitted,
 * it prevents the default form action, checks if the user is logged in, and then posts
 * the comment to the 'feedbacks-comments' collection in Firestore. It also updates the
 * comments count for the feedback.
 */
document.querySelector('#comment-form').addEventListener('submit', function(event) {
    event.preventDefault()

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {  // check if user is login
            let userID = user.uid

            let comment = document.querySelector('#comment-input').value
            let params = new URL(window.location.href)
            let ID = params.searchParams.get("docId")

            if (user&& comment.trim() !== "") {

                db.collection('users').doc(userID).get().then(function(doc) {
                    let userLocation = doc.data().location
                    firebase.firestore().collection("feedbacks-comments").add({
                        commenterID: userID,
                        comment: comment,
                        feedbackID: ID,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(function() {
                        console.log("Comment added!")
                        document.querySelector('#comment-input').value = ""
                        addCommentsNumber(userLocation, "feedbacks")
                    })
                })

            } else {
                console.log('No user login')
            }

        }
    })
})

/**
 * Loads and displays comments for a specific feedback item. This function listens to the
 * 'feedbacks-comments' collection in Firestore, fetching comments associated with the current
 * feedback item and appending them to the comment display area.
 */
function loadFeedbackComment () {
    let params = new URL(window.location.href)
    let ID = params.searchParams.get("docId")

    db.collection('feedbacks-comments').where("feedbackID", "==", ID).orderBy("timestamp")
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                let data = change.doc.data()
                let commentID = `comment-${change.doc.id}`

                if(change.type === "added") {
                    let commentTemplate = document.querySelector('#feedback-comment-template')
                    let newComment = commentTemplate.content.cloneNode(true)

                    newComment.querySelector('.feedback-comment-container').id = commentID
                    newComment.querySelector('.feedback-comment-text').innerText = data.comment

                    document.querySelector('#comment-display').appendChild(newComment);
                }
            })
        })
}
loadFeedbackComment()

/**
 * Increments and updates the comments number for a specific feedback item in Firestore.
 * After updating, it also reflects the new comments count in the user interface.
 *
 * @param {string} userLocation - Location of the user, used to specify the Firestore collection.
 * @param {string} section - The section type ('feedbacks' in this case), used to determine the correct Firestore collection.
 */
function addCommentsNumber(userLocation, section) {
    let params = new URL(window.location.href)
    let ID = params.searchParams.get("docId")

    db.collection(`${section}-${userLocation}`).doc(ID).get().then(doc => {
        let commentsNumber = doc.data().commentsNumber
        commentsNumber += 1
        db.collection(`${section}-${userLocation}`).doc(ID).update({
            commentsNumber: commentsNumber
        }).then(() => {
            console.log("Comments number added")
            document.querySelector('.feedback-comments-number').innerText = commentsNumber
        })
    })
}

