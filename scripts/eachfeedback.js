function displayFeedbackInfo() {
    let params = new URL(window.location.href)
    let ID = params.searchParams.get("docId")
    console.log(ID)

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            db.collection('users').doc(user.uid).get().then(doc => {

                let userLocation = doc.data().location

                db.collection(`feedbacks-${userLocation}`)
                    .doc(ID)
                    .get()
                    .then(doc => {
                        let data = doc.data()

                        let title = data.title
                        let text = data.text
                        let imageURL = data.photoURL
                        let date = data.timestamp.toDate()
                        let numberOfLikes = data.likesNumber
                        let numberOfComments = data.commentsNumber

                        document.querySelector('.feedback-title').innerText = title
                        document.querySelector('.feedback-detail').innerText = text
                        document.querySelector('.feedback-photo').src = imageURL
                        document.querySelector('.feedback-likes-number').innerText = numberOfLikes
                        document.querySelector('.feedback-comments-number').innerText = numberOfComments
                    })
            })
        }
    })
}
displayFeedbackInfo()

document.querySelector('#comment-form').addEventListener('submit', function(event) {
    event.preventDefault()

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            let userID = user.uid

            let comment = document.querySelector('#comment-input').value
            let params = new URL(window.location.href)
            let ID = params.searchParams.get("docId")

            if (user&& comment.trim() !== "") {

                db.collection('users').doc(userID).get().then(function(doc) {
                    let userLocation = doc.data().location
                    firebase.firestore().collection("feedbacks-comments").add({
                        commenterID: userID,
                        comment: comment,
                        feedbackID: ID,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(function() {
                        console.log("Comment added!")
                        document.querySelector('#comment-input').value = ""
                        addCommentsNumber(userLocation, "feedbacks")
                    })
                })

            } else {
                console.log('No user login')
            }

        }
    })
})

function loadFeedbackComment () {
    let params = new URL(window.location.href)
    let ID = params.searchParams.get("docId")

    db.collection('feedbacks-comments').where("feedbackID", "==", ID).orderBy("timestamp")
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                let data = change.doc.data()
                let commentID = `comment-${change.doc.id}`

                if(change.type === "added") {
                    let commentTemplate = document.querySelector('#feedback-comment-template')
                    let newComment = commentTemplate.content.cloneNode(true)

                    newComment.querySelector('.feedback-comment-container').id = commentID
                    newComment.querySelector('.feedback-comment-text').innerText = data.comment

                    document.querySelector('#comment-display').appendChild(newComment);
                }
            })
        })
}
loadFeedbackComment()

function addCommentsNumber(userLocation, section) {
    let params = new URL(window.location.href)
    let ID = params.searchParams.get("docId")

    db.collection(`${section}-${userLocation}`).doc(ID).get().then(doc => {
        let commentsNumber = doc.data().commentsNumber
        commentsNumber += 1
        db.collection(`${section}-${userLocation}`).doc(ID).update({
            commentsNumber: commentsNumber
        }).then(() => {
            console.log("Comments number added")
        })
    })
}

document.querySelector('.feedback-vote').addEventListener('click', function() {
    addLike()
})
document.querySelector('#feedback-add-like').addEventListener('click', function() {
    addLike()
})
function addLike() {
    let params = new URL(window.location.href)
    let ID = params.searchParams.get("docId")

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            let userID = user.uid
            db.collection('users').doc(userID).get().then(function(doc) {
                let userLocation = doc.data().location

                let feedbackRef = db.collection(`feedbacks-${userLocation}`).doc(ID)

                return db.runTransaction(transaction => {
                    return transaction.get(feedbackRef).then(feedbackDoc => {
                        if (!feedbackDoc.exists) {
                            throw "Document does not exist!";
                        }

                        let feedbackData = feedbackDoc.data();
                        let votedUsers = feedbackData.voteUser || [];

                        // Check if user has already voted
                        let userIndex = votedUsers.indexOf(userID);
                        if (userIndex === -1) {
                            // User hasn't voted yet, so increment likes and add user to array
                            let newLikes = (feedbackData.likesNumber || 0) + 1;
                            votedUsers.push(userID);
                            transaction.update(feedbackRef, {
                                likesNumber: newLikes,
                                voteUser: votedUsers
                            });
                        } else {
                            // User has already voted, so decrement likes and remove user from array
                            let newLikes = (feedbackData.likesNumber || 0) - 1;
                            newLikes = newLikes < 0 ? 0 : newLikes; // Prevent negative likes
                            votedUsers.splice(userIndex, 1);
                            transaction.update(feedbackRef, {
                                likesNumber: newLikes,
                                voteUser: votedUsers
                            });
                        }
                    });
                }).then(() => {
                    console.log("Transaction successfully committed!");
                }).catch(error => {
                    console.error("Transaction failed: ", error);
                });
            })
        }
    })
}