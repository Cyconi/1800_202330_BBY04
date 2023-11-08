
function writePosts(postText, posterid, postername) {
    //define a variable for the collection you want to create in Firestore to populate data
    let postWrite = db.collection("posts");


    postWrite.add({
        posterID: posterid,
        poster: "11",
        text: postText,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()

    }).then(function () {
        console.log("Post success")
        window.location.assign("main.html");
    })
}

const postButton = document.getElementById("postButton")
postButton.addEventListener("click", () => {
    const testFile = document.getElementById("user-story")
    let postTextContent = testFile.value

    firebase.auth().onAuthStateChanged(user => {

        if (user) {
            currentUser = db.collection("users").doc(user.uid);
            let userID = user.uid;

            
            db.collection("users").doc(userID).get().then((doc) => {
                let userName = doc.data().name

                let postWrite = db.collection("posts");

                postWrite.add({
                    posterID: userID,
                    poster: userName,
                    text: postTextContent,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()

                }).then(function () {
                    console.log("Post success")
                    window.location.assign("main.html");
                })

            })
        }
    })
})
