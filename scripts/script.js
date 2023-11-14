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
                let posterImg = doc.data().posterImg
                let docID = doc.id
                const firestoreTimeStamp = doc.data().timestamp;
                const date = firestoreTimeStamp.toDate();

                let newpost = postsTemplate.content.cloneNode(true);

                newpost.querySelector('#postText-goes-here').innerText = story
                newpost.querySelector('#posterName-goes-here').innerText = posterName
                newpost.querySelector('#postTime-goes-here').innerHTML = new Date(date).toLocaleString()
                newpost.querySelector('a').href = "eachPost.html?docID=" + docID

                if (imageUrl) {
                    let imgElement = newpost.querySelector('#postImg-goes-here')
                    imgElement.src = imageUrl
                    imgElement.style.display = 'block';
                }
                if (posterImg) {
                    let posterPhoto = newpost.querySelector('#posterImg')
                    posterPhoto.src = posterImg
                }

                document.getElementById(collection + "-goes-here").appendChild(newpost);

            })

    })
}
displayUserPosts("posts");

const user = firebase.auth().currentUser;


firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        db.collection('users').doc(user.uid).get().then (doc => {
            if (doc.exists) {
                const userData = doc.data()
                console.log("userData")
                if (userData.photoURL) {
                    console.log("userData.photoURL")
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


