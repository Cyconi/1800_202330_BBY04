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