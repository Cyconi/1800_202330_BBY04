function displayUserPosts(collection) {
    let user = firebase.auth().currentUser;
    firebase.auth().onAuthStateChanged(function(user) {
        let postsTemplate = document.getElementById("userPostTemplate")
        if (user) {

            db.collection('users').doc(user.uid).get().then(userDoc => {
                const userLocation = userDoc.data().location

                db.collection(collection).get()
                    .then(allPosts => {
                        allPosts.forEach(doc => {
                            let posterLocation = doc.data().posterLocation

                            if (userLocation === posterLocation) {
                                let story = doc.data().text;
                                let posterName = doc.data().poster;
                                let imageUrl = doc.data().imageUrl
                                let posterImg = doc.data().posterImg
                                let docID = doc.id
                                const firestoreTimeStamp = doc.data().timestamp;
                                const date = firestoreTimeStamp.toDate();

                                let newpost = postsTemplate.content.cloneNode(true);

                                newpost.querySelector('.postImg').id = `${docID}`
                                newpost.querySelector('.postText-goes-here').innerText = story
                                newpost.querySelector('.posterName-goes-here').innerText = posterName
                                newpost.querySelector('.postTime-goes-here').innerHTML = new Date(date).toLocaleString()
                                newpost.querySelector('a').href = "eachPost.html?docID=" + docID

                                if (imageUrl) {
                                    let imgElement = newpost.querySelector('.postImg-goes-here')
                                    imgElement.src = imageUrl
                                    imgElement.style.display = 'block';
                                }
                                if (posterImg) {
                                    let posterPhoto = newpost.querySelector('.posterImg')
                                    posterPhoto.src = posterImg
                                }

                                document.getElementById(collection + "-goes-here").appendChild(newpost);
                                if (!imageUrl) {
                                    document.getElementById(`${docID}`).style.display = 'none'

                                }

                            }


                        })

                    })
            })

        } else {
            console.log('User is not login')
        }
    })



}
displayUserPosts("posts");