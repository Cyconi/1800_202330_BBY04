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



