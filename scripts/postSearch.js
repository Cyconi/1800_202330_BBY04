/**
 * Retrieves and displays post items based on a user's search query. This function extracts the
 * search term from the URL parameters, splits it into keywords, and then filters posts based on
 * whether their text content or the poster's name contains any of the keywords. Only posts matching
 * the search criteria are displayed by calling `populatePostData`.
 */
function displayPostSearchResult() {
    let params = new URLSearchParams(window.location.search); // Create a URLSearchParams object to parse the query parameters
    let searchTerm = params.get('userSearch').toLowerCase(); // Retrieve the search term and convert it to lowercase
    let searchKeywords = searchTerm.split(' '); // Split the search term into individual keywords

    if (searchTerm) {
        // If there is a valid search term
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                // If a user is logged in
                let userID = user.uid; // Store the user's unique ID
                db.collection('users').doc(userID).get().then(userDoc => {
                    // Fetch the user's document to get additional details like location
                    let userLocation = userDoc.data().location; // Retrieve the user's location

                    // Fetch all posts from the collection specific to the user's location
                    db.collection(`posts-${userLocation}`).get()
                        .then(allFeedback => {
                            document.querySelector('#posts-goes-here').innerHTML = ''; // Clear any existing posts

                            allFeedback.forEach(doc => {
                                // For each post document
                                let textContent = doc.data().text.toLowerCase(); // Convert the post text content to lowercase

                                // Fetch the poster's user document
                                db.collection('users').doc(doc.data().posterID).get().then(posterDoc => {
                                    let userName = posterDoc.data().name.toLowerCase(); // Convert the poster's name to lowercase

                                    // Check if any keyword is found in the text content or poster's name
                                    let textFound = searchKeywords.some(keyword => textContent.includes(keyword));
                                    let nameFound = searchKeywords.some(keyword => userName.includes(keyword));

                                    // Display the post if a keyword is found or if the search term is empty
                                    if (textFound || nameFound || searchTerm === '') {
                                        populatePostData(doc, userID, userLocation);
                                    }
                                });
                            });
                        });
                });
            }
        });
    }
}
displayPostSearchResult();