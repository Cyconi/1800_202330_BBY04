/**
 * Retrieves and displays feedback items based on the user's search query. This function parses
 * the search term from the URL parameters, splits it into keywords, and filters feedback items
 * by checking if their title contains any of the keywords. Only feedback items matching the
 * search criteria are displayed by calling `populateFeedbackData`.
 */
function displaySearchResult() {
    let params = new URLSearchParams(window.location.search)
    let searchTerm = params.get('userSearch').trim().toLowerCase()
    let searchKeywords = searchTerm.split(' ')
    if(searchTerm) {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                let userID = user.uid
                db.collection('users').doc(userID).get().then(userDoc => {
                    let userLocation = userDoc.data().location
                    db.collection(`feedbacks-${userLocation}`).get().then(allFeedback => {
                    document.querySelector('#feedbacks-goes-here').innerHTML = ''
                    allFeedback.forEach(doc => {
                        let title = doc.data().title.toLowerCase()
                        let keywordFound = searchKeywords.some(keyword => title.includes(keyword))
                        if(keywordFound || searchTerm === '') {
                            populateFeedbackData(doc, userID, userLocation)

                        }
                    })
                    })
                })
            }
        })
    }
}
displaySearchResult()