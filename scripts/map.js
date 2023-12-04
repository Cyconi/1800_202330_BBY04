/**
 * Sets the selected value in the location dropdown menu. This function is typically called
 * when the user selects a location on the interactive map, updating the dropdown to reflect
 * this selection.
 *
 * @param {string} area - The area or location to set as the selected value in the dropdown menu.
 */
function setDropDown(area) {
    document.querySelector('#location-dropdown').value = area
}

/**
 * Adds an event listener to the location submit button. When clicked, it checks if the user
 * is authenticated and updates the user's location in Firestore with the value selected in the
 * dropdown menu. Upon successful update, it redirects the user to the 'main.html' page.
 */
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
