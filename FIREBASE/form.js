1// Your web app's Firebase configuration
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
firebase.analytics();

const auth = firebase.auth();

function signUp(){
	var signUp_email = document.getElementById("signUp_email");
	var signUp_password = document.getElementById("signUp_password");

	const promise = auth.createUserWithEmailAndPassword(signUp_email.value, signUp_password.value);
	promise.catch(e => alert(e.message));

	alert("You are now Registered as " + signUp_email.value);
}
	

function signIn(){

	var signIn_email = document.getElementById("signIn_email");
	var signIn_password = document.getElementById("signIn_password");

	const promise = auth.signInWithEmailAndPassword(signIn_email.value, signIn_password.value);
	promise.catch(e => alert(e.message));

	alert(signIn_email.value );
	


}


firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.

    document.getElementById("log").style.display = "block";
    document.getElementById("sidebar").style.display = "block";
    
  } else {
    // No user is signed in.
     document.getElementById("log").style.display = "block";
     document.getElementById("sidebar").style.display = "none";

  }
});

auth.onAuthStateChanged(function(user){
  if(user){
  var email = user.email;
  alert("Active User " + email);
  //is signed in
  }else{
  alert("No Active User");
  //no user is sign in
  }
});

function signOut(){

    
  alert("signOut");



  }







