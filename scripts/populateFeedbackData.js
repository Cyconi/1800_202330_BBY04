/**
 * Populates the feedback section with data from a Firestore document.
 * This function creates a new feedback element based on a template, sets up its content
 * (including title, details, likes, and comments), attaches event handlers for delete
 * and vote actions, and appends the element to the feedback section in the DOM.
 *
 * @param {Object} doc - Firestore document containing feedback data.
 * @param {string} userID - The ID of the current user.
 * @param {string} userLocation - The location associated with the feedback data.
 */
function populateFeedbackData(doc, userID, userLocation ) {
    let docID = doc.id;
    let voteUsers = doc. data().voteUser || []
    let userIndex = voteUsers.indexOf(userID)
    let feedbackTemplate = document.querySelector('#feedback-template')
    let newFeedback = feedbackTemplate.content.cloneNode(true)

    setUpnFeedbackContent(newFeedback, doc)
    setUpDeleteButton(newFeedback, docID)
    setUpFeedbackPhoto(newFeedback, doc)

    let feedbackLikesNumber = newFeedback.querySelector('.feedback-likes-number')
    let votesIcon =  newFeedback.querySelector('i.fa-circle-up')

    setUpVoteButtons(newFeedback,docID,userID,userLocation,feedbackLikesNumber,votesIcon)

    document.querySelector('#feedbacks-goes-here').appendChild(newFeedback)
    if (userIndex === -1) {
        votesIcon.classList.add('fa-regular')
    } else {
        votesIcon.classList.add('fa-solid')
    }
}



/**
 * Sets up a new feedback element with the provided document data. This function populates the feedback element
 * with details such as the feedback link, title, text details, like and comment numbers, and sets IDs for
 * various interactive elements like the vote button and like icon.
 *
 * @param {Element} newFeedback - The feedback element to be set up.
 * @param {Object} doc - Firestore document containing feedback data.
 */
function setUpnFeedbackContent(newFeedback, doc) {
    newFeedback.querySelector('.feedback-link').href = 'eachFeedback.html?docId=' + doc.id
    newFeedback.querySelector('.feedback-title').innerText = doc.data().title
    newFeedback.querySelector('.feedback-detail').innerText = doc.data().text
    newFeedback.querySelector('.feedback-likes-number').innerText = doc.data().likesNumber
    newFeedback.querySelector('.feedback-comments-number').innerText = doc.data().commentsNumber
    newFeedback.querySelector('.feedback-photo-container').id = `${doc.id}`
    newFeedback.querySelector('.feedback-vote').dataset.feedbackid = `${doc.id}`
    newFeedback.querySelector('.feedback-icon-add-like').dataset.feedbackid = `${doc.id}`
}

/**
 * Sets up the photo display for a feedback element. If the feedback data includes a photo URL,
 * this function updates the image source of the feedback photo and ensures it's displayed. If no
 * photo URL is present, it hides the photo container element.
 *
 * @param {Element} newFeedback - The feedback element to display the photo in.
 * @param {Object} doc - Firestore document containing the photo URL.
 */
function setUpFeedbackPhoto(newFeedback, doc) {
    if (doc.data().photoURL) {
        let imgElement = newFeedback.querySelector('.feedback-photo')
        imgElement.src = doc.data().photoURL
        imgElement.style.display = 'block';
    } else {
        document.getElementById(`${doc.id}`).style.display = 'none'
    }
}

/**
 * Sets up vote and like buttons for a feedback element. This function adds event listeners to both
 * the vote button and the like icon. These event listeners trigger the vote logic function, handling
 * the user interaction for liking or unliking a feedback item.
 *
 * @param {Element} newFeedback - The feedback element containing the buttons.
 * @param {string} docID - Document ID associated with the feedback.
 * @param {string} userID - The user ID of the person interacting with the buttons.
 * @param {string} userLocation - The location of the user.
 * @param {Element} feedbackLikesNumber - The DOM element showing the number of likes.
 * @param {Element} votesIcon - The DOM element representing the vote icon.
 */
function setUpVoteButtons(newFeedback, docID, userID, userLocation, feedbackLikesNumber, votesIcon) {
    let voteButton = newFeedback.querySelector('.feedback-vote')
    let likeButton = newFeedback.querySelector('.feedback-icon-add-like')

    voteButton.addEventListener('click', function(event) {
        event.preventDefault()
        event.stopPropagation()
        handleLikeLogic("feedbacks", docID, userID, userLocation, votesIcon, feedbackLikesNumber)
    })

    likeButton.addEventListener('click', function(event) {
        event.preventDefault()
        event.stopPropagation()
        handleLikeLogic("feedbacks", docID, userID, userLocation, votesIcon, feedbackLikesNumber)
    })
}