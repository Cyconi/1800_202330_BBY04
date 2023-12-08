/**
 * Adds an event listener for the profile form submission. When submitted, it prevents the default form action,
 * updates the user's username, and uploads a new profile photo if provided. It updates the user's profile
 * information in Firestore and navigates to the main page upon successful update.
 */
document.querySelector('#profileForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const user = firebase.auth().currentUser; // Get the current authenticated user
    console.log(user.uid); // Log the user's UID for debugging
    const username = document.querySelector('#username').value; // Get the entered username from the form
    const profilePhoto = document.querySelector('#profilePhoto').files[0]; // Get the uploaded profile photo, if any

    if (user && profilePhoto) {
        // If there's a user logged in and a profile photo uploaded
        const storageRef = firebase.storage().ref('profile_photos/' + user.uid + '/' + profilePhoto.name); // Create a reference to where the photo will be stored

        storageRef.put(profilePhoto).then(snapshot => {
            // Upload the photo to Firebase Storage
            return snapshot.ref.getDownloadURL(); // Get the download URL after upload
        }).then(downloadURL => {
            // Update the user's profile information in Firestore with the new photo URL
            return db.collection('users').doc(user.uid).update({
                name: username,
                photoURL: downloadURL
            }).then(() => {
                console.log("Profile updated successfully"); // Log the success message
                window.location.assign("main.html"); // Redirect to the main page
            })
        })
    } else {
        // If there's no new profile photo, only update the username
        db.collection('users').doc(user.uid).update({
            name: username
        }).then(() => {
            console.log("Username updated successfully"); // Log the success message
            window.history.back(); // Navigate back to the previous page
        })
    }
})


/**
 * Displays the current user's information on the profile editing page. It fetches the user's data
 * from Firestore and updates the username input placeholder and the image preview with the user's
 * current information. This function is called when the profile editing page is loaded.
 */
function showCurrentInfo() {
    let user = firebase.auth().currentUser; // Get the currently authenticated user
    console.log("abcdefg"); // Debugging log

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // If a user is logged in
            db.collection('users').doc(user.uid).get().then(doc => {
                // Fetch the user's document from Firestore using their UID
                if (doc.exists) {
                    // If the document exists
                    const userData = doc.data(); // Extract the user's data from the document
                    console.log("userData"); // Debugging log
                    const userName = userData.name; // Get the user's name
                    const postalCode = userData.postalcode; // Get the user's postal code

                    // Update the username input placeholder with the user's name
                    document.querySelector('#username').placeholder = userName;
                    if (userData.photoURL) {
                        // If a photo URL exists
                        console.log("userData.photoURL"); // Debugging log
                        // Update the image preview with the user's photo
                        document.querySelector('#imagePreview').src = userData.photoURL;
                    }
                } else {
                    // If the document does not exist
                    console.log("No such document"); // Log that the document was not found
                }
            }).catch((error) => {
                // Handle any errors that occur during the fetch
                console.log("Error getting document", error);
            })
        } else {
            // If no user is logged in
            console.log("No user logged in"); // Log that no user is logged in
        }
    })

}
showCurrentInfo();


/**
 * Adds an event listener for changes to the profile photo input. When a new photo is selected,
 * it updates the image preview to show the newly selected photo.
 */
document.querySelector('#profilePhoto').addEventListener('change', function (event){
    const [file] = event.target.files; // Retrieve the selected file from the input
    const imagePreview = document.querySelector('#imagePreview'); // Select the image preview element

    if (file) {
        // If a file is selected
        imagePreview.src = URL.createObjectURL(file); // Update the image preview to show the selected photo
    }
})