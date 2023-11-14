let openSideBarE1 = document.getElementById("open-sideBar")
const sideBarE1 = document.getElementById("sideBar")
const closeSideBarE1 = document.getElementById("close-sidebar")
const user = firebase.auth().currentUser;

openSideBarE1.addEventListener("click", ()=>{
    sideBarE1.style.display = "block"
})

closeSideBarE1.addEventListener("click", ()=>{
    sideBarE1.style.display = "none"
})

function insertNameFromFirestore() {
    // Check if the user is logged in:
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            console.log(user.uid); // Let's know who the logged-in user is by logging their UID
            currentUser = db.collection("users").doc(user.uid); // Go to the Firestore document of the user
            currentUser.get().then(userDoc => {
                // Get the user name
                var userName = userDoc.data().name;
                console.log(userName);
                //$("#name-goes-here").text(userName); // jQuery
                document.getElementById("username-goes-here").innerText = userName;
            })
        } else {
            console.log("No user is logged in."); // Log a message when no user is logged in
        }
    })
}

insertNameFromFirestore();

document.querySelector('#logout').addEventListener('click', function (){
    firebase.auth().signOut().then(() => {
        window.location.href = 'login.html'
    })
})

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        db.collection('users').doc(user.uid).get().then (doc => {
            if (doc.exists) {
                const userData = doc.data()
                console.log("userData")
                if (userData.photoURL) {
                    console.log("userData.photoURL")
                    document.querySelector('#userImg').src = userData.photoURL
                }
            } else {
                console.log("No such document")
            }
        }).catch((error) => {
            console.log("Error getting document", error)
        })
    } else {
        console.log("No user log in")
    }
})

function displayPostInfo() {
    let params = new URL(window.location.href)
    let ID = params.searchParams.get("docID")
    console.log(ID)

    db.collection("posts")
        .doc(ID)
        .get()
        .then(doc => {
            let data = doc.data()

            let postTime = doc.data().timestamp
            let date = postTime.toDate()


            document.querySelector('#posterImg').src = data.posterImg
            document.querySelector('#posterName-goes-here').innerText = data.poster
            document.querySelector('#postTime-goes-here').innerHTML = new Date(date).toLocaleString()
            document.querySelector('#postText-goes-here').innerText = data.text
            document.querySelector('#postImg-goes-here').src = data.imageUrl

        })
}
displayPostInfo()

document.querySelector('#comment-form').addEventListener('submit', function(event) {
    event.preventDefault()
    firebase.auth().onAuthStateChanged(function(user) {
        let comment = document.querySelector('#comment-input').value
        if (user&& comment.value.trim() !== "") {
            db.collection('users').doc(user.uid).get().then(doc => {

                let params = new URL(window.location.href)
                let ID = params.searchParams.get("docID")
                let commenterImg = doc.data().photoURL
                let comment = document.querySelector('#comment-input').value
                let commenter = doc.data().name
                let commenterID = user.uid

                firebase.firestore().collection("posts-comments").add({
                    postID: ID,
                    commenter: commenter,
                    commenterID: commenterID,
                    commenterImg: commenterImg,
                    comment: comment,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                }).then(function () {
                    console.log("Comment added!")
                    document.querySelector('#comment-input').value = ""
                })
            })
        } else {
            console.log("user is not login")
        }
    })
})



function loadComments() {
    let params = new URL(window.location.href)
    let ID = params.searchParams.get("docID")
    db.collection('posts-comments').where("postID", "==", ID).orderBy("timestamp").get().then(function (querySnapshot){
        querySnapshot.forEach(function (doc) {
            let commentTemplate = document.querySelector('#comment-template')

            let commenter = doc.data().commenter
            let commenterImg = doc.data().commenterImg
            let commentText = doc.data().comment
            let time = doc.data().timestamp.toDate()

            let newcomment = commentTemplate.content.cloneNode(true)

            newcomment.querySelector('.comment-name').innerText = commenter
            newcomment.querySelector('.commenter-img').src = commenterImg
            newcomment.querySelector('.comment-time').innerHTML = new Date(time).toLocaleString()
            newcomment.querySelector('.comment-text').innerText = commentText

            document.querySelector('#comment-display').appendChild(newcomment)
        })
    })
}
loadComments()