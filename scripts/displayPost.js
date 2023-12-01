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

document.querySelector('.searchBoxForm').addEventListener('submit', function(event) {
    event.preventDefault()
    let searchTerm = document.querySelector('#userSearch').value.trim()
    if (searchTerm) {
        window.location.href = `postSearch.html?userSearch=${searchTerm}`
    }
})