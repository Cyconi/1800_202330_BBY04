/**
 * Adds an event listener to the feedback post button. When clicked, it retrieves feedback title,
 * text content, and an optional photo. It then calls a function to show a thank you message and
 * proceeds to create the feedback with or without an image, based on the user input.
 */
document.querySelector('#postButton').addEventListener('click', function(){
    let feedbackTitle = document.querySelector('#feedback-title').value
    let feedbackText = document.querySelector('#user-story').value
    let feedbackPhoto = document.querySelector('#photoUpload').files[0]

    showThankYouMessage()
    if (feedbackPhoto) {
        let storageRef = firebase.storage().ref('photos-feedback/' + feedbackPhoto.name)
        storageRef.put(feedbackPhoto).then(function(snapshot) {
            snapshot.ref.getDownloadURL().then(function(downloadURL) {
                createFeedbackWithImage(feedbackTitle, feedbackText, downloadURL)
            })
        })
    } else {
        createFeedbackWithImage(feedbackTitle, feedbackText, null)
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
function createFeedbackWithImage(title, text, photoURL){
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            let userID = user.uid
            let userRef = db.collection('users').doc(userID)

            db.collection('users').doc(userID).get().then(userDoc => {

                let userLocation = userDoc.data().location

                let feedback = {
                    posterName: userDoc.data().name,
                    posterID: userID,
                    posterLocation: userDoc.data().location,
                    title: title,
                    text: text,
                    likesNumber: 0,
                    commentsNumber: 0,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()

                }
                if (photoURL) {
                    feedback.photoURL =  photoURL
                }

                return db.collection(`feedbacks-${userLocation}`).add(feedback)
            }).then(feedbackRef => {
                console.log("Feedback sent with ID", feedbackRef.id)
                return userRef.update({
                    feedbacks:firebase.firestore.FieldValue.arrayUnion(feedbackRef.id)
                })
            }).then(() => {
                window.location.assign('feedback.html')
            }).catch(error => {
                console.log("Error posting feedback: ", error)
            })
        }
    })
}

/**
 * Displays a 'Thank You' message for 20 seconds after a user submits feedback.
 * This function enhances the user experience by providing visual feedback
 * that the feedback submission process is complete.
 */
function showThankYouMessage() {
    const thankYouDiv = document.querySelector('.post-thankyou')
    thankYouDiv.style.display = 'flex'

    setTimeout(() => {
        thankYouDiv.style.display = 'none'
    }, 20000)
}
