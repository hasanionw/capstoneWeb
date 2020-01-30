// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyCDA3-weE3UgposdsV5iyUiEj4bPQJ6wjo",
  authDomain: "capstoneweb-538d1.firebaseapp.com",
  databaseURL: "https://capstoneweb-538d1.firebaseio.com",
  projectId: "capstoneweb-538d1",
  storageBucket: "capstoneweb-538d1.appspot.com",
  messagingSenderId: "353568425583",
  appId: "1:353568425583:web:f0c5d41d6ebe0e7a606f9a",
  measurementId: "G-QQBE7BPYW3"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

function signUp(){
	var signUp_email = document.getElementById("signUp_email");
	var signUp_password = document.getElementById("signUp_password");

	auth.createUserWithEmailAndPassword(signUp_email.value, signUp_password.value).catch(function(error){
    alert("Error! "+error.message)
  });
}


function signIn(){
	var signIn_email = document.getElementById("signIn_email");
	var signIn_password = document.getElementById("signIn_password");

  auth.signInWithEmailAndPassword(signIn_email.value, signIn_password.value)
  .then(function(){
    alert("Login successful!")
    window.location.href = "dashboard.html"
  })
  .catch(function(){
    alert("Login error!")
  });
}





