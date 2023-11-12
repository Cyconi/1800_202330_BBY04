let openSideBarE1 = document.getElementById("open-sideBar")
const sideBarE1 = document.getElementById("sideBar")
const closeSideBarE1 = document.getElementById("close-sidebar")

openSideBarE1.addEventListener("click", ()=>{
    sideBarE1.style.display = "block"
})

closeSideBarE1.addEventListener("click", ()=>{
    sideBarE1.style.display = "none"
})

function insertNameFromFirestore() {
    // Check if the user is logged in:
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            console.log(user.uid); // Let's know who the logged-in user is by logging their UID
            currentUser = db.collection("users").doc(user.uid); // Go to the Firestore document of the user
            currentUser.get().then(userDoc => {
                // Get the user name
                var userName = userDoc.data().name;
                console.log(userName);
                //$("#name-goes-here").text(userName); // jQuery
                document.getElementById("username-goes-here").innerText = userName;
            })
        } else {
            console.log("No user is logged in."); // Log a message when no user is logged in
        }
    })
}

insertNameFromFirestore();

document.querySelector('#logout').addEventListener('click', function (){
    firebase.auth().signOut().then(() => {
        window.location.href = 'login.html'
    })
})
function displayUserPosts(collection) {
    let postsTemplate = document.getElementById("userPostTemplate")

    db.collection(collection).get()
        .then(allPosts => {
            allPosts.forEach(doc => {
                let story = doc.data().text;
                let posterName = doc.data().poster;
                let imageUrl = doc.data().imageUrl
                const firestoreTimeStamp = doc.data().timestamp;
                const date = firestoreTimeStamp.toDate();

                let newpost = postsTemplate.content.cloneNode(true);

                newpost.querySelector('#postText-goes-here').innerText = story
                newpost.querySelector('#posterName-goes-here').innerText = posterName
                newpost.querySelector('#postTime-goes-here').innerHTML = new Date(date).toLocaleString()

                if (imageUrl) {
                    let imgElement = newpost.querySelector('#postImg-goes-here')
                    imgElement.src = imageUrl
                    imgElement.style.display = 'block';
                }

                document.getElementById(collection + "-goes-here").appendChild(newpost);
            })

    })
}
displayUserPosts("posts");



