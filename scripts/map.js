/**
 * Sets the selected value in the location dropdown menu. This function is typically called
 * when the user selects a location on the interactive map, updating the dropdown to reflect
 * this selection.
 *
 * @param {string} area - The area or location to set as the selected value in the dropdown menu.
 */
function setDropDown(area) {
    document.querySelector('#location-dropdown').value = area; // Set the dropdown value to the selected area
}

/**
 * Adds an event listener to the location submit button. When clicked, it checks if the user
 * is authenticated and updates the user's location in Firestore with the value selected in the
 * dropdown menu. Upon successful update, it redirects the user to the 'main.html' page.
 */
document.querySelector('#location-submit').addEventListener('click', function() {
    // Listen for click events on the location submit button
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // If a user is logged in
            let userLocation = document.querySelector('#location-dropdown').value; // Get the selected location from the dropdown
            // Update the user's location in Firestore
            db.collection('users').doc(user.uid).update({
                location: userLocation
            }).then(function() {
                console.log('Location updated successfully'); // Log the success message
                window.location.href = 'main.html'; // Redirect to the main page
            }).catch(function(error) {
                // Log any errors during the update process
                console.error("Error updating account: ", error);
            })
        }
    })
})
