//----------------------------------------
//  Your web app's Firebase configuration
//----------------------------------------
var firebaseConfig = {
    apiKey: "AIzaSyDket5BdLzMucJoZeDaTY18Q2ENCyKbWcs",
    authDomain: "teambby-4-cglue.firebaseapp.com",
    projectId: "teambby-4-cglue",
    storageBucket: "teambby-4-cglue.appspot.com",
    messagingSenderId: "1084478478771",
    appId: "1:1084478478771:web:b0a10c8f3b5dc14dc093c6"
};

//--------------------------------------------
// initialize the Firebase app
// initialize Firestore database if using it
//--------------------------------------------
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();