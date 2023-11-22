
const postButton = document.getElementById("postButton")
postButton.addEventListener("click", () => {
    const testFile = document.getElementById("user-story")
    const fileInput = document.getElementById('photoUpload')
    const file = fileInput.files[0];
    const postTextContent = testFile.value

    showThankYouMessage()

    if (file) {
        let storageRef = firebase.storage().ref('photos/' + file.name)

        storageRef.put(file).then(function(snapshot) {
            snapshot.ref.getDownloadURL().then(function(downloadURL) {
                createPostWithImage(postTextContent, downloadURL)
            })
        })
    } else {
        createPostWithImage(postTextContent,null);
    }
})

function createPostWithImage(postTextContent, imageUrl) {

    firebase.auth().onAuthStateChanged(user => {

        if (user) {

            let userID = user.uid;
            let userRef = db.collection('users').doc(userID)


            db.collection("users").doc(userID).get().then((doc) => {

                let userLocation = doc.data().location
                let postWrite = db.collection(`posts-${userLocation}`);
                let userName = doc.data().name


                let postData = {
                    posterID: userID,
                    poster: userName,
                    posterLocation: userLocation,
                    text: postTextContent,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    likesNumber: 0,
                    commentsNumber: 0

                }
                if (doc.data().photoURL) {
                    postData.posterImg = doc.data().photoURL
                }

                if (imageUrl) {
                    postData.imageUrl = imageUrl
                }
                return postWrite.add(postData)

            }).then(function(postRef) {
                console.log("Post success with ID ", postRef.id)
                return userRef.update({
                    posts: firebase.firestore.FieldValue.arrayUnion(postRef.id)
                })
            }).then(() => {
                window.location.assign('main.html')
            })
        }
    })
}

function showThankYouMessage() {
    const thankYouDiv = document.querySelector('.post-thankyou')
    thankYouDiv.style.display = 'flex'

    setTimeout(() => {
        thankYouDiv.style.display = 'none'
    }, 20000)
}