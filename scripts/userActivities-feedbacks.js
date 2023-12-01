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

document.querySelector('.delete-confirm-button').addEventListener('click', function() {
    document.querySelector('.delete-confirm-container').style.display = 'none'
})

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