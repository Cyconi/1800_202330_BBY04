function setDropDown(area) {
    document.querySelector('#location-dropdown').value = area
}

document.querySelector('#location-submit').addEventListener('click', function() {

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            let userLocation = document.querySelector('#location-dropdown').value
            db.collection('users').doc(user.uid).update({
                location: userLocation
            }).then(function(){
                console.log('location update successfully')
                window.location.href = 'main.html'
            }).catch(function(error) {
                console.error("Error updating account: ", error)
            })


        }
    })
})
