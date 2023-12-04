/**
 * Loads and displays the current user's posts. This function first verifies user authentication
 * and then fetches the user's posts from Firestore based on their user ID and location. Each post
 * is displayed by calling `populatePostData`.
 */
function loadUserPosts() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            let userID = user.uid
            db.collection('users').doc(userID).get().then(userDoc => {
                let userLocation = userDoc.data().location
                let postsArray = userDoc.data().posts || []


                postsArray.forEach(postID => {
                    db.collection(`posts-${userLocation}`).doc(postID).get().then(doc => {

                        populatePostData(doc, userID, userLocation)

                    })
                })
            })
        }
    })
}
loadUserPosts()

/**
 * Adds an event listener to the 'Close' button on the delete confirmation dialog. When clicked,
 * it hides the delete confirmation dialog without performing any deletion action.
 */
document.querySelector('.delete-confirm-button').addEventListener('click', function() {
    document.querySelector('.delete-confirm-container').style.display = 'none'
})

/**
 * Adds an event listener to the 'Yes' button on the delete confirmation dialog. When clicked,
 * it deletes the selected post from Firestore and updates the user's document to reflect the
 * removal of the post. After successfully deleting the post, it reloads the page to update
 * the displayed posts.
 */
document.querySelector('.yes').addEventListener('click', function() {
    let postID = document.querySelector('.yes').value
    console.log(postID)
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            let userID = user.uid
            console.log(userID)

            db.collection('users').doc(userID).get().then(userDoc => {
                let userLocation = userDoc.data().location
                console.log(userLocation)

                db.collection(`posts-${userLocation}`).doc(postID).delete()
                    .then(() => {
                        console.log('Success')

                        db.collection('users').doc(userID).update({
                            posts: firebase.firestore.FieldValue.arrayRemove(postID)
                        }).then(() => {
                            document.querySelector('.delete-confirm-container').style.display = 'none'
                            window.location.reload()
                        })

                    })
            })
        }
    })
})