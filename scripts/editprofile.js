/**
 * Adds an event listener for the profile form submission. When submitted, it prevents the default form action,
 * updates the user's username, and uploads a new profile photo if provided. It updates the user's profile
 * information in Firestore and navigates to the main page upon successful update.
 */
document.querySelector('#profileForm').addEventListener('submit', function (event){
    event.preventDefault()
    const user = firebase.auth().currentUser
    console.log(user.uid)
    const username = document.querySelector('#username').value
    const profilePhoto = document.querySelector('#profilePhoto').files[0]

    if(user && profilePhoto) {

        const storageRef = firebase.storage().ref('profile_photos/' + user.uid + '/' + profilePhoto.name)

        storageRef.put(profilePhoto).then(snapshot => {
            return snapshot.ref.getDownloadURL();
        }).then(downloadURL => {

            return db.collection('users').doc(user.uid).update({
                name: username,
                photoURL: downloadURL
            }).then(() => {
                console.log("Profile updated successfully")
                window.location.assign("main.html")

            })
        })
    } else {
        db.collection('users').doc(user.uid).update({
            name: username
        }).then(() => {
            console.log("Username updated successfully")
            window.history.back()
        })
    }
})

/**
 * Displays the current user's information on the profile editing page. It fetches the user's data
 * from Firestore and updates the username input placeholder and the image preview with the user's
 * current information. This function is called when the profile editing page is loaded.
 */
function showCurrentInfo() {
    let user = firebase.auth().currentUser
   console.log("abcdefg")

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists) {
                    const userData = doc.data()
                    console.log("userData")
                    const userName = userData.name
                    const postalCode = userData.postalcode

                    document.querySelector('#username').placeholder = userName
                    if (userData.photoURL) {
                        console.log("userData.photoURL")
                        document.querySelector('#imagePreview').src = userData.photoURL
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

}
showCurrentInfo()

/**
 * Adds an event listener for changes to the profile photo input. When a new photo is selected,
 * it updates the image preview to show the newly selected photo.
 */
document.querySelector('#profilePhoto').addEventListener('change', function (event){
    const [file] = event.target.files;
    const imagePreview = document.querySelector('#imagePreview')
    if (file) {
        imagePreview.src = URL.createObjectURL(file)
    }
})