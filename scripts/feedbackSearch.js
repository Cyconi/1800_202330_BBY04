function displaySearchResult() {
    let params = new URLSearchParams(window.location.search)
    let searchTerm = params.get('userSearch').trim().toLowerCase()
    let searchKeywords = searchTerm.split(' ')
    console.log(searchKeywords)

    if(searchTerm) {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                let feedbackTemplate = document.querySelector('#feedback-template')
                let userID = user.uid

                db.collection('users').doc(userID).get().then(userDoc => {
                    let userLocation = userDoc.data().location
                    console.log(userLocation)
                    return db.collection(`feedbacks-${userLocation}`).get()

                }).then(allFeedback => {
                    document.querySelector('#feedbacks-goes-here').innerHTML = ''

                    allFeedback.forEach(doc => {
                        let title = doc.data().title.toLowerCase()
                        let keywordFound = searchKeywords.some(keyword => title.includes(keyword))

                        if(keywordFound || searchTerm === '') {

                            let newFeedback = feedbackTemplate.content.cloneNode(true)

                            newFeedback.querySelector('.feedback-link').href = 'eachFeedback.html?docId=' + doc.id
                            newFeedback.querySelector('.feedback-title').innerText = doc.data().title
                            newFeedback.querySelector('.feedback-detail').innerText = doc.data().text
                            newFeedback.querySelector('.feedback-likes-number').innerText = doc.data().likesNumber
                            newFeedback.querySelector('.feedback-comments-number').innerText = doc.data().commentsNumber
                            newFeedback.querySelector('.feedback-photo-container').id = `${doc.id}`
                            newFeedback.querySelector('.feedback-vote').dataset.feedbackid = `${doc.id}`
                            newFeedback.querySelector('.feedback-icon-add-like').dataset.feedbackid = `${doc.id}`
                            let feedbackLikesNumber = newFeedback.querySelector('.feedback-likes-number')

                            let voteButton = newFeedback.querySelector('.feedback-vote')

                            voteButton.addEventListener('click', function(event) {

                                event.preventDefault()
                                event.stopPropagation()
                                let feedbackRef = db.collection(`feedbacks-${userLocation}`).doc(doc.id)

                                db.runTransaction(transaction => {
                                    return transaction.get(feedbackRef).then(doc => {
                                        console.log("work so far")

                                        let newLikes = doc.data().likesNumber || 0
                                        let voteUsers = doc.data().voteUser || []

                                        let userIndex = voteUsers.indexOf(userID)

                                        if (userIndex === -1) {
                                            newLikes++
                                            voteUsers.push(userID)
                                        } else {
                                            newLikes = newLikes > 0? newLikes - 1: 0
                                            voteUsers.splice(userIndex, 1)
                                        }

                                        transaction.update(feedbackRef, {
                                            likesNumber: newLikes,
                                            voteUser: voteUsers
                                        })
                                        feedbackLikesNumber.innerText = newLikes

                                    }).then(() => {
                                        console.log("works")
                                    })
                                })
                            })


                            let likeButton = newFeedback.querySelector('.feedback-icon-add-like')

                            likeButton.addEventListener('click', function(event) {
                                event.preventDefault()
                                event.stopPropagation()

                                let feedbackRef = db.collection(`feedbacks-${userLocation}`).doc(doc.id)
                                db.runTransaction(transaction => {
                                    return transaction.get(feedbackRef).then(doc => {
                                        console.log("work so far")

                                        let newLikes = doc.data().likesNumber || 0
                                        let voteUsers = doc.data().voteUser || []

                                        let userIndex = voteUsers.indexOf(userID)

                                        if (userIndex === -1) {
                                            newLikes++
                                            voteUsers.push(userID)
                                        } else {
                                            newLikes = newLikes > 0? newLikes - 1: 0
                                            voteUsers.splice(userIndex, 1)
                                        }

                                        transaction.update(feedbackRef, {
                                            likesNumber: newLikes,
                                            voteUser: voteUsers
                                        })
                                        feedbackLikesNumber.innerText = newLikes

                                    }).then(() => {
                                        console.log("works")
                                    })
                                })
                            })

                            if (doc.data().photoURL) {
                                let imgElement = newFeedback.querySelector('.feedback-photo')
                                imgElement.src = doc.data().photoURL
                                imgElement.style.display = 'block';
                            }
                            document.querySelector('#feedbacks-goes-here').appendChild(newFeedback)
                            if (!doc.data().photoURL) {
                                document.getElementById(`${doc.id}`).style.display = 'none'
                            }
                        }
                    })

                })
            }
        })
    }
}
displaySearchResult()