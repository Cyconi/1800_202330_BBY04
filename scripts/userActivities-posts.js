function loadUserPosts() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            let userID = user.uid
            db.collection('users').doc(userID).get().then(userDoc => {
                let userLocation = userDoc.data().location
                let postsArray = userDoc.data().posts || []
                let postsTemplate = document.querySelector('#userPostTemplate')

                postsArray.forEach(postID => {
                    db.collection(`posts-${userLocation}`).doc(postID).get().then(doc => {
                        if (doc.exists) {
                            let story = doc.data().text
                            let posterName = doc.data().poster
                            let imageUrl = doc.data().imageUrl
                            let posterImg = doc.data().posterImg
                            let likesNumber = doc.data().likesNumber
                            let commentsNumber = doc.data().commentsNumber
                            let docID = doc.id
                            const firestoreTimeStamp = doc.data().timestamp;
                            const date = firestoreTimeStamp.toDate();

                            let newpost = postsTemplate.content.cloneNode(true);

                            newpost.querySelector('.postImg').id = `${docID}`
                            newpost.querySelector('.postText-goes-here').innerText = story
                            newpost.querySelector('.posterName-goes-here').innerText = posterName
                            newpost.querySelector('.likes-number').innerText = likesNumber
                            newpost.querySelector('.comments-number').innerText = commentsNumber
                            newpost.querySelector('.postTime-goes-here').innerHTML = new Date(date).toLocaleString()
                            newpost.querySelector('a').href = "eachPost.html?docID=" + docID

                            let deleteButton = newpost.querySelector('.delete-button')
                            deleteButton.addEventListener('click', function(event) {
                                event.preventDefault()
                                event.stopPropagation()

                                document.querySelector('.yes').value = `${doc.id}`
                                document.querySelector('.delete-confirm-container').style.display = 'block'
                            })

                            let postLikesNumber = newpost.querySelector('.likes-number')

                            newpost.querySelector('.post-icon-like').addEventListener('click', function(event){
                                event.preventDefault()
                                event.stopPropagation()

                                let postRef = db.collection(`posts-${userLocation}`).doc(docID)

                                db.runTransaction(transaction => {
                                    return transaction.get(postRef).then(doc => {

                                        let newLikes = doc.data().likesNumber || 0
                                        let voteUsers = doc. data().voteUser || []

                                        let userIndex = voteUsers.indexOf(userID)

                                        if (userIndex === -1) {
                                            newLikes++
                                            voteUsers.push(userID)
                                        } else {
                                            newLikes = newLikes > 0? newLikes - 1: 0
                                            voteUsers.splice(userIndex, 1)
                                        }

                                        transaction.update(postRef, {
                                            likesNumber: newLikes,
                                            voteUser: voteUsers
                                        })
                                        postLikesNumber.innerText = newLikes

                                    }).then(() => {
                                        console.log("Work!")
                                    })
                                })
                            })

                            if (imageUrl) {
                                let imgElement = newpost.querySelector('.postImg-goes-here')
                                imgElement.src = imageUrl
                                imgElement.style.display = 'block';
                            }
                            if (posterImg) {
                                let posterPhoto = newpost.querySelector('.posterImg')
                                posterPhoto.src = posterImg
                            }

                            document.getElementById("posts-goes-here").appendChild(newpost);
                            if (!imageUrl) {
                                document.getElementById(`${docID}`).style.display = 'none'

                            }
                        }

                    })
                })
            })
        }
    })
}
loadUserPosts()

document.querySelector('.delete-confirm-button').addEventListener('click', function() {
    document.querySelector('.delete-confirm-container').style.display = 'none'
})

document.querySelector('.yes').addEventListener('click', function() {
    let postID = document.querySelector('.yes').value
    console.log(postID)
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            let userID = user.uid
            console.log(userID)

            db.collection('users').doc(userID).get().then(userDoc => {
                let userLocation = userDoc.data().location
                console.log(userLocation)

                db.collection(`posts-${userLocation}`).doc(postID).delete()
                    .then(() => {
                        console.log('Success')

                        db.collection('users').doc(userID).update({
                            posts: firebase.firestore.FieldValue.arrayRemove(postID)
                        }).then(() => {
                            document.querySelector('.delete-confirm-container').style.display = 'none'
                            window.location.reload()
                        })

                    })
            })
        }
    })
})