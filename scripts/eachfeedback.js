function displayFeedbackInfo() {
    let params = new URL(window.location.href)
    let ID = params.searchParams.get("docId")
    console.log(ID)

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            db.collection('users').doc(user.uid).get().then(doc => {

                let userLocation = doc.data().location
                let userID = user.uid

                db.collection(`feedbacks-${userLocation}`)
                    .doc(ID)
                    .get()
                    .then(doc => {
                        let data = doc.data()

                        let title = data.title
                        let text = data.text
                        let imageURL = data.photoURL
                        let numberOfLikes = data.likesNumber
                        let numberOfComments = data.commentsNumber

                        let voteUsers = doc.data().voteUser || []
                        let userIndex = voteUsers.indexOf(userID)
                        let likeButton = document.querySelector('#circle-up');

                        if (userIndex === -1) {
                            likeButton.classList.add('fa-regular')
                        } else {
                            likeButton.classList.add('fa-solid')
                        }

                        document.querySelector('.feedback-title').innerText = title
                        document.querySelector('.feedback-detail').innerText = text
                        document.querySelector('.feedback-likes-number').innerText = numberOfLikes
                        document.querySelector('.feedback-comments-number').innerText = numberOfComments

                        if (imageURL) {
                            document.querySelector('.feedback-photo').src = imageURL
                        } else {
                            document.querySelector('.feedback-photo').style.display = 'none'
                        }

                        document.querySelector('#feedback-add-like').addEventListener('click', function () {
                            console.log("working?")

                            let feedbackRef = db.collection(`feedbacks-${userLocation}`).doc(ID)

                            db.runTransaction(transaction => {
                                return transaction.get(feedbackRef).then(doc => {

                                    let newLikes = doc.data().likesNumber || 0
                                    let voteUsers = doc.data().voteUser || []
                                    let userIndex = voteUsers.indexOf(userID)

                                    if (userIndex === -1) {
                                        newLikes++;
                                        voteUsers.push(userID);
                                        likeButton.classList.replace('fa-regular','fa-solid' )
                                    } else {
                                        newLikes = newLikes > 0 ? newLikes - 1 : 0;
                                        voteUsers.splice(userIndex, 1);
                                        likeButton.classList.replace('fa-solid','fa-regular')
                                    }

                                    transaction.update(feedbackRef, {
                                        likesNumber: newLikes,
                                        voteUser: voteUsers
                                    })
                                    document.querySelector('.feedback-likes-number').innerText = newLikes
                                })
                            }).then(() => {
                                console.log("yeah")
                            })
                        })


                        document.querySelector('.feedback-vote').addEventListener('click', function () {
                            console.log("working?")

                            let feedbackRef = db.collection(`feedbacks-${userLocation}`).doc(ID)

                            db.runTransaction(transaction => {
                                return transaction.get(feedbackRef).then(doc => {

                                    let newLikes = doc.data().likesNumber || 0
                                    let voteUsers = doc.data().voteUser || []
                                    let userIndex = voteUsers.indexOf(userID)

                                    if (userIndex === -1) {
                                        newLikes++;
                                        voteUsers.push(userID);
                                        likeButton.classList.replace('fa-regular','fa-solid' )
                                    } else {
                                        newLikes = newLikes > 0 ? newLikes - 1 : 0;
                                        voteUsers.splice(userIndex, 1);
                                        likeButton.classList.replace('fa-solid','fa-regular')
                                    }

                                    transaction.update(feedbackRef, {
                                        likesNumber: newLikes,
                                        voteUser: voteUsers
                                    })
                                    document.querySelector('.feedback-likes-number').innerText = newLikes
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
            document.querySelector('.feedback-comments-number').innerText = commentsNumber
        })
    })
}

