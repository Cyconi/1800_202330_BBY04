function loadUserPosts() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            let userID = user.uid
            db.collection('users').doc(userID).get().then(userDoc => {
                let userLocation = userDoc.data().location
                let postsArray = userDoc.data().posts || []
                let postsTemplate = document.querySelector('#userPostTemplate')

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

document.querySelector('.delete-confirm-button').addEventListener('click', function() {
    document.querySelector('.delete-confirm-container').style.display = 'none'
})

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