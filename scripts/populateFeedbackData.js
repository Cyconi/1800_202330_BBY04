function populateFeedbackData(doc, userID, userLocation ) {
    let voteUsers = doc. data().voteUser || []
    let userIndex = voteUsers.indexOf(userID)

    let feedbackTemplate = document.querySelector('#feedback-template')
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
    let votesIcon =  newFeedback.querySelector('i.fa-circle-up')

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
                    votesIcon.classList.replace('fa-regular','fa-solid' )
                } else {
                    newLikes = newLikes > 0? newLikes - 1: 0
                    voteUsers.splice(userIndex, 1)
                    votesIcon.classList.replace('fa-solid','fa-regular')
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
                    votesIcon.classList.replace('fa-regular','fa-solid' )
                } else {
                    newLikes = newLikes > 0? newLikes - 1: 0
                    voteUsers.splice(userIndex, 1)
                    votesIcon.classList.replace('fa-solid','fa-regular')
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
    console.log(votesIcon)
    console.log(userIndex)
    if (userIndex === -1) {
        votesIcon.classList.add('fa-regular')

    } else {
        votesIcon.classList.add('fa-solid')
    }
    if (!doc.data().photoURL) {
        document.getElementById(`${doc.id}`).style.display = 'none'
    }
}