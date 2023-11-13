



document.querySelector('#profileForm').addEventListener('submit', function (event){
    event.preventDefault()
    const user = firebase.auth().currentUser
    const username = document.querySelector('#username').value
    const postalcode = document.querySelector('#postalcode').value
    const profilePhoto = document.querySelector('#profilePhoto').files[0]

    if(user && profilePhoto) {

        const storageRef = firebase.storage().ref('profile_photos/' + user.uid + '/' + profilePhoto.name)

        storageRef.put(profilePhoto).then(snapshot => {
            return snapshot.ref.getDownloadURL();
        }).then(downloadURL => {

            return db.collection('users').doc(user.uid).update({
                name: username,
                postalcode: postalcode,
                photoURL: downloadURL
            }).then(() => {
                console.log("Profile updated successfully")

            })
        })


    }
})

document.querySelector('#profilePhoto').addEventListener('change', function (event){
    const [file] = event.target.files;
    const imagePreview = document.querySelector('#imagePreview')
    if (file) {
        imagePreview.src = URL.createObjectURL(file)
    }
})