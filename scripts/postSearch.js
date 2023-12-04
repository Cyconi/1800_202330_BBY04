/**
 * Retrieves and displays post items based on a user's search query. This function extracts the
 * search term from the URL parameters, splits it into keywords, and then filters posts based on
 * whether their text content or the poster's name contains any of the keywords. Only posts matching
 * the search criteria are displayed by calling `populatePostData`.
 */
function displayPostSearchResult() {
    let params = new URLSearchParams(window.location.search)
    let searchTerm = params.get('userSearch').toLowerCase()
    let searchKeywords = searchTerm.split(' ')
    if (searchTerm) {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                let userID = user.uid
                db.collection('users').doc(userID).get().then(userDoc => {
                    let userLocation = userDoc.data().location

                    db.collection(`posts-${userLocation}`).get()
                        .then(allFeedback => {
                            document.querySelector('#posts-goes-here').innerHTML = ''

                            allFeedback.forEach(doc => {
                                let textContent = doc.data().text.toLowerCase()
                                db.collection('users').doc(doc.data().posterID).get().then(posterDoc=> {
                                    let userName = posterDoc.data().name.toLowerCase()
                                    let textFound = searchKeywords.some(keyword => textContent.includes(keyword))
                                    let nameFound = searchKeywords.some(keyword => userName.includes(keyword))

                                    if (textFound || nameFound || searchTerm === '') {
                                        populatePostData(doc, userID, userLocation)
                                    }
                                })
                            })
                        })
                })
            }
        })
    }
}
displayPostSearchResult()

