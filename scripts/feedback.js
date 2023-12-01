function displayFeedback () {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            let userID = user.uid
            db.collection('users').doc(userID).get().then(userDoc => {

                let userLocation = userDoc.data().location

                db.collection(`feedbacks-${userLocation}`)
                    .get()
                    .then(allFeedback => {
                    allFeedback.forEach(doc => {
                        populateFeedbackData(doc, userID, userLocation)
                    })
                })
            })
        }
    })
}
displayFeedback()

document.querySelector('.searchBoxForm').addEventListener('submit', function(event) {
    event.preventDefault()
    let searchTerm = document.querySelector('#userSearch').value.trim()
    if (searchTerm) {
        window.location.href = `feedbackSearch.html?userSearch=${searchTerm}`
    }
})








