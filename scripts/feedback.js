function displayFeedback () {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            let feedbackTemplate = document.querySelector('#feedback-template')
            let userID = user.uid
            db.collection('users').doc(userID).get().then(userDoc => {

                let userLocation = userDoc.data().location

                db.collection(`feedbacks-${userLocation}`).get().then(allFeedback => {
                    allFeedback.forEach(doc => {

                        let newFeedback = feedbackTemplate.content.cloneNode(true)

                        newFeedback.querySelector('.feedback-link').href = 'eachFeedback.html?docId=' + doc.id
                        newFeedback.querySelector('.feedback-title').innerText = doc.data().title
                        newFeedback.querySelector('.feedback-detail').innerText = doc.data().text
                        newFeedback.querySelector('.feedback-likes-number').innerText = doc.data().likesNumber
                        newFeedback.querySelector('.feedback-comments-number').innerText = doc.data().commentsNumber
                        newFeedback.querySelector('.feedback-photo-container').id = `${doc.id}`
                        newFeedback.querySelector('.feedback-vote').dataset.feedbackid = `${doc.id}`

                        if (doc.data().photoURL) {
                            let imgElement = newFeedback.querySelector('.feedback-photo')
                            imgElement.src = doc.data().photoURL
                            imgElement.style.display = 'block';
                        }
                        document.querySelector('#feedbacks-goes-here').appendChild(newFeedback)
                        if (!doc.data().photoURL) {
                            document.getElementById(`${doc.id}`).style.display = 'none'
                        }

                    })
                })
            })
        }
    })
}
displayFeedback()

document.querySelector('#feedbacks-goes-here').addEventListener('click', function(event) {
    if (event.target.classList.contains('feedback-vote') || event.target.closest('.feedback-vote')) {
        let feedbackElement = event.target.closest('.feedback-vote');
        let feedbackID = feedbackElement.dataset.feedbackid;

        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                let userID = user.uid;
                db.collection('users').doc(userID).get().then(function(userDoc) {
                    let userLocation = userDoc.data().location;

                    let feedbackRef = db.collection(`feedbacks-${userLocation}`).doc(feedbackID);

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
                });
            }
        });

        // Stop the event from propagating to the parent anchor tag
        event.preventDefault();
        event.stopPropagation();
    }
});

function addLikeByClickingIcon() {
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelector('#feedbacks-goes-here').addEventListener('click', function(event) {
            if (event.target.classList.contains('feedback-icon-add-like') || event.target.closest('.feedback-icon-add-like')) {
                // Prevent the default action and stop event propagation right away

                event.preventDefault();
                event.stopPropagation();

                let feedbackElement = event.target.closest('.feedback-photo-container');
                console.log(feedbackElement)
                let feedbackID = feedbackElement.id.value;
                console.log(feedbackID)

                firebase.auth().onAuthStateChanged(function(user) {
                    if (user) {
                        let userID = user.uid;
                        db.collection('users').doc(userID).get().then(function(userDoc) {
                            let userLocation = userDoc.data().location;
                            let feedbackRef = db.collection(`feedbacks-${userLocation}`).doc(feedbackID);

                            db.runTransaction(transaction => {
                                return transaction.get(feedbackRef).then(feedbackDoc => {
                                    if (!feedbackDoc.exists) {
                                        throw "Document does not exist!";
                                    }
                                    // ... transaction code ...
                                });
                            }).then(() => {
                                console.log("Transaction successfully committed!");
                            }).catch(error => {
                                console.error("Transaction failed: ", error);
                            });
                        });
                    }
                });
            }

        });
    });
}
addLikeByClickingIcon()



