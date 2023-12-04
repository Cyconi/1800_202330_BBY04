/**
 * Dynamically displays feedback items on the feedback page. This function listens for authentication state changes
 * and, upon confirming a logged-in user, fetches and displays feedback specific to the user's location by calling
 * `populateFeedbackData` for each feedback item in the Firestore database.
 */
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

/**
 * Adds an event listener to the search box form on the feedback page. When the form is submitted, it prevents
 * the default submission action and redirects the user to the 'feedbackSearch.html' page with the search term
 * included as a URL query parameter. This enables searching for feedback based on user input.
 */
document.querySelector('.searchBoxForm').addEventListener('submit', function(event) {
    event.preventDefault()
    let searchTerm = document.querySelector('#userSearch').value.trim()
    if (searchTerm) {
        window.location.href = `feedbackSearch.html?userSearch=${searchTerm}`
    }
})








