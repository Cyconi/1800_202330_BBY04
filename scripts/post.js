
const postButton = document.getElementById("postButton")
postButton.addEventListener("click", () => {
    const testFile = document.getElementById("user-story")
    const fileInput = document.getElementById('photoUpload')
    const file = fileInput.files[0];
    const postTextContent = testFile.value

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
            let postWrite = db.collection("posts");

            db.collection("users").doc(userID).get().then((doc) => {

                let userName = doc.data().name

                let postData = {

                    posterID: userID,
                    poster: userName,
                    text: postTextContent,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()

                }

                if (imageUrl) {
                    postData.imageUrl = imageUrl
                }
                postWrite.add(postData).then(function () {
                    console.log("Post success")
                    window.location.assign("main.html");
                })

            })
        }
    })
}