function displayPostSearchResult() {
    let params = new URLSearchParams(window.location.search)
    let searchTerm = params.get('userSearch').toLowerCase()
    console.log(searchTerm)
    let searchKeywords = searchTerm.split(' ')

    if(searchTerm) {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                let postsTemplate = document.getElementById("userPostTemplate")
                let userID = user.uid

                db.collection('users').doc(userID).get().then(userDoc => {
                    let userLocation = userDoc.data().location
                    console.log(userLocation)
                    return db.collection(`posts-${userLocation}`).get()

                }).then(allFeedback => {
                    document.querySelector('#posts-goes-here').innerHTML = ''

                    allFeedback.forEach(doc => {

                        let textContent = doc.data().text.toLowerCase()
                        console.log(textContent)
                        let userName = doc.data().poster.toLowerCase()
                        console.log(userName)
                        let textFound = searchKeywords.some(keyword => textContent.includes(keyword))
                        let nameFound = searchKeywords.some(keyword => userName.includes(keyword))

                        if(textFound || nameFound || searchTerm === '') {

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
            }
        })
    }
}
displayPostSearchResult()