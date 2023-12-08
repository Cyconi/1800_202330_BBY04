// Retrieve elements from the DOM.
const openSideBarE1 = document.getElementById("open-sideBar")
const sideBarE1 = document.getElementById("sideBar")
const closeSideBarE1 = document.getElementById("close-sidebar")

/**
 * Adds a click event listener to 'openSideBarE1' element.
 *
 * When the 'open-sideBar' element is clicked, this event listener sets
 * the display style of the 'sideBar' element to 'block', making it visible.
 */
openSideBarE1.addEventListener("click", ()=>{
    sideBarE1.style.display = "block"
})

/**
 * Adds a click event listener to 'closeSideBarE1' element.
 *
 * When the 'close-sidebar' element is clicked, this event listener sets
 * the display style of the 'sideBar' element to 'none', hiding it.
 */
closeSideBarE1.addEventListener("click", ()=>{
    sideBarE1.style.display = "none"
})

/**
 * Retrieves and displays the logged-in user's name and location from Firebase Firestore.
 *
 * This function first checks if a user is logged in using Firebase Authentication.
 * If a user is logged in, it accesses the Firestore database to retrieve the user's
 * document using their unique user ID. It then extracts the user's name and location
 * from the document and updates the DOM elements with IDs 'username-goes-here' and
 * 'userLocation-goes-here' respectively.
 *
 * If no user is logged in, it logs a message to the console.
 */
function insertNameFromFirestore() {
    // Check if the user is logged in:
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            currentUser = db.collection("users").doc(user.uid); // Go to the Firestore document of the user
            currentUser.get().then(userDoc => {
                // Get the username
                const userName = userDoc.data().name;
                const userLocation = userDoc.data().location

                //$("#name-goes-here").text(userName); // jQuery
                document.getElementById("username-goes-here").innerText = userName;
                document.getElementById("userLocation-goes-here").innerText = userLocation
            })
        } else {
            console.log("No user is logged in."); // Log a message when no user is logged in
        }
    })
}

insertNameFromFirestore();


/**
 * When user click on the logout button in sidebar, signout the user and redirect the user
 * to the login page.
 */
document.querySelector('#logout').addEventListener('click', function (){
    firebase.auth().signOut().then(() => {
        window.location.href = 'login.html'
    })
})

/**
 * Monitors authentication state changes and updates the user profile photo in the sidebar.
 *
 * Upon detecting a logged-in user, it fetches the user's data from Firestore. If the user has a
 * 'photoURL', this URL is used to update the profile photo in the sidebar. Logs messages for
 * missing user documents or data fetching errors. Also logs a message if no user is logged in.
 */
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        db.collection('users').doc(user.uid).get().then (doc => {
            if (doc.exists) {
                const userData = doc.data()

                if (userData.photoURL) {

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

/**
 * Toggles the display of an information container in the UI.
 *
 * This function is designed to be called when a user clicks on an 'information' icon
 * next to a section title. It checks the current display state of the '.info-container' element:
 * if hidden or undefined, it sets the display to 'block' (visible); if visible, it sets
 * the display to 'none' (hidden).
 */
function toggleInfo() {
    const infoContainer = document.querySelector('.info-container');
    if (infoContainer.style.display === "none" || !infoContainer.style.display) {
        infoContainer.style.display = "block";
    } else {
        infoContainer.style.display = "none";
    }
}

/**
 * Sets up the delete button for a feedback or post element. This function adds an event listener
 * to the delete button, which, when clicked, displays a confirmation dialog. It is designed to be
 * used in contexts where a delete functionality is required for feedback or post elements.
 *
 * @param {Object} newTemplate - The template element (either a feedback or a post) to which the delete button is attached.
 * @param {string} docID - The document ID associated with the feedback or post, used to identify the item to delete.
 */
function setUpDeleteButton(newTemplate, docID) {
    const deleteButton = newTemplate.querySelector('.delete-button');
    if (deleteButton) {
        deleteButton.addEventListener('click', function(event) {
            event.preventDefault()
            event.stopPropagation()
            document.querySelector('.delete-confirm-container').style.display = 'block'
            document.querySelector('.yes').value = docID;
        })
    }
}

/**
 * Manages the like/unlike functionality for feedback or post items in different sections. It updates the like count
 * in the database and modifies the like icon's appearance based on the user's interaction. This function is
 * versatile and can be used in any section that requires like logic, such as posts or feedback.
 *
 * @param {string} section - The section type (e.g., 'feedbacks' or 'posts'), used to determine the correct Firestore collection.
 * @param {string} docID - The document ID of the item (feedback or post) being liked or unliked.
 * @param {string} userID - The user ID of the current user performing the like/unlike action.
 * @param {string} userLocation - The location of the user, used to specify the Firestore collection.
 * @param {Element} likesIcon - The DOM element representing the like icon.
 * @param {Element} likesNumber - The DOM element displaying the number of likes.
 */
function handleLikeLogic(section, docID, userID, userLocation, likesIcon, likesNumber) {
    let feedbackRef = db.collection(`${section}-${userLocation}`).doc(docID) // Reference to the specific document in the Firestore collection

    // Start a Firestore transaction to ensure atomic read and write
    db.runTransaction(transaction => {
        // Get the document to check current state of likes
        return transaction.get(feedbackRef).then(doc => {
            let newLikes = doc.data().likesNumber || 0; // Get the current number of likes, defaulting to 0 if undefined
            let voteUsers = doc.data().voteUser || []; // Get array of users who have liked the post/feedback
            let userIndex = voteUsers.indexOf(userID); // Check if the current user has already liked the post/feedback
            // Logic to handle like or unlike action
            if (userIndex === -1) {
                // If user hasn't liked yet, increase the likes count and add user to the array
                newLikes++;
                voteUsers.push(userID);
                likesIcon.classList.replace('fa-regular','fa-solid'); // Change the like icon to solid (liked state)
            } else {
                // If user has already liked, decrease the likes count and remove user from the array
                newLikes = newLikes > 0 ? newLikes - 1 : 0;
                voteUsers.splice(userIndex, 1);
                likesIcon.classList.replace('fa-solid','fa-regular'); // Change the like icon to regular (unliked state)
            }
            // Update the Firestore document with the new likes count and users array
            transaction.update(feedbackRef, {
                likesNumber: newLikes,
                voteUser: voteUsers
            });
            // Update the likes count displayed on the webpage
            likesNumber.innerText = newLikes;
        });
    });
}



