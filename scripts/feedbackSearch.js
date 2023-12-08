/**
 * Retrieves and displays feedback items based on the user's search query. This function parses
 * the search term from the URL parameters, splits it into keywords, and filters feedback items
 * by checking if their title contains any of the keywords. Only feedback items matching the
 * search criteria are displayed by calling `populateFeedbackData`.
 */
function displaySearchResult() {
    let params = new URLSearchParams(window.location.search); // Create a URLSearchParams object for parsing query parameters
    let searchTerm = params.get('userSearch').trim().toLowerCase(); // Retrieve the search term and convert it to lowercase
    let searchKeywords = searchTerm.split(' '); // Split the search term into individual keywords

    if (searchTerm) {
        // If there is a valid search term
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                // If a user is logged in
                let userID = user.uid; // Store the user's unique ID
                db.collection('users').doc(userID).get().then(userDoc => {
                    // Fetch the user's document to get additional details
                    let userLocation = userDoc.data().location; // Get the user's location
                    db.collection(`feedbacks-${userLocation}`).get().then(allFeedback => {
                        // Fetch all feedback from the collection specific to the user's location
                        document.querySelector('#feedbacks-goes-here').innerHTML = ''; // Clear any existing feedback
                        allFeedback.forEach(doc => {
                            // For each feedback document
                            let title = doc.data().title.toLowerCase(); // Convert the feedback title to lowercase
                            let keywordFound = searchKeywords.some(keyword => title.includes(keyword)); // Check if any keyword is found in the title
                            if (keywordFound || searchTerm === '') {
                                // If a keyword is found or the search term is empty
                                populateFeedbackData(doc, userID, userLocation); // Display the feedback
                            }
                        })
                    })
                })
            }
        })
    }
}
displaySearchResult();
