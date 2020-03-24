//globals
const inv = [];
const date = firebase.firestore.Timestamp;


    
 
// creating a data 
    var button = document.getElementById('addBtn');

    button.addEventListener('click', function() {
      valid = checkValidityAll();
      if(valid == true) {

      var name = document.getElementById('name').value;
      var category = document.getElementById('category').value;
      var quantity = document.getElementById('quantity').value;
     
      var description = document.getElementById('description').value;

// checking if there is a duplicate data
      var inventory = db.collection('inventory');
      var storage = inventory.where('name', '==', name);


      storage.get().then(function(snapshot) {
        if(snapshot.docs.length > 0) {
          alert('Error: Inventory already exists!');
        } else {
          inventory.add({
            name: name,
            category: category,
            quantity: quantity,
            working: quantity,
            damage: "0",
            status: "active",
            description: description,
            dateAdded: date.fromDate(new Date())
            
          }).then(function() {
            alert('Successfully added new Inventory!');
            window.location.reload();
          }).catch(function(error) {
            alert(error.message);
          });
        }
      });
      }
    });

     // para mo upload kag picture    
var loadFile = function(event) {
    var image = document.getElementById('output');
    image.src = URL.createObjectURL(event.target.files[0]);
};

renderCard = () => {
  let inventoryCont = document.getElementById('inventory-cont');

  let status = inv.filter(i => i.data.status == 'active');

  if(status.length > 0) {
    status.forEach((inv) => {
      let card = document.createElement('div');
      card.setAttribute('data-id',inv.id);
      card.classList.add('card', 'inventory-cards', 'mx-3', 'my-3');
      card.innerHTML = 
        `<img src="blank.png" class="card-img-top">
        <div class="card-body">
          <h3 class="card-title font-weight-bold text-orange">${inv.data.name}</h3>
          <h6 class="card-subtitle text-muted font-weight-bold">${inv.data.category}</h6>
          <p class="card-text mt-2">${inv.data.description}</p>
        </div>
        <div class="card-footer">
          <button   onclick='viewInventory(this.parentNode.parentNode)' data-toggle='modal' data-target='#displayallrecords' class="btn btn-sm btn-orange ">details</button>  
          <button  onclick='updatefunction(this.parentNode.parentNode)' data-toggle='modal' data-target='#update'  class="btn btn-sm btn-orange">UPDATE</button>
          <i id="deletebtn" onclick='deleteInv(this.parentNode.parentNode)' data-toggle="tooltip" data-placement="top" title="Delete Card" class="far fa-trash-alt my-2" style="font-size: 25px; float: right; color: #DF3A01" ></i>
        </div>`;
      inventoryCont.appendChild(card);
    });

    let tt = $('[data-toggle="tooltip"]').tooltip();
    tt.click(function() {
      tt.tooltip("hide");
    });
  }
}



  renderDelete = () => {
    
    let tbody = document.getElementById('tbody');
    let status = inv.filter(i => i.data.status == 'delete');
    tbody.innerHTML = ``;
  
    if(status.length > 0) {
        status.forEach((inv) => {
        let tr = document.createElement('tr');
        let add = new Date(inv.data.dateAdded.toDate());
        let del = new Date(inv.data.dateDeleted.toDate());
        tr.setAttribute('data-id', inv.id);
        tr.innerHTML = 
          `<td><b>${inv.data.name}</b></td>
          <td><b>${months[add.getMonth()]} ${add.getDate()}, ${add.getFullYear()}</b></td>
          <td><b>${months[del.getMonth()]} ${del.getDate()}, ${del.getFullYear()}</b></td>
          <td>
        
          <i  onclick='viewInventory(this.parentNode.parentNode)'
         data-toggle='modal' data-target='#displayallrecords' 
         style="font-size:20px; cursor:pointer;" class="fas fa-eye"></i>  

           <i id="deleteBtn" onclick='recoverInv(this.parentNode.parentNode)'
               data-toggle="tooltip" data-placement="top" title="Recover ${inv.data.name}"
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


  function deleteInv(tr) {

    let dataId = tr.getAttribute('data-id');
    let agree = confirm("are you sure you want to delete card?");
    
    
        if(agree === true){
        db.collection('inventory').doc(dataId).update({
          dateDeleted: new Date(),
          status: 'delete'
       
        }).then(() => {
          alert('Successfully delete card!');
          window.location.reload();
        })
          .catch((error) => {
          alert(`Error: ${error.message}`);
        });
        }
     
    
    }

    function recoverInv(tr) {

        let dataId = tr.getAttribute('data-id');
        let agree = confirm("are you sure you want to recover card?");
        
        
            if(agree === true){
            db.collection('inventory').doc(dataId).update({
              status: 'active'
           
            }).then(() => {
              alert('Successfully recover card!');
              window.location.reload();
            })
              .catch((error) => {
              alert(`Error: ${error.message}`);
            });
            }

        }

  filtering = (value) => {
      let results;
      return results = inv.filter(inv => inv.data.name.toLowerCase().includes(value.toLowerCase()) );
    }

  // Searching Inventory
  let searchInv = document.getElementById('search-inventory');

  searchInv.onkeyup = () => {
   
      if(searchInv.value != '' ) {
        let docs = filtering(searchInv.value);
        sortingInv(docs);
      } else {
        renderCard();
      }
    }
  
    searchInv.value.onchange = () => {
      if(searchInv.value == '') {
        renderCard();
      }
    }
        

    let sortWeights = document.getElementById('sort-weights');
    let sortBoth = document.getElementById('sort-both');
    let sortMachines = document.getElementById('sort-machines');
    let card = document.getElementById('inventory-cont');

    // Sorting by BOTH
    sortBoth.onclick = () => {
      card.innerHTML = '';
      sortBoth.classList.add('btn-orange');
      sortBoth.classList.remove('btn-outline-orange');
      sortMachines.classList.add('btn-outline-orange');
      sortMachines.classList.remove('btn-orange');
      sortWeights.classList.add('btn-outline-orange');
      sortWeights.classList.remove('btn-orange');

     
      renderCard();
    }

    // Sorting by Weights
    sortWeights.onclick = () => {
      card.innerHTML = '';
      sortBoth.classList.add('btn-outline-orange');
      sortBoth.classList.remove('btn-orange');
      sortMachines.classList.add('btn-outline-orange');
      sortMachines.classList.remove('btn-orange');
      sortWeights.classList.add('btn-orange');
      sortWeights.classList.remove('btn-outline-orange');

      let docs = inv.filter(i => i.data.category == 'Cardio Equipment' && i.data.status == 'active');
      sortingInv(docs);

    }
    
      // Sorting by machines
      sortMachines.onclick = () => {
        sortBoth.classList.add('btn-outline-orange');
        sortBoth.classList.remove('btn-orange');
        sortMachines.classList.add('btn-orange');
        sortMachines.classList.remove('btn-outline-orange');
        sortWeights.classList.add('btn-outline-orange');
        sortWeights.classList.remove('btn-orange');

        let docs = inv.filter(i => i.data.category == 'Weight Room Equipment' && i.data.status == 'active');
        sortingInv(docs);


    }

   
    


  sortingInv = (docs) => {
      let InventoryCont = document.getElementById('inventory-cont');
  
      if(docs.length > 0){
      InventoryCont.innerHTML = '';
      docs.forEach((doc) => {
          let card = document.createElement('div');
        card.classList.add('card', 'inventory-cards', 'mx-3', 'my-3');
        card.innerHTML = 
        `<img src="blank.png" class="card-img-top">
          <div class="card-body">
            <h3 class="card-title font-weight-bold text-orange">${doc.data.name}</h3>
            <h6 class="card-subtitle text-muted font-weight-bold">${doc.data.category}</h6>
            <p class="card-text mt-2">${doc.data.description}</p>
          </div>
          <div class="card-footer">
            <button  onclick='viewInventory(this.parentNode.parentNode)'
         data-toggle='modal'  data-target='#displayallrecords' class="btn btn-sm btn-orange">details</button>  
         
         <button  onclick='updatefunction(this.parentNode.parentNode)'
         data-toggle='modal' data-target='#update'  class="btn btn-sm btn-orange">UPDATE</button>
         
         <i id="deletebtn" onclick='deleteInv(this.parentNode.parentNode)'
         data-toggle="tooltip" data-placement="top" title="Delete Card"
         class="far fa-trash-alt my-2" style="font-size: 25px; float: right; color: #DF3A01" ></i>
        </div>
       
        
     
          `;
          InventoryCont.appendChild(card);
        });
      } else {
        InventoryCont.innerHTML = 'no data';
      }
    }

    
    

    // display data by dateaAdded
    db.collection('inventory').orderBy('dateAdded', 'desc').get().then(function(snapshot) {
      snapshot.forEach((doc) => {
        inv.push({id: doc.id, data: doc.data()});
      });
    }).then(() => {
      renderCard();
      renderDelete();
    });

    // show all the inputed data 
    function viewInventory(x) {
      let id = x.getAttribute("data-id");
      let span = document.getElementById('viewfname-span');

      let eut = inv.filter(inv => inv.id == id);
      let kol = eut[0];
      let data = kol.data;

      let viewId = document.getElementById("view-id");
      let name = document.getElementById("view-name");
      let category = document.getElementById("view-category");
      let quantity = document.getElementById("view-quantity");
      let working = document.getElementById("view-working");
      let damage = document.getElementById("view-damage");
      let description = document.getElementById("view-description");

        span.textContent = data.name; 
        viewId.value = id;
        name.value = data.name;
        category.value = data.category;
        quantity.value = data.quantity;
        working.value = data.working;
        damage.value = data.damage;
        description.value = data.description;

    }

 
   // update function
   function updatefunction(x) {
      let updatename = document.getElementById('updatename');
      let updatequantity = document.getElementById('updatequantity');
      let updateworking = document.getElementById('updateworking');
      let displaycategory = document.getElementById('displaycategory');
      let updatedamage = document.getElementById('updatedamage');
      let updatedescription = document.getElementById('updatedescription');
      let span = document.getElementById('fname-span');
    
      let id = x.getAttribute("data-id");

      let qwe = inv.filter(inv => inv.id == id);
      let er = qwe[0];
      let data = er.doc;

      db.collection('inventory').doc(id).get().then(function(doc) {

        span.textContent = doc.data().name; // firstname na mo display sa update modal
        updatename.value = doc.data().name;
        updatequantity.value = doc.data().quantity;
        displaycategory.value = doc.data().category;
        updateworking.value = doc.data().working;
        updatedamage.value = doc.data().damage;
        updatedescription.value = doc.data().description;

       
       

      document.getElementById('updateBtn').addEventListener('click', () => {
        
        updatevalid = checkUPDATEValidityAll();
        if(updatevalid == true) {

          let quantity = document.getElementById('updatequantity').value;
          let category = document.getElementById('updatecategory').value;
          let working = document.getElementById('updateworking').value;
          let damage = document.getElementById('updatedamage').value;
          let description = document.getElementById('updatedescription').value;

          db.collection('inventory').doc(doc.id).update({
            quantity: quantity,
            category: category,
            working: working,
            damage: damage,
            description: description,
            
              
          }).then(() => {
            alert('Successfully updated Inventory!');
            window.location.reload();
          }).catch((error) => {
            alert(`Error: ${error.message}`);
          });
        }
        });
     
      });
    }
    

    

    auth.onAuthStateChanged(function(user) {
      let span = document.getElementById('username');

      if(user) {
        span.textContent = user.email;
      }
    })


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

 // para mo upload kag picture
 var uploader = document.getElementById('uploader');
    var fileButton = document.getElementById('fileButton');
   
    fileButton.addEventListener('change', function(e){
        var file = e.target.files[0];
        var storageRef = firebase.storage().ref('inventoryimage/' + file.name);
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




   
// mo calculate sha
    document.getElementById('enterCalc').addEventListener('click', () => {
      let damage = document.getElementById('updatedamage');
      let working = document.getElementById('updateworking');
      let quantity = document.getElementById('updatequantity');

      let x = parseInt(damage.value);
      let y = parseInt(quantity.value);

      working.value = y-x;
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
      // name
   let fname = document.getElementById('name');
   let fnameValid;
   if(fname.value == '') {
     document.getElementById(`name-empty`).style.display = 'block';
     fnameValid = false;
   } else {
     document.getElementById(`name-empty`).style.display = 'none';
     if(parseInt(fname.value) || fname.value.match(/\d+/) != null) {
       document.getElementById(`name-invalid`).style.display = 'block';
       fnameValid = false;
     } else {
       document.getElementById(`name-invalid`).style.display = 'none';
       fnameValid = true;
     }
   }


    // quantity
  let phone = document.getElementById('quantity');
  let phoneEmpty = document.getElementById(`quantity-empty`);
  let phoneInvalid = document.getElementById(`quantity-invalid`);
  let length = document.getElementById(`quantity-length`);
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
      } else if(phone.value.length > 3) {
        length.style.display = 'block';
        phoneValid = false;
      } else {
        length.style.display = 'none';
        phoneValid = true;
      }
    }
  }

  // Category
  let category = document.getElementById('category');
  let categoryValid;
  if(category.value == '') {
    document.getElementById(`category-invalid`).style.display = 'block';
    categoryValid = false;
  } else {
    document.getElementById(`category-invalid`).style.display = 'none';
    
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

  checkCategory = (e) => {
    let empty = document.getElementById(`${e.id}-invalid`);
    
    if(e.value == '') {
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
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
    } else if(e.value.length > 3) {
      length.style.display = 'block';
      valid = false;
    } else {
      length.style.display = 'none';
    }
  }
}

//updatevalidation//updatevalidation//updatevalidation//updatevalidation//updatevalidation//updatevalidation

checkUPDATEValidityAll = () => {

   // quantity
   let phone = document.getElementById('updatequantity');
   let phoneEmpty = document.getElementById(`updatequantity-empty`);
   let phoneInvalid = document.getElementById(`updatequantity-invalid`);
   let length = document.getElementById(`updatequantity-length`);
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
       } else if(phone.value.length > 3) {
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
    } else if(e.value.length > 3) {
      length.style.display = 'block';
      valid = false;
    } else {
      length.style.display = 'none';
    }
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




