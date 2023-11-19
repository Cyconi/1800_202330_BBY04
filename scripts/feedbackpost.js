document.querySelector('#postButton').addEventListener('click', function(){
    let feedbackTitle = document.querySelector('#feedback-title').value
    let feedbackText = document.querySelector('#user-story').value
    let feedbackPhoto = document.querySelector('#photoUpload').files[0]

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

function createFeedbackWithImage(title, text, photoURL){
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            let userID = user.uid

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

                db.collection(`feedbacks-${userLocation}`).add(feedback).then(function(){
                    console.log("feedback sent")
                    window.location.assign("feedback.html")
                })



            })
        }
    })

}
