/**
 * Dynamically displays feedback items on the feedback page. This function listens for authentication state changes
 * and, upon confirming a logged-in user, fetches and displays feedback specific to the user's location by calling
 * `populateFeedbackData` for each feedback item in the Firestore database.
 */
function displayFeedback() {
    // Listen for changes in the authentication state
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // If a user is authenticated
            let userID = user.uid; // Store the user's unique ID
            // Retrieve the user document from Firestore
            db.collection('users').doc(userID).get().then(userDoc => {

                let userLocation = userDoc.data().location; // Extract the user's location from the document

                // Fetch all feedback from the collection specific to the user's location
                db.collection(`feedbacks-${userLocation}`)
                    .get()
                    .then(allFeedback => {
                        // For each feedback document
                        allFeedback.forEach(doc => {
                            // Call `populateFeedbackData` to display the feedback item
                            populateFeedbackData(doc, userID, userLocation);
                        })
                    })
            })
        }
    })
}
displayFeedback();


/**
 * Adds an event listener to the search box form on the feedback page. When the form is submitted, it prevents
 * the default submission action and redirects the user to the 'feedbackSearch.html' page with the search term
 * included as a URL query parameter. This enables searching for feedback based on user input.
 */
document.querySelector('.searchBoxForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    let searchTerm = document.querySelector('#userSearch').value.trim(); // Retrieve and trim the search term from the input

    if (searchTerm) {
        // If there is a valid search term
        window.location.href = `feedbackSearch.html?userSearch=${searchTerm}`; // Redirect to feedbackSearch.html with the search term as a query parameter
    }
})









