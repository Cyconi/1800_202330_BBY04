
function writePosts(postText) {
    //define a variable for the collection you want to create in Firestore to populate data
    let postWrite = db.collection("posts");

    postWrite.add({
        text: postText
    }).then(function () {
        console.log("Post success")
        window.location.assign("main.html");
    })
}
const postButton = document.getElementById("postButton")
postButton.addEventListener("click", () =>{
    const testFile = document.getElementById("user-story")
    let postTextContent = testFile.value
    writePosts(postTextContent)

} )