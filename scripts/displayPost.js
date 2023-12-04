/**
 * Dynamically displays posts on the post page. This function listens for changes in the user's
 * authentication state. If the user is logged in, it fetches and displays posts relevant to
 * the user's location from the Firestore database by calling `populatePostData` for each post.
 */
function displayPosts() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log("user is login")
            db.collection('users').doc(user.uid).get().then(userDoc => {
                var userLocation = userDoc.data().location
                console.log(userLocation)
                const userID = user.uid

                db.collection(`posts-${userLocation}`).get()
                    .then(allPosts => {
                        allPosts.forEach(doc => {
                            populatePostData(doc, userID, userLocation)
                        })
                    })
            })
        } else {
            console.log('User is not login')
        }
    })
}
displayPosts();

/**
 * Adds an event listener to the search box form. When the form is submitted, it prevents the
 * default form submission action, retrieves the search term entered by the user, and redirects
 * the window location to the 'postSearch.html' page with the search term included as a URL query
 * parameter. This enables the search functionality to be handled on the 'postSearch.html' page.
 */
document.querySelector('.searchBoxForm').addEventListener('submit', function(event) {
    event.preventDefault()
    let searchTerm = document.querySelector('#userSearch').value.trim()
    if (searchTerm) {
        window.location.href = `postSearch.html?userSearch=${searchTerm}`
    }
})