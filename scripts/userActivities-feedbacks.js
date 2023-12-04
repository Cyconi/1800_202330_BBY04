/**
 * Loads and displays the current user's feedbacks. This function authenticates the user and then
 * retrieves the user's feedback IDs from Firestore based on their user ID and location. It then
 * fetches each feedback using the retrieved IDs and displays them by calling `populateFeedbackData`.
 */
function loadUserFeedbacks () {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            let userID = user.uid

            db.collection('users').doc(userID).get().then(userDoc => {
                let userLocation = userDoc.data().location
                let feedbackArray = userDoc.data().feedbacks || []
                feedbackArray.forEach(feedbackID => {

                        db.collection(`feedbacks-${userLocation}`).doc(feedbackID).get().then(doc => {

                            populateFeedbackData(doc, userID, userLocation)

                        })
                })
            })
        }
    })
}
loadUserFeedbacks()

/**
 * Adds an event listener to the 'Close' button on the delete confirmation dialog. When clicked,
 * it hides the delete confirmation dialog, allowing the user to cancel the deletion process.
 */
document.querySelector('.delete-confirm-button').addEventListener('click', function() {
    document.querySelector('.delete-confirm-container').style.display = 'none'
})

/**
 * Adds an event listener to the 'Yes' button on the delete confirmation dialog for feedback.
 * When clicked, it performs the deletion of the selected feedback from Firestore and updates
 * the user's document to reflect the removal of the feedback. The page is reloaded post-deletion
 * to update the displayed feedbacks.
 */
document.querySelector('.yes').addEventListener('click', function() {
    let feedbackID = document.querySelector('.yes').value
    console.log(feedbackID)
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            let userID = user.uid
            console.log(userID)

            db.collection('users').doc(userID).get().then(userDoc => {
                let userLocation = userDoc.data().location
                console.log(userLocation)

                db.collection(`feedbacks-${userLocation}`).doc(feedbackID).delete()
                    .then(() => {
                        console.log('Success')

                        db.collection('users').doc(userID).update({
                            feedbacks: firebase.firestore.FieldValue.arrayRemove(feedbackID)
                        }).then(() => {
                            document.querySelector('.delete-confirm-container').style.display = 'none'
                            window.location.reload()
                        })

                    })
            })
        }
    })
})