// globals
let button = document.getElementById('addBtn');
const date = firebase.firestore.Timestamp;
const pro = [];


filtering = (value) => {
let results;
return results = pro.filter(pro => pro.data.promoname.toLowerCase().includes(value.toLowerCase()) );
}

// Searching promo
let searchPros = document.getElementById('search-promos');
searchPros.onkeyup = () => {
if(searchPros.value != '') {
  let docs = filtering(searchPros.value);
  sortingPro(docs);
} else {
  renderCard();
}
}
searchPros.value.onchange = () => {
if(searchPros.value == '') {
  renderCard();
}
}


renderCard = () => {
  let promoCont = document.getElementById('promo-cont');
  let account = pro.filter(p => p.data.account == 'active');
  promoCont.innerHTML = '';

  
  if(account.length > 0) {
    account.forEach((pro) => {

  let card = document.createElement('div');
  card.setAttribute('data-id',pro.id);
  card.classList.add('card', 'promo-cards', 'mx-3', 'my-3');
  card.innerHTML = 
    `<img src="blank.png" class="card-img-top">
    
    <div class="card-body">
      <h3 class="card-title font-weight-bold text-orange">${pro.data.promoname}</h3>
      <h6 class="card-subtitle text-muted font-weight-bold">${pro.data.stat}</h6>
      <p class="card-text mt-2">${pro.data.description}</p>
    </div>

    <div class="card-footer">
      <button class="btn btn-sm btn-orange">View details</button>
      
      <i onclick='deletepromos(this.parentNode.parentNode)'
       data-toggle="tooltip" data-placement="top" title="Delete Card"
       class="far fa-trash-alt my-2" style="font-size: 25px; float: right; color: #DF3A01" ></i>

      <a  onclick='updatefunction(this.parentNode.parentNode)' data-toggle='modal' data-target='#update'>
       <i  data-toggle="tooltip" data-placement="top" title="Update Card" 
       class="fas fa-pen mx-3 my-2"   style="font-size: 25px; float: right; color: #DF3A01" ></i></a>
      
    </div>`;
  promoCont.appendChild(card);

});

$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});
  }
}



renderDelete = () => {
    
    let tbody = document.getElementById('tbody');
    let account = pro.filter(i => i.data.account == 'delete');
    tbody.innerHTML = ``;
  
    if(account.length > 0) {
        account.forEach((pro) => {
        let tr = document.createElement('tr');
        let add = new Date(pro.data.dateAdded.toDate());
        let del = new Date(pro.data.dateDeleted.toDate());
        tr.setAttribute('data-id', pro.id);
        tr.innerHTML = 
          `<td><b>${pro.data.promoname}</b></td>
          <td><b>${months[add.getMonth()]} ${add.getDate()}, ${add.getFullYear()}</b></td>
          <td><b>${months[del.getMonth()]} ${del.getDate()}, ${del.getFullYear()}</b></td>
          <td>
        
           <i id="deleteBtn" onclick='recoverPro(this.parentNode.parentNode)'
               data-toggle="tooltip" data-placement="top" title="Recover ${pro.data.promoname}"
               class="fas fa-undo-alt mx-4" style="cursor:pointer; font-size: 20px; color: #32CD32" ></i>
              
         </td>`;
  
        tbody.appendChild(tr);
  
        
    let tt = $('[data-toggle="tooltip"]').tooltip();
    tt.click(function() {
      tt.tooltip("hide");
    });
  
      });
    } 
  }

sortingPro = (docs) => {
let promoCont = document.getElementById('promo-cont');
promoCont.innerHTML = '';

if(docs.length > 0){
docs.forEach((doc) => {
    let card = document.createElement('div');
  card.classList.add('card', 'promo-cards', 'mx-3', 'my-3');
  card.innerHTML = 
  `<img src="blank.png" class="card-img-top">
    
    <div class="card-body">
      <h3 class="card-title font-weight-bold text-orange">${doc.data.promoname}</h3>
      <h6 class="card-subtitle text-muted font-weight-bold">${doc.data.stat}</h6>
      <p class="card-text mt-2">${doc.data.description}</p>
    </div>

    <div class="card-footer">
      <button class="btn btn-sm btn-orange">View details</button>


      <i onclick='deletepromos(this.parentNode.parentNode)'
       data-toggle="tooltip" data-placement="top" title="Delete Card"
       class="far fa-trash-alt my-2" style="font-size: 25px; float: right; color: #DF3A01" ></i>

      <a  onclick='updatefunction(this.parentNode.parentNode)' data-toggle='modal' data-target='#update'>
       <i  data-toggle="tooltip" data-placement="top" title="Update Card" 
       class="fas fa-pen mx-3 my-2"   style="font-size: 25px; float: right; color: #DF3A01" ></i></a>
      
    </div>`;

    promoCont.appendChild(card);
  });
} else {
  promoCont.innerHTML = 'no data';
}
  }



db.collection('promos')
.where('dateAdded', '<', date.fromDate(new Date()))
.orderBy('dateAdded', 'desc').get().then((snapshot) => {
  snapshot.forEach((doc) => {
    
    pro.push({id: doc.id, data: doc.data()});
  });
}).then(() => {
renderCard();
renderDelete();
});


let sortPermanent = document.getElementById('sort-permanent');
let sortBoth = document.getElementById('sort-both');
let sortTemporary = document.getElementById('sort-temporary');


// Sorting by BOTH
sortBoth.onclick = () => {
  
  sortBoth.classList.add('btn-orange');
  sortBoth.classList.remove('btn-outline-orange');
  sortTemporary.classList.add('btn-outline-orange');
  sortTemporary.classList.remove('btn-orange');
  sortPermanent.classList.add('btn-outline-orange');
  sortPermanent.classList.remove('btn-orange');

  renderCard();
}

// Sorting by Permanent
sortPermanent.onclick = () => {

  sortBoth.classList.add('btn-outline-orange');
  sortBoth.classList.remove('btn-orange');
  sortTemporary.classList.add('btn-outline-orange');
  sortTemporary.classList.remove('btn-orange');
  sortPermanent.classList.add('btn-orange');
  sortPermanent.classList.remove('btn-outline-orange');

let docs = pro.filter(i => i.data.stat == 'Permanent' && i.data.account == 'active');
sortingPro(docs);



}

// Sorting by Temporary
sortTemporary.onclick = () => {

  sortBoth.classList.add('btn-outline-orange');
  sortBoth.classList.remove('btn-orange');
  sortTemporary.classList.add('btn-orange');
  sortTemporary.classList.remove('btn-outline-orange');
  sortPermanent.classList.add('btn-outline-orange');
  sortPermanent.classList.remove('btn-orange');

  let docs = pro.filter(i => i.data.stat == 'Temporary' && i.data.account == 'active');
  sortingPro(docs);
}

// delete card
function deletepromos(tr) {
    let dataId = tr.getAttribute('data-id');
    let agree = confirm("are you sure you want to delete card?");

        if(agree === true){
        db.collection('promos').doc(dataId).update({
          account: 'delete',
          dateDeleted: new Date()
          
        }).then(() => {
          alert('Successfully delete card!');
          window.location.reload();
        })
          .catch((error) => {
          alert(`Error: ${error.message}`);
        });
        }
    }

    // recover card
function recoverPro(tr) {
    let dataId = tr.getAttribute('data-id');
    let agree = confirm("are you sure you want to recover card?");

        if(agree === true){
        db.collection('promos').doc(dataId).update({
          account: 'active'
        }).then(() => {
          alert('Successfully delete card!');
          window.location.reload();
        })
          .catch((error) => {
          alert(`Error: ${error.message}`);
        });
        }
    }


button.addEventListener('click', function() {
  valid = checkValidityAll();
  if(valid == true) {
  let promoname = document.getElementById('promoname').value;
  let amount = document.getElementById('amount').value;
  let stat = document.getElementById('stat').value;
  let start = document.getElementById('start').value;
  let end = document.getElementById('end').value;
  let description = document.getElementById('description').value;

  let startDate = date.fromDate(new Date(start));
  let endDate = date.fromDate(new Date(end));

  let promos = db.collection('promos');
  let discount = promos.where('start', '<', startDate).where('start', '>', endDate);

 
    discount.get().then(function(snapshot) {
      if(snapshot.docs.length > 0) {
        alert('Error: Promo date already exists!');
      } else {
        promos.add({
          promoname: promoname,
          amount: amount,
          stat: stat,
          account: "active",
          start: date.fromDate(new Date(start)),
          end: date.fromDate(new Date(end)),
          description: description,
          dateAdded: date.fromDate(new Date())
        }).then(function() {
          alert('Successfully added new promo!');
          window.location.reload();
        }).catch(function(error) {
          alert(error.message);
        });
      }
    });
  }
});

auth.onAuthStateChanged(function(user) {
  let span = document.getElementById('username');

  if(user) {
    span.textContent = user.email;
  }
})

// tool tip sa plus button
$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});


// logout script
document.getElementById("logoutBtn").addEventListener("click", function() {
  let x = confirm("Are you sure?");
  if(x === true){
    auth.signOut().then(function() {
      alert("Logout successful!");
      window.location.href = "index.html";
    }).catch((err) => {
      alert(`ERROR: ${err.message}`);
    });
  }
});

auth.onAuthStateChanged(function(user){
  if(user) {
    
  } else {
    window.location.href = "index.html";
  }
})


// para mo upload kag picture    
var loadFile = function(event) {
            var image = document.getElementById('output');
            image.src = URL.createObjectURL(event.target.files[0]);
        };

// Update Modal
updatefunction = (x) => {

let id = x.getAttribute("data-id");
let qwe = pro.filter(pro => pro.id == id);
let er = qwe[0];
let data = er.data;

let displaystart = document.getElementById('displaystart');
let displayend = document.getElementById('displayend');
let displaystat = document.getElementById('displaystat');

let updatename = document.getElementById('updatename');
let updateamount = document.getElementById('updateamount');
let updatestart = document.getElementById('updatestart');
let updateend = document.getElementById('updateend');
let updatestat = document.getElementById('updatestat');
let updatedescription = document.getElementById('updatedescription');
let span = document.getElementById('promoname-span'); 

updatename.value = data.promoname;
updateamount.value = data.amount;
updatestart.valueAsDate = new Date(data.start.toDate());
updateend.valueAsDate = new Date(data.end.toDate());

displaystat.value = data.stat;
updatedescription.value = data.description;

let updateBtn = document.getElementById('updateBtn');
updateBtn.onclick = () => {

  updatevalid = checkUPDATEValidityAll();
  if(updatevalid == true) {
  
db.collection('promos').doc(id).update({
amount: updateamount.value,
start: new Date(updatestart.value),
end: new Date(updateend.value),
stat: updatestat.value,
description: updatedescription.value

}).then(() => {
alert('Successfully updated promos!');
window.location.reload();
});
  }
}
}

// para mo upload kag picture
var uploader = document.getElementById('uploader');
var fileButton = document.getElementById('fileButton');

fileButton.addEventListener('change', function(e){
  var file = e.target.files[0];
  var storageRef = firebase.storage().ref('promosimage/' + file.name);
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
});


function securityReports() {
  
  let password = prompt('security password');
if(password == '123')
{
  window.location.href = "reports.html";
}
}

function securityLogtrail() {

let password = prompt('security password');
if(password == '123')
{
window.location.href = "logtrail.html";
} 
}

//validation//validation//validation//validation//validation//validation//validation//validation//validation

checkValidityAll = () => {
   // promoname
   let fname = document.getElementById('promoname');
   let fnameValid;
   if(fname.value == '') {
     document.getElementById(`promoname-empty`).style.display = 'block';
     fnameValid = false;
   } else {
     document.getElementById(`promoname-empty`).style.display = 'none';
     if(parseInt(fname.value) || fname.value.match(/\d+/) != null) {
       document.getElementById(`promoname-invalid`).style.display = 'block';
       fnameValid = false;
     } else {
       document.getElementById(`promoname-invalid`).style.display = 'none';
       fnameValid = true;
     }
   }

   
  // status
  let stat = document.getElementById('stat');
  let statValid;
  if(stat.value == '') {
    document.getElementById(`stat-invalid`).style.display = 'block';
    statValid = false;
  } else {
    document.getElementById(`stat-invalid`).style.display = 'none';
    
  }

  // AMOUNT
  let phone = document.getElementById('amount');
  let phoneEmpty = document.getElementById(`amount-empty`);
  let phoneInvalid = document.getElementById(`amount-invalid`);
  let length = document.getElementById(`amount-length`);
  let phoneValid;
  if(phone.value == '') {
    phoneEmpty.style.display = 'block';
    length.style.display = 'none';
    phoneValid = false;
  } else {
    phoneEmpty.style.display = 'none';
    if(phone.value.match(/[a-zA-Z]/) != null) {
      phoneInvalid.style.display = 'block';
      length.style.display = 'none';
      phoneValid = false;
    } else {
      phoneInvalid.style.display = 'none';
      if(phoneEmpty.style.display == 'block' || phoneInvalid.style.display == 'block') {
        length.style.display = 'none';
      } else if(phone.value.length > 4) {
        length.style.display = 'block';
        phoneValid = false;
      } else {
        length.style.display = 'none';
        phoneValid = true;
      }
    }
  }
 // description
 let description = document.getElementById('description');
 let descriptionValid;
 if(description.value == '') {
   document.getElementById(`description-invalid`).style.display = 'block';
   descriptionValid = false;
 } else {
   document.getElementById(`description-invalid`).style.display = 'none';
   
 }
   if(fnameValid == true 
   && phoneValid == true) {
     return true;
   }
 
}
checkDescription = (e) => {
  let empty = document.getElementById(`${e.id}-invalid`);
  
  if(e.value == '') {
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
  }

}

checkIfValid = (e) => {
  let empty = document.getElementById(`${e.id}-empty`);
 
    if(e.value == '') {
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
    }
  
}

checkStat = (e) => {
  let empty = document.getElementById(`${e.id}-invalid`);
  
  if(e.value == '') {
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
  }

}

checkNumber = (e) => {
  let empty = document.getElementById(`${e.id}-empty`);
  let invalid = document.getElementById(`${e.id}-invalid`);
  let length = document.getElementById(`${e.id}-length`);
  if(e.value == '') {
    empty.style.display = 'block';
    length.style.display = 'none';
  } else {
    empty.style.display = 'none';
  }

  if(e.value.match(/[a-zA-Z]/) != null) {
    invalid.style.display = 'block';
    length.style.display = 'none';
  } else {
    invalid.style.display = 'none';
    if(empty.style.display == 'block' || invalid.style.display == 'block') {
      length.style.display = 'none';
    } else if(e.value.length > 4) {
      length.style.display = 'block';
      valid = false;
    } else {
      length.style.display = 'none';
    }
  }
}


//updatevalidation//updatevalidation//updatevalidation//updatevalidation//updatevalidation//updatevalidation

checkUPDATEValidityAll = () => {
 // amount
 let phone = document.getElementById('updateamount');
 let phoneEmpty = document.getElementById(`updateamount-empty`);
 let phoneInvalid = document.getElementById(`updateamount-invalid`);
 let length = document.getElementById(`updateamount-length`);
 let phoneValid;
 if(phone.value == '') {
   phoneEmpty.style.display = 'block';
   length.style.display = 'none';
   phoneValid = false;
 } else {
   phoneEmpty.style.display = 'none';
   if(phone.value.match(/[a-zA-Z]/) != null) {
     phoneInvalid.style.display = 'block';
     length.style.display = 'none';
     phoneValid = false;
   } else {
     phoneInvalid.style.display = 'none';
     if(phoneEmpty.style.display == 'block' || phoneInvalid.style.display == 'block') {
       length.style.display = 'none';
     } else if(phone.value.length > 4) {
       length.style.display = 'block';
       phoneValid = false;
     } else {
       length.style.display = 'none';
       phoneValid = true;
     }
   }
 }


 // description
 let description = document.getElementById('updatedescription');
 let descriptionValid;
 if(description.value == '') {
   document.getElementById(`updatedescription-invalid`).style.display = 'block';
   descriptionValid = false;
 } else {
   document.getElementById(`updatedescription-invalid`).style.display = 'none';
   
 }

 

 if(
  phoneValid == true) {
   return true;
 }

}



checkUpdateDescription = (e) => {
  let empty = document.getElementById(`${e.id}-invalid`);
  
  if(e.value == '') {
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
  }

}


checkUpdateNumber = (e) => {

  let empty = document.getElementById(`${e.id}-empty`);
  let invalid = document.getElementById(`${e.id}-invalid`);
  let length = document.getElementById(`${e.id}-length`);
  if(e.value == '') {
    empty.style.display = 'block';
    length.style.display = 'none';
  } else {
    empty.style.display = 'none';
  }

  if(e.value.match(/[a-zA-Z]/) != null) {
    invalid.style.display = 'block';
    length.style.display = 'none';
  } else {
    invalid.style.display = 'none';
    if(empty.style.display == 'block' || invalid.style.display == 'block') {
      length.style.display = 'none';
    } else if(e.value.length > 4) {
      length.style.display = 'block';
      valid = false;
    } else {
      length.style.display = 'none';
    }
  }

}