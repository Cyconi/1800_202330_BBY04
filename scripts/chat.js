const sendButton = document.querySelector('#sendMessageButton')

sendButton.addEventListener('click', function (){
    const messageInput = document.querySelector('#messageInput')
    const user = firebase.auth().currentUser

    if (user && messageInput.value.trim() !== ""){

        db.collection("messages").add({
            userID: user.uid,
            userName: user.displayName || "Anonymous",
            message: messageInput.value,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            console.log("Message sent!")
            messageInput.value = ""
        })
    } else {
        console.log("User is not signed in or message is empty")
    }
})

db.collection("messages").orderBy("timestamp").onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        if (change.type === "added") {
            const messageData = change.doc.data();
            displayMessage(messageData)

        }
    })
})

function displayMessage(messageData) {
    const messageList = document.querySelector('#messageList')
    const messageElement = document.createElement("li")

    messageElement.textContent = `${messageData.userName}: ${messageData.message}`

    messageList.appendChild(messageElement)

    messageList.scrollTop = messageList.scrollHeight
}




const userColors = {};

// Function to generate a random color for each messages in chat
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
    messageElement.textContent = `${messageData.userName}: ${messageData.message}`;

    messageList.appendChild(messageElement);

    messageList.scrollTop = messageList.scrollHeight;
}
