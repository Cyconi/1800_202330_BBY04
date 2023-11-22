const sendButton = document.querySelector('#sendMessageButton');

sendButton.addEventListener('click', function () {
    const messageInput = document.querySelector('#messageInput');
    const user = firebase.auth().currentUser;

    if (user && messageInput.value.trim() !== "") {

        db.collection('users').doc(user.uid).get().then(doc => {
            const userLocation = doc.data().location;
            const messageCollection = `messages-${userLocation}`;

            db.collection(messageCollection).add({
                userID: user.uid,
                userName: user.displayName || "Anonymous",
                message: messageInput.value,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                console.log("Message sent!");
                messageInput.value = "";
            });
        });

    } else {
        console.log("User is not signed in or message is empty");
    }
});


firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        db.collection('users').doc(user.uid).get().then(doc => {
            const userLocation = doc.data().location;
            const messageCollection = `messages-${userLocation}`;

            db.collection(messageCollection).orderBy("timestamp").onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === "added") {
                        const messageData = change.doc.data();

                        // Fetch the user's photoURL from the 'users' collection
                        db.collection('users').doc(messageData.userID).get().then(userDoc => {
                            messageData.photoURL = userDoc.data().photoURL;

                            // Display the message with the profile photo and timestamp
                            displayMessage(messageData);
                        });
                    }
                });
            });
        });
    }
});

const userColors = {};

// Function to generate a random color for each message in chat
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Function to generate a consistent color based on a string
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
}


// Update previous displayMessage function
function displayMessage(messageData) {
    const messageList = document.querySelector('#messageList');
    const messageElement = document.createElement('li');

    // Get a consistent color based on the user's name
    const userColor = userColors[messageData.userName] || stringToColor(messageData.userName);
    userColors[messageData.userName] = userColor;

    // Apply the user's color to the message text
    messageElement.style.color = userColor;

    // Add a border style to the message element
    messageElement.style.border = `1px solid ${userColor}`;
    messageElement.style.borderRadius = '5px'; // Optional: Add rounded corners

    // Add a class to the message element for styling
    messageElement.classList.add('message');

    // Create an image element for the user's profile photo
    const profilePhoto = document.createElement('img');
    profilePhoto.src = messageData.photoURL || 'default-profile-photo.jpg'; // Use a default photo if the user doesn't have one
    profilePhoto.alt = 'Profile Photo';
    profilePhoto.style.width = '40px'; // Adjust the width as needed
    profilePhoto.style.height = '40px'; // Adjust the height as needed

    // Create a div to hold the profile photo and message content
    const messageContent = document.createElement('div');
    messageContent.appendChild(profilePhoto);

    // Create a div for the message text and timestamp
    const textAndTimestampDiv = document.createElement('div');

    // Create a span for the message text
    const messageText = document.createElement('span');
    messageText.textContent = `${messageData.userName}: ${messageData.message}`;

    // Create a span for the timestamp
    const timestampSpan = document.createElement('span');
    const timestamp = messageData.timestamp ? new Date(messageData.timestamp.toDate()) : new Date();

    // Format the timestamp to display hours and minutes only
    const options = { hour: 'numeric', minute: 'numeric' };
    timestampSpan.textContent = timestamp.toLocaleTimeString(undefined, options);
    timestampSpan.style.float = 'right'; // Align the timestamp to the right

    // Append the message text and timestamp to the textAndTimestampDiv
    textAndTimestampDiv.appendChild(messageText);
    textAndTimestampDiv.appendChild(timestampSpan);

    // Append the textAndTimestampDiv to the message content
    messageContent.appendChild(textAndTimestampDiv);

    // Append the message content to the message element
    messageElement.appendChild(messageContent);

    // Append the message element to the message list
    messageList.appendChild(messageElement);

    // Scroll to the bottom of the message list
    messageList.scrollTop = messageList.scrollHeight;
}



