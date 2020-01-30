


 // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyD5S2Q5xQe13lPAn5dnBI1vttjEITcNgjs",
    authDomain: "form-7e4c4.firebaseapp.com",
    databaseURL: "https://form-7e4c4.firebaseio.com",
    projectId: "form-7e4c4",
    storageBucket: "form-7e4c4.appspot.com",
    messagingSenderId: "953185893370",
    appId: "1:953185893370:web:6d4c62bdef3d47a2a28243"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

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







