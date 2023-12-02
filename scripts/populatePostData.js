function populatePostData(doc, userID, userLocation) {
    let story = doc.data().text
    let imageUrl = doc.data().imageUrl
    let likesNumber = doc.data().likesNumber
    let commentsNumber = doc.data().commentsNumber
    let docID = doc.id
    const firestoreTimeStamp = doc.data().timestamp;
    const date = firestoreTimeStamp.toDate();

    let voteUsers = doc. data().voteUser || []
    let userIndex = voteUsers.indexOf(userID)

    let posterID = doc.data().posterID;

    db.collection('users').doc(posterID).get().then(posterDoc => {
        let posterName = posterDoc.data().name
        let posterImg = posterDoc.data().photoURL
        let postsTemplate = document.getElementById("userPostTemplate")
        let newpost = postsTemplate.content.cloneNode(true);

        newpost.querySelector('.postImg').id = `${docID}`
        newpost.querySelector('.postText-goes-here').innerText = story
        newpost.querySelector('.posterName-goes-here').innerText = posterName
        newpost.querySelector('.likes-number').innerText = likesNumber
        newpost.querySelector('.comments-number').innerText = commentsNumber
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
        let deleteButton = newpost.querySelector('.delete-button');
        if (deleteButton) {
            deleteButton.addEventListener('click', function(event) {
                event.preventDefault()
                event.stopPropagation()
                document.querySelector('.delete-confirm-container').style.display = 'block'
                document.querySelector('.yes').value = docID;
            })
        }
        let likeIcon =  newpost.querySelector('i.fa-thumbs-up')
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
                        likeIcon.classList.replace('fa-regular','fa-solid' )

                    } else {
                        newLikes = newLikes > 0? newLikes - 1: 0
                        voteUsers.splice(userIndex, 1)
                        likeIcon.classList.replace('fa-solid','fa-regular')
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

        document.getElementById("posts-goes-here").appendChild(newpost);

        if (userIndex === -1) {
            likeIcon.classList.add('fa-regular')

        } else {
            likeIcon.classList.add('fa-solid')
        }
        if (!imageUrl) {
            document.getElementById(`${docID}`).style.display = 'none'

        }

    })

}