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

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            db.collection('users').doc(user.uid).get().then(doc => {

                let userLocation = doc.data().location
                let userID = user.uid

                db.collection(`posts-${userLocation}`)
                    .doc(ID)
                    .get()
                    .then(doc => {
                        let data = doc.data()

                        let postTime = doc.data().timestamp
                        let date = postTime.toDate()
                        let likesNumber = data.likesNumber
                        let commentsNumber = data.commentsNumber

                        document.querySelector('.posterImg').src = data.posterImg
                        document.querySelector('.posterName-goes-here').innerText = data.poster
                        document.querySelector('.postTime-goes-here').innerHTML = new Date(date).toLocaleString()
                        document.querySelector('.postText-goes-here').innerText = data.text
                        document.querySelector('.postImg-goes-here').src = data.imageUrl
                        document.querySelector('.likes-number').innerText = likesNumber
                        document.querySelector('.comments-number').innerText = commentsNumber

                        document.querySelector('#post-icon-like').addEventListener('click', function () {
                            console.log("working?")

                            let postRef = db.collection(`posts-${userLocation}`).doc(ID)


                            db.runTransaction(transaction => {
                                return transaction.get(postRef).then(doc => {

                                    let newLikes = doc.data().likesNumber || 0
                                    let voteUsers = doc.data().voteUser || []
                                    let userIndex = voteUsers.indexOf(userID)

                                    if (userIndex === -1) {
                                        newLikes++;
                                        voteUsers.push(userID);
                                    } else {
                                        newLikes = newLikes > 0 ? newLikes - 1 : 0;
                                        voteUsers.splice(userIndex, 1);
                                    }

                                    transaction.update(postRef, {
                                        likesNumber: newLikes,
                                        voteUser: voteUsers
                                    })
                                    document.querySelector('.likes-number').innerText = newLikes
                                })
                            }).then(() => {
                                console.log("yeah")
                            })
                        })

                    })
            })
        }
    })
}
displayPostInfo()

document.querySelector('#comment-form').addEventListener('submit', function(event) {
    event.preventDefault()
    firebase.auth().onAuthStateChanged(function(user) {
        let comment = document.querySelector('#comment-input').value
        if (user&& comment.trim() !== "") {
            db.collection('users').doc(user.uid).get().then(doc => {

                let userLocation = doc.data().location

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
                    addCommentsNumber(userLocation, "posts")
                })
            })
        } else {
            console.log("user is not login")
        }
    })
})



function loadComments() {
    let params = new URL(window.location.href);
    let ID = params.searchParams.get("docID");

    db.collection('posts-comments').where("postID", "==", ID)
        .orderBy("timestamp")
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                const commentData = change.doc.data();
                const commentId = `comment-${change.doc.id}`;
                let commentElement = document.getElementById(commentId);

                if (change.type === 'added') {
                    let commentTemplate = document.querySelector('#comment-template');
                    let newComment = commentTemplate.content.cloneNode(true);

                    let commentContainer = newComment.querySelector('.user-comment-container');
                    commentContainer.id = commentId; // Set a unique ID

                    commentContainer.querySelector('.comment-name').innerText = commentData.commenter;
                    commentContainer.querySelector('.commenter-img').src = commentData.commenterImg || 'default-avatar.png';
                    commentContainer.querySelector('.comment-text').innerText = commentData.comment;

                    // Check if the timestamp exists
                    let commentTimeElement = commentContainer.querySelector('.comment-time');
                    if (commentData.timestamp) {
                        let time = commentData.timestamp.toDate();
                        commentTimeElement.innerText = new Date(time).toLocaleString();
                    } else {
                        commentTimeElement.innerText = 'Date processing...';
                    }

                    document.querySelector('#comment-display').appendChild(commentContainer);
                }

                // Handle modifications (like the addition of the timestamp)
                if (change.type === 'modified' && commentElement) {
                    if (commentData.timestamp) {
                        let time = commentData.timestamp.toDate();
                        commentElement.querySelector('.comment-time').innerText = new Date(time).toLocaleString();
                    }
                }
            });
        });
}

loadComments();

function addCommentsNumber(userLocation, section) {
    let params = new URL(window.location.href)
    let ID = params.searchParams.get("docID")

    db.collection(`${section}-${userLocation}`).doc(ID).get().then(doc => {
        let commentsNumber = doc.data().commentsNumber
        commentsNumber += 1
        db.collection(`${section}-${userLocation}`).doc(ID).update({
            commentsNumber: commentsNumber
        }).then(() => {
            console.log("Comments number added")
            document.querySelector('.comments-number').innerText = commentsNumber
        })
    })
}