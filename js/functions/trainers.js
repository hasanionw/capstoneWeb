const tra = [];
const storageImage = storage.ref('trainerimages')



    // para mo sulod ang picture sa circle
    var loadFile = function(event) {
        var image = document.getElementById('output');
        image.src = URL.createObjectURL(event.target.files[0]);
    };
    
     
     
    let tableLoader = document.getElementById('table-loader');
    const noData = document.getElementById('no-data');
    window.onload = () => {
    
    }
  
    // para mo upload kag picture
    let uploader = document.getElementById('uploader');
    let fileButton = document.getElementById('fileButton');
 
    // const loader = document.getElementById('loader');
    // const loaderchild = document.getElementById('loaderchild');
    // window.onload = () => {
    //   loader.style.display = 'block';
    // }

    let sortActive = document.getElementById('sort-active');
    let sortBoth = document.getElementById('sort-both');
    let sortInactive = document.getElementById('sort-inactive');
    let tbody = document.getElementById('tbody');

    // Sorting by BOTH
    sortBoth.onclick = () => {
      tbody.innerHTML = '';
      sortBoth.classList.add('btn-orange');
      sortBoth.classList.remove('btn-outline-orange');
      sortInactive.classList.add('btn-outline-orange');
      sortInactive.classList.remove('btn-orange');
      sortActive.classList.add('btn-outline-orange');
      sortActive.classList.remove('btn-orange');

      renderData();
    }

    
    // Sorting by ACTIVE
sortActive.onclick = () => {
  tbody.innerHTML = '';
  sortBoth.classList.add('btn-outline-orange');
  sortBoth.classList.remove('btn-orange');
  sortInactive.classList.add('btn-outline-orange');
  sortInactive.classList.remove('btn-orange');
  sortActive.classList.add('btn-orange');
  sortActive.classList.remove('btn-outline-orange');

 
  let docs = tra.filter(t => t.doc.status == 'active' && t.doc.chat == 'able');

  sortingTra(docs);
}

// Sorting by INACTIVE
sortInactive.onclick = () => {
  tbody.innerHTML = '';
  sortBoth.classList.add('btn-outline-orange');
  sortBoth.classList.remove('btn-orange');
  sortInactive.classList.add('btn-orange');
  sortInactive.classList.remove('btn-outline-orange');
  sortActive.classList.add('btn-outline-orange');
  sortActive.classList.remove('btn-orange');

 

  let docs = tra.filter(t => t.doc.status == 'inactive' && t.doc.chat == 'able');

  sortingTra(docs);
}



    // creating a data 
    var button = document.getElementById('addtrainer');

    button.addEventListener('click', function() {
      var fname = document.getElementById('fname').value;
      var lname = document.getElementById('lname').value;
      var email = document.getElementById('email').value;
      var cellphoneNo = document.getElementById('phone').value;
      var birthdate = document.getElementById('birthdate').value;
      var sex = document.getElementById('sex').value;
     
      var address = document.getElementById('address').value;
  
      var date = new Date();
      var dateAdded = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          
      // checking if there is a duplicate 
      var trainers = db.collection('trainers');
      var trainer = trainers.where('fname', '==', fname).where('lname', '==', lname).where('email', '==', email);

      if(fname === '') {
        alert('ERROR: First name is required!');
      } else if(lname === '') {
        alert('ERROR: Last name is required!');
      } else if(email === '') {
        alert('ERROR: Email is required!');
      } else if(cellphoneNo === '') {
        alert('ERROR: cellphone number is required!');
      } else if(birthdate === '') {
        alert('ERROR: birthdate is required!');
      }else if(sex === '') {
        alert('ERROR: sex  is required!');
      } else if(address === '') {
        alert('ERROR: Address is required!');
      } else {

      trainer.get().then(function(snapshot) {
        if(snapshot.docs.length > 0) {
          alert('Error: Trainer already exists!');
        } else {
          trainers.add({
            fname: fname,
            lname: lname,
            email: email,
            cellphoneNo: cellphoneNo,
            birthdate: new Date(birthdate),
            sex: sex,
            position: 'junior',           
            chat: 'able',
            address: address,
            status: 'active',
            dateAdded: new Date()
          }).then(function() {
            alert('Successfully added new Trainer!');
            // window.location.reload();
          })
          .then(() => {
            if(fileButton.files.length == 0) {
              alert("Successfully added trainer");
              window.location.reload();
            } else {
              db.collection('trainers').orderBy('dateAdded', 'desc').get().then((snap) => {
                let uid = snap[0].docs.id;
    
                var file = fileButton.files[0];
                var storageRef = storage.ref('trainerimages/' + uid + '.jpg');
                var task = storageRef.put(file);
                
                task.on('state_changed',
                    function progress(snapshot){
                        var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        uploader.value = percentage;
                    },
                    function error(err){
    
                    },
                    function complete(){
                    alert('successfuly upload picture')
                    }  
                );
              })
            }
          })
          .catch(function(error) {
            alert(error.message);
          });    
        }
      })
      
      }
    });

   
  filtering = (value) => {
      let results;
      return results = tra.filter(tra => tra.fullName.toLowerCase().includes(value.toLowerCase()) );
    }






  // Searching Trainers
  let searchTra = document.getElementById('search-trainers');
  

  searchTra.onkeyup = () => {
      if(searchTra.value != '') {
        let docs = filtering(searchTra.value);
        sortingTra(docs);
      } else {
        renderData();
       
      }
    }
    searchTra.value.onchange = () => {
      if(searchTra.value == '') {
        renderData();
      
      }
    }


    


// display data in the table  
renderData = () => {
  let tbody = document.getElementById('tbody');
  tbody.innerHTML='';
  let chat = tra.filter(tra => tra.doc.chat == 'able');

  if(chat.length > 0) {
  chat.forEach((tra) => {
  let tr = document.createElement('tr');
  tr.setAttribute('data-id',tra.id);
  tr.innerHTML = 

  `<td><span class="hidden" id="${tra.id}-span"></span><a>
  <small id='${tra.id}-small' onclick='showID("${tra.id}")'>
  <i data-toggle="tooltip" data-placement="top" title="Show ${tra.doc.fname}"  class="fas fa-eye"></i></small></a></td>
  <td><b>${tra.doc.fname}</b></td>
  <td><b>${tra.doc.lname}<b></td>
  <td><b>${tra.doc.status}<b></td>
  <td><b>${tra.doc.position}<b></td>

  <td>
    <a  class='btn-link  edit' onclick='updatestat(this.parentNode.parentNode)'
     data-toggle='modal' data-target='#update'>
     <i class="fas fa-pen mx-1 " style='font-size: 20px; color:#DF3A01' data-toggle="tooltip" title="Update ${tra.doc.fname}" data-placement="top"></i></a>
     
    <a class='btn-link' onclick='viewTrainers(this.parentNode.parentNode)'
     data-toggle='modal' data-target='#displayallrecords'>
     <i data-toggle="tooltip" data-placement="top" title="view ${tra.doc.fname}" class="fas fa-eye" style="font-size: 20px;"></i></a>
 
     <i id="deletebtn" onclick='deleteTable1(this.parentNode.parentNode)'
         data-toggle="tooltip" data-placement="top" title="Delete ${tra.doc.fname}"
         class="far fa-trash-alt mx-4" style="cursor:pointer; font-size: 20px; color: #DF3A01" ></i>

   </td>`;
  tbody.appendChild(tr);

  let tt = $('[data-toggle="tooltip"]').tooltip();
  tt.click(function() {
    tt.tooltip("hide");
  });
  
  });
} else {
document.getElementById('no-data-div').style.display = 'flex';
}
}



renderDelete = () => {
  document.getElementById('no-data-div-walkin').style.display = 'none';
  let tbody = document.getElementById('tbody-walk-in');
  let chat = tra.filter(tra => tra.doc.chat == 'disable');
  tbody.innerHTML = ``;

  if(chat.length > 0) {
    chat.forEach((tra) => {
      let tr = document.createElement('tr');
      tr.setAttribute('data-id', tra.id);
      tr.innerHTML = 
        `<td><b>${tra.doc.fname}</b></td>
        <td><b>${tra.doc.lname}<b></td>
        <td>Error</td>
        <td>
       
        <a class='btn-link' onclick='viewTrainers(this.parentNode.parentNode)'
         data-toggle='modal' data-target='#displayallrecords'>
         <i data-toggle="tooltip" data-placement="top" title="view ${tra.doc.fname}" class="fas fa-eye" style="font-size: 20px;"></i></a>
     
         <i id="deleteBtn" onclick='deleteTable2(this.parentNode.parentNode)'
             data-toggle="tooltip" data-placement="top" title="Recover ${tra.doc.fname}"
             class="fas fa-undo-alt mx-4" style="cursor:pointer; font-size: 20px; color: #32CD32" ></i>
            
       </td>`;

      tbody.appendChild(tr);

      
  let tt = $('[data-toggle="tooltip"]').tooltip();
  tt.click(function() {
    tt.tooltip("hide");
  });

    });
  } else {
    document.getElementById('no-data-div-walkin').style.display = 'flex';
  }
}

// Show Deleted Table
document.getElementById('showCalc').addEventListener('click', () => {
  let calc = document.getElementById('calculator');
  if(calc.style.display == 'none') {
    calc.style.display = 'block';
    document.getElementById('showCalc').innerHTML = '<span data-toggle="tooltip" data-placement="top" title="List of Deleted Trainer"><i class="far fa-trash-alt "></i><span>';
  } 

  let tt = $('[data-toggle="tooltip"]').tooltip();
  tt.click(function() {
    tt.tooltip("hide");
  });

});


// Hide Deleted Table
document.getElementById('remove').addEventListener('click', () => {
  let calc = document.getElementById('calculator');
  if(calc.style.display == 'none') {
    calc.style.display = 'block';
    document.getElementById('showCalc').innerHTML ;
  } else {
    calc.style.display = 'none';
    document.getElementById('showCalc').innerHTML ;
  }

  let tt = $('[data-toggle="tooltip"]').tooltip();
  tt.click(function() {
    tt.tooltip("hide");
  });

});


//deleted Trainers nga table 
function deleteTable2(tr) {
  let dataId = tr.getAttribute('data-id');
  let agree = confirm("are you sure you want to recover trainer?");
  
  
      if(agree === true){
      db.collection('trainers').doc(dataId).update({
        chat: 'able'
     
      }).then(() => {
       
        
        alert('Successfully Recover Trainer!');
        window.location.reload();
      })
        .catch((error) => {
        alert(`Error: ${error.message}`);
      });
      }
   
  
  }


  //deleted Trainers nga table 
function deleteTable1(tr) {

  let dataId = tr.getAttribute('data-id');
  let agree = confirm("are you sure you want to delete trainer?");
 
    if(agree === true){
      db.collection('trainers').doc(dataId).update({
        chat: 'disable'
     
      }).then(() => {
        alert('Successfully Delete Trainer!');
        window.location.reload();
      })
        .catch((error) => {
        alert(`Error: ${error.message}`);
      });
    }
}

    sortingTra = (docs) => {
      let tbody = document.getElementById('tbody');
      tbody.innerHTML = '';

      if(docs.length > 0){
        tbody.innerHTML = '';
      docs.forEach((doc) => {
        let tr = document.createElement('tr');
          tr.setAttribute('data-id', doc.id);
          tr.innerHTML = 
          `<td><span class="hidden" id="${doc.id}-span"></span><a>
          <small id='${doc.id}-small' onclick='showID("${doc.id}")'>
          <i data-toggle="tooltip" data-placement="top" title="Show ${doc.doc.fname}"  class="fas fa-eye"></i></small></a></td>
          <td><b>${doc.doc.fname}</b></td>
          <td><b>${doc.doc.lname}<b></td>
          <td><b>${doc.doc.status}<b></td>
          <td><b>${doc.doc.position}<b></td>

          <td>
            <a id="usc" class='btn-link  edit' onclick='updatestat(this.parentNode.parentNode)'
            data-toggle='modal' data-target='#update'>
            <i class="fas fa-pen mx-1 " style='font-size: 20px; color:#DF3A01' data-toggle="tooltip" title="Update ${doc.doc.fname}" data-placement="top"></i></a>
            
            <a class='btn-link' onclick='viewTrainers(this.parentNode.parentNode)'>
            <i data-toggle="tooltip" data-placement="top" title="view ${doc.doc.fname}" class="fas fa-eye" style="font-size: 20px;"></i></a>
         
            <i id="delete" onclick='deletetrainers(this.parentNode.parentNode)'
            data-toggle="tooltip" data-placement="top" title="Delete ${doc.doc.fname}"
            class="far fa-trash-alt mx-4" style="font-size: 20px; color: #DF3A01" ></i>
         
            </td>`;

          tbody.appendChild(tr);
        });
      } else {
        tbody.innerHTML = 'no data';
      }
    }
      
    
  
    // Querying trainers
    db.collection('trainers').orderBy('fname', 'asc').get().then((snapshot) => {
      snapshot.forEach((doc) => {
       
        tra.push({id: doc.id, doc: doc.data(), fullName: `${doc.data().fname} ${doc.data().lname}`})
      });
      renderData();
      renderDelete();
     
    });


    // display the email of the admin in the header
    auth.onAuthStateChanged(function(user) {
      let span = document.getElementById('username');

      if(user) {
        span.textContent = user.email;
      }
    })
       
    function viewTrainers(x) {
      let id = x.getAttribute("data-id");

      let res = tra.filter(tra => tra.id == id);
      let kol = res[0];
      let data = kol.doc;

      let span = document.getElementById('viewfname-span');
      
      let viewId = document.getElementById("view-id");
      let fname = document.getElementById("view-fname");
      let lname = document.getElementById("view-lname");
      let email = document.getElementById("view-email");
      let phone = document.getElementById("view-phone");
      let birthdate = document.getElementById("view-birthdate");
      let sex = document.getElementById("view-sex");
      let address = document.getElementById("view-address");
      let position = document.getElementById("view-position");
      let status = document.getElementById("view-status");
      let chat = document.getElementById("view-chat");
      let bday = new Date(data.birthdate.toDate());
     
      span.textContent = data.fname; 
      viewId.value = id;
      fname.value = data.fname;
      lname.value = data.lname;
      email.value = data.email;
      phone.value = data.cellphoneNo;
      birthdate.value = `${months[bday.getMonth()]} ${bday.getDate()}, ${bday.getFullYear()}`;
      sex.value = data.sex;
      address.value = data.address;
      position.value = data.position;
      status.value = data.status;
      chat.value = data.chat;

      storageImage.child(`${id}.jpg`).getDownloadURL().then(function(url) {    
        // Or inserted into an <img> element:
      
        var img = document.getElementById('trainer-pp');
        img.src = url;
      })
      .then(() => {
        document.getElementById('viewMemberModal').click();
      })
      .catch(function(error) {
        document.getElementById('trainer-pp').src = "blank.png";
        document.getElementById('viewMemberModal').click();
      });
    }
    
    // ID show and hide in the table
    function showID(id) {
      let span = document.getElementById(`${id}-span`);
      let small = document.getElementById(`${id}-small`);

      if(span.classList.contains('hidden')) {
        small.innerHTML = ' <i class="far fa-trash-alt "></i>';
        span.textContent = id;
        span.classList.remove('hidden');
      } else {
        small.innerHTML = ' <i  class="far fa-trash-alt ></i>';
        span.classList.add('hidden');
        span.textContent = '';
      } 
    }

// update function
    function updatestat(tr) {
      let updateFname = document.getElementById('updateFname');
      let updateLname = document.getElementById('updateLname');
      let span = document.getElementById('fname-span');
      let dataId = tr.getAttribute('data-id');
    

      db.collection('trainers').doc(dataId).get().then(function(doc) {
        span.textContent = doc.data().fname; // firstname na mo display sa update modal
        updateFname.value = doc.data().fname;
        updateLname.value = doc.data().lname;
       

      document.getElementById('updateBtn').addEventListener('click', () => {
          let status = document.getElementById('updateStatus').value;
          let position = document.getElementById('updatePosition').value;
          let usc = document.getElementById(`usc`);
        
            db.collection('trainers').doc(doc.id).update({
            status: status,
            position: position 
          }).then(() => {
            alert('Successfully updated Trainer!');
            window.location.reload();
          })
            .catch((error) => {
            alert(`Error: ${error.message}`);
          });
        });
      });
    }


// logout script
    document.getElementById("logoutBtn").addEventListener("click", function() {
      var x = confirm("Are you sure?");
      if(x === true){
        firebase.auth().signOut().then(function() {
          alert("Logout successful!");
          window.location.href = "index.html";
        }).catch(function() {
          alert("Failed to log out!");
        })
      }
    });

    // security, must login
    firebase.auth().onAuthStateChanged(function(user){
      if(user) {
        
      } else {
        window.location.href = "index.html";
      }
    })

      // tool tip sa plus button
    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
    });


    function securityReports() {
        
        let password = prompt('Security Password');
      if(password == '123')
      {
        window.location.href = "reports.html";
      }
    }

    function securityLogtrail() {
      
      let password = prompt('Security Password');
    if(password == '123')
    {
      window.location.href = "logtrail.html";
    } 
  }