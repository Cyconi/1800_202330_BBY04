function displayFeedback () {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            let feedbackTemplate = document.querySelector('#feedback-template')
            let userID = user.uid
            db.collection('users').doc(userID).get().then(userDoc => {
                let userLocation = userDoc.data().location

                db.collection('feedbacks').get().then(allFeedback => {
                    allFeedback.forEach(doc => {
                        let posterLocation = doc.data().posterLocation

                        if(posterLocation === userLocation) {
                            let newFeedback = feedbackTemplate.content.cloneNode(true)

                            newFeedback.querySelector('.feedback-link').href = 'eachFeedback.html?docId=' + doc.id
                            newFeedback.querySelector('.feedback-title').innerText = doc.data().title
                            newFeedback.querySelector('.feedback-detail').innerText = doc.data().text
                            newFeedback.querySelector('.feedback-likes-number').innerText = doc.data().likesNumber
                            newFeedback.querySelector('.feedback-comments-number').innerText = doc.data().commentsNumber
                            newFeedback.querySelector('.feedback-photo-container').id = `${doc.id}`

                            if (doc.data().photoURL) {
                                let imgElement = newFeedback.querySelector('.feedback-photo')
                                imgElement.src = doc.data().photoURL
                                imgElement.style.display = 'block';
                            }
                            document.querySelector('#feedbacks-goes-here').appendChild(newFeedback)
                            if (!doc.data().photoURL) {
                                document.getElementById(`${doc.id}`).style.display = 'none'
                            }
                        }
                    })
                })
            })
        }
    })
}
displayFeedback()
