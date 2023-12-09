/**
 * Populates the feedback section with data from a Firestore document.
 * This function creates a new feedback element based on a template, sets up its content
 * (including title, details, likes, and comments), and appends the element to the feedback section in the DOM.
 * It also handles voting and deleting functionality for each feedback item.
 *
 * @param {Object} doc - Firestore document containing feedback data.
 * @param {string} userID - The ID of the current user.
 * @param {string} userLocation - The location associated with the feedback data.
 */
function populateFeedbackData(doc, userID, userLocation) {
    let docID = doc.id; // Get the unique ID of the document
    let voteUsers = doc.data().voteUser || []; // Retrieve the array of users who have voted, if it exists
    let userIndex = voteUsers.indexOf(userID); // Check if the current user has voted on this feedback
    let feedbackTemplate = document.querySelector('#feedback-template'); // Select the feedback template from the DOM
    let newFeedback = feedbackTemplate.content.cloneNode(true); // Clone the feedback template for a new feedback item

    setUpFeedbackContent(newFeedback, doc); // Populate the feedback content
    setUpDeleteButton(newFeedback, docID);
    setUpFeedbackPhoto(newFeedback, doc); // Set up the feedback photo, if it exists
    let feedbackLikesNumber = newFeedback.querySelector('.feedback-likes-number'); // Select the likes number element
    let votesIcon = newFeedback.querySelector('i.fa-circle-up'); // Select the votes icon element

    setUpVoteButtons(newFeedback, docID, userID, userLocation, feedbackLikesNumber, votesIcon); // Set up event listeners for voting

    document.querySelector('#feedbacks-goes-here').appendChild(newFeedback); // Append the new feedback element to the feedbacks container
    if (userIndex === -1) {
        votesIcon.classList.add('fa-regular'); // Set the votes icon to regular if the user hasn't voted
    } else {
        votesIcon.classList.add('fa-solid'); // Set the votes icon to solid if the user has voted
    }
}

/**
 * Sets up a new feedback element with the provided document data.
 * This function populates the feedback element with details such as the feedback link, title, text details,
 * like and comment numbers, and sets IDs for various interactive elements like the vote button and like icon.
 *
 * @param {Element} newFeedback - The feedback element to be set up.
 * @param {Object} doc - Firestore document containing feedback data.
 */
function setUpFeedbackContent(newFeedback, doc) {
    // Populate the feedback element with data from the Firestore document
    newFeedback.querySelector('.feedback-link').href = 'eachFeedback.html?docId=' + doc.id;
    newFeedback.querySelector('.feedback-title').innerText = doc.data().title;
    newFeedback.querySelector('.feedback-detail').innerText = doc.data().text;
    newFeedback.querySelector('.feedback-likes-number').innerText = doc.data().likesNumber;
    newFeedback.querySelector('.feedback-comments-number').innerText = doc.data().commentsNumber;
    newFeedback.querySelector('.feedback-photo-container').id = `feedback-photo-${doc.id}`;
    newFeedback.querySelector('.feedback-vote').dataset.feedbackid = doc.id;
    newFeedback.querySelector('.feedback-icon-add-like').dataset.feedbackid = doc.id;
}

/**
 * Sets up the photo display for a feedback element.
 * If the feedback data includes a photo URL, this function updates the image source of the feedback photo
 * and ensures it's displayed. If no photo URL is present, it hides the photo container element.
 *
 * @param {Element} newFeedback - The feedback element to display the photo in.
 * @param {Object} doc - Firestore document containing the photo URL.
 */
function setUpFeedbackPhoto(newFeedback, doc) {
    // Check if the feedback document has a photo URL
    if (doc.data().photoURL) {
        let imgElement = newFeedback.querySelector('.feedback-photo');
        imgElement.src = doc.data().photoURL; // Set the source of the image element
        imgElement.style.display = 'block'; // Ensure the image is displayed
    } else {
        newFeedback.querySelector(`#feedback-photo-${doc.id}`).style.display = 'none'; // Hide the photo container if no photo URL
    }
}

/**
 * Sets up vote and like buttons for a feedback element.
 * This function adds event listeners to both the vote button and the like icon.
 * These event listeners trigger the vote logic function, handling the user interaction for liking or unliking a feedback item.
 *
 * @param {Element} newFeedback - The feedback element containing the buttons.
 * @param {string} docID - Document ID associated with the feedback.
 * @param {string} userID - The user ID of the person interacting with the buttons.
 * @param {string} userLocation - The location of the user.
 * @param {Element} feedbackLikesNumber - The DOM element showing the number of likes.
 * @param {Element} votesIcon - The DOM element representing the vote icon.
 */
function setUpVoteButtons(newFeedback, docID, userID, userLocation, feedbackLikesNumber, votesIcon) {
    // Add event listeners to the vote and like buttons
    let voteButton = newFeedback.querySelector('.feedback-vote');
    let likeButton = newFeedback.querySelector('.feedback-icon-add-like');

    voteButton.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        handleLikeLogic("feedbacks", docID, userID, userLocation, votesIcon, feedbackLikesNumber); // Handle the voting logic when vote button is clicked
    });

    likeButton.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        handleLikeLogic("feedbacks", docID, userID, userLocation, votesIcon, feedbackLikesNumber); // Handle the voting logic when like icon is clicked
    });
}
