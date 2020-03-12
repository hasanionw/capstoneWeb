auth.onAuthStateChanged((user) => {
  if(user) {
    document.getElementById('username').innerText = user.email;
  } else {
    window.location.href = 'index.html';
  }
});


// Global Variables
const members = [];
const qrcode = new QRCode("view-qrcode", {
  height: 90,
  width: 90
});

let regTableLoader = document.getElementById('table-loader');
let walkTableLoader = document.getElementById('table-loader-walkin');
let progTableLoader = document.getElementById('table-loader-programs');
window.onload = () => {
  regTableLoader.style.display = 'flex';
  walkTableLoader.style.display = 'flex';
  progTableLoader.style.display = 'flex';
}

// Add Member Modal
let addBtn = document.getElementById('add-new-member-btn'); 
addBtn.onclick = () => {
  document.getElementById('addMemberModal').click();

  let memberType = document.getElementById('memberType');
  let program = document.getElementById('add-program-div');
  memberType.onchange = () => {
    if(memberType.value == 'Walk-in') {
      program.style.visibility = 'hidden';
    } else {
      program.style.visibility = 'visible';
    }
  }
}

 // Submit by 'ENTER' button
 let addMemberModal = document.getElementById('add-member');
 addMemberModal.addEventListener('keyup', (evt) => {
  if(evt.keyCode == 13) {
    button.click();
  } else if(evt.keyCode == 27) {
    document.getElementById('close-modal').click();
  }
}); 

calculateExpiry = ({date, isMonth}) => {
  let result;
  let days;

  if(isMonth === true) {
    days = 30;
  } else {
    days = 365;
  }

  result = new Date(new Date(date).setDate(new Date(date).getDate() + days));
  return result;
}

// Adding Members to Firebase
let button = document.getElementById('addMemberBtn');
button.onclick = () => {
  let fname = document.getElementById('fName').value;
  let lname = document.getElementById('lName').value;
  let email = document.getElementById('email').value;
  let memberType = document.getElementById('memberType').value;
  let modal = document.getElementById('close-modal');
  let sex = document.getElementById('sex').value;
  let phone = document.getElementById('phone').value;
  let address = document.getElementById('address').value;
  let program = document.getElementById('program').value;
  let birthdate = document.getElementById('birthdate').value;
  let monthlyRate;

  if(memberType == 'Regular') {
    monthlyRate = 750;
  } else {
    monthlyRate = '';
  }

  let date = new Date();
  let annualStart = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  let monthlyStart = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

  let members = db.collection('members');
  let member = members.where('fname', '==', fname).where('lname', '==', lname);

  if(fname === '') {
    alert('ERROR: First name is required!');
  } else if(lname === '') {
    alert('ERROR: Last name is required!');
  } else if(email === '') {
    alert('ERROR: Email is required!');
  } else if(address === '') {
    alert('ERROR: Address is required!');
  } else if(sex === '') {
    alert('ERROR: Sex is required!');
  } else if(phone === '') {
    alert('ERROR: Cellphone number is required!');
  } else {
    member.get().then((snapshot) => {
      if(snapshot.docs.length > 0) {
        alert('ERROR: Member already exists!');
      } else {
        members.add({
          fname: fname,
          lname: lname,
          memberType: memberType,
          status: 'N/A',
          sex: sex,
          dateAdded: firebase.firestore.Timestamp.fromDate(new Date()),
          phone: phone,
          monthlyRate: monthlyRate,
          annualStart: new Date(annualStart),
          annualEnd: calculateExpiry({date: annualStart, isMonth: false}),
          monthlyStart: new Date(monthlyStart),
          monthlyEnd: calculateExpiry({date: monthlyStart, isMonth: true}),
          address: address,
          email: email,
          program: program,
          birthdate: new Date(birthdate)
        }).then(() => {
          db.collection('members').orderBy('dateAdded', 'desc').get().then((snapshot) => {
            let doc = snapshot.docs[0];
            if(doc.data().memberType == 'Regular') {
              member.get().then((snapshot) => {
                snapshot.forEach((doc) => {
                  document.getElementById('new-member-name').textContent = `${doc.data().fname} ${doc.data().lname}`;
                  document.getElementById('new-member-uid').textContent = doc.id;
                  new QRCode('qrcode', {
                    text: doc.id,
                    height: 100,
                    width: 100
                  });
                });
              }).then(() => {
                document.getElementById('close-modal').click();
                document.getElementById('showNewMemberCode').click();
                document.onclick = (e) => {
                  let x = e.target.id;
                  if(x != "new-member-body" && x != "new-member-name" && x != "new-member-uid" && x != "new-member-small") {
                    window.location.reload();
                  }
                }
              });
            } else {
              alert('Successfully added new walk-in!');
              window.location.reload();
            }
          });
        }).catch((error) => {
          alert(error.message);
        });
      }
    });
  }
}

// Display Regular Members
renderRegular = () => {
  regTableLoader.style.display = 'none';
  document.getElementById('no-data-div').style.display = 'none';
  let tbody = document.getElementById('tbody');
  tbody.innerHTML = ``;
  let regs = members.filter(mem => mem.data.memberType == 'Regular');

  if(regs.length > 0) {
    regs.forEach((reg) => {
      let tr = document.createElement('tr');
      tr.setAttribute('data-id', reg.id);
      tr.innerHTML = 
        `<td>${reg.data.fname}</td>
        <td>${reg.data.lname}</td>
        <td>
          <span class="hidden" id="${reg.id}-span"></span>
          <a>
            <small id='${reg.id}-small' onclick='showID("${reg.id}")'>
              <i data-toggle="tooltip" data-placement="top" title="Show ${reg.data.fname}"  class="fas fa-eye"></i>
            </small>
          </a>
        </td>
        <td>${reg.data.status}</td>
        <td>
          <a class='btn-link text-darkgrey' data-toggle='modal' data-target='#view-member-modal' onclick='viewMember(this.parentNode.parentNode)'><i class="fas fa-eye mx-1" style='font-size: 20px'></i></a>
          <a class='btn-link text-orange' data-toggle='modal' data-target='#updateModal' onclick='updateMember(this.parentNode.parentNode)'><i class="fas fa-pen mx-1" style='font-size: 20px' data-toggle="tooltip" title="Update ${reg.data.fname}" data-placement="top"></i></a>
        <a class='btn-link text-success' data-toggle='modal' data-target='#payment-modal' onclick='addPayment(this.parentNode.parentNode)'><i class='fas fa-money-bill-alt mx-1' style='font-size: 20px'></i></a>  
        </td>`;

      tbody.appendChild(tr);
    });
  } else {
    document.getElementById('no-data-div').style.display = 'flex';
  }
}

renderNewRegs = (docs) => {
  let tbody = document.getElementById('tbody');
  tbody.innerHTML = ``;

  if(docs.length > 0) {
    docs.forEach((doc) => {
      let tr = document.createElement('tr');
      tr.setAttribute('data-id', doc.id);

      tr.innerHTML = 
        `<td>${doc.data.fname}</td>
        <td>${doc.data.lname}</td>
        <td>
          <span class="hidden" id="${doc.id}-span"></span>
          <a>
            <small id='${doc.id}-small' onclick='showID("${doc.id}")'>
              <i data-toggle="tooltip" data-placement="top" title="Show ${doc.data.fname}"  class="fas fa-eye"></i>
            </small>
          </a>  
        </td>
        <td>${doc.data.status}</td>
        <td>
          <a class='btn-link text-darkgrey' data-toggle='modal' data-target='#view-member-modal' onclick='viewMember(this.parentNode.parentNode)'><i class="fas fa-eye mx-1" style='font-size: 20px'></i></a>
          <a class='btn-link text-orange' onclick='updateMember(this.parentNode.parentNode)'><i class="fas fa-pen mx-1" style='font-size: 20px' data-toggle="tooltip" title="Update ${doc.data.fname}" data-placement="top"></i></a>
          <a class='btn-link text-success' data-toggle='modal' data-target='#payment-modal' onclick='addPayment(this.parentNode.parentNode)'><i class='fas fa-money-bill-alt mx-1' style='font-size: 20px'></i></a>  
        </td>`;

      tbody.appendChild(tr);
    });
  } else {
    document.getElementById('no-data-div').style.display = 'flex';
  }
}

filterRegs = (value) => {
  document.getElementById('no-data-div').style.display = 'none';
  return results = members.filter(member => member.fullName.toLowerCase().includes(value.toLowerCase()) && member.data.memberType == 'Regular');
}

// Searching Regular Members
let searchReg = document.getElementById('search-member');
searchReg.onkeyup = () => {
  if(searchReg.value != '') {
    let docs = filterRegs(searchReg.value);
    renderNewRegs(docs);
  } else {
    renderRegular();
  }
}
searchReg.value.onchange = () => {
  if(searchReg.value == '') {
    renderRegular();
  }
}

renderNewWalks = (docs) => {
  let tbody = document.getElementById('tbody-walk-in');
  tbody.innerHTML = ``;

  if(docs.length > 0) {
    docs.forEach((doc) => {
      let tr = document.createElement('tr');
      tr.setAttribute('data-id', doc.id);

      tr.innerHTML = 
        `<td>${doc.data.fname}</td>
        <td>${doc.data.lname}</td>
        <td>
          <a class='btn-link text-darkgrey' data-toggle='modal' data-target='#view-member-modal' onclick='viewMember(this.parentNode.parentNode)'><i class="fas fa-eye mx-1" style='font-size: 20px'></i></a>
          <a class='btn-link text-orange' onclick='updateMember(this.parentNode.parentNode)'><i class="fas fa-pen mx-1" style='font-size: 20px' data-toggle="tooltip" title="Update ${doc.data.fname}" data-placement="top"></i></a>
          <a class='btn-link text-success' data-toggle='modal' data-target='#payment-modal' onclick='addPayment(this.parentNode.parentNode)'><i class='fas fa-money-bill-alt mx-1' style='font-size: 20px'></i></a>  
        </td>`;

      tbody.appendChild(tr);
    });
  } else {
    document.getElementById('no-data-div-walkin').style.display = 'flex';
  }
}

filterWalks = (value) => {
  document.getElementById('no-data-div-walkin').style.display = 'none';
  return results = members.filter(member => member.fullName.toLowerCase().includes(value.toLowerCase()) && member.data.memberType == 'Walk-in');
}

// Searching Walk-in Members
let searchWalk = document.getElementById('search-walkin');
searchWalk.onkeyup = () => {
  if(searchWalk.value != '') {
    let docs = filterWalks(searchWalk.value);
    renderNewWalks(docs);
  } else {
    renderWalkin();
  }
}

// Display Walkin Members
renderWalkin = () => {
  walkTableLoader.style.display = 'none';
  document.getElementById('no-data-div-walkin').style.display = 'none';
  let tbody = document.getElementById('tbody-walk-in');
  tbody.innerHTML = ``;
  let walks = members.filter(mem => mem.data.memberType == 'Walk-in');

  if(walks.length > 0) {
    walks.forEach((walk) => {
      let tr = document.createElement('tr');
      tr.setAttribute('data-id', walk.id);
      tr.innerHTML = 
        `<td>${walk.data.fname}</td>
        <td>${walk.data.lname}</td>
        <td>
          <a class='btn-link text-darkgrey' data-toggle='modal' data-target='#view-member-modal' onclick='viewMember(this.parentNode.parentNode)'><i class="fas fa-eye mx-1" style='font-size: 20px'></i></a>
          <a class='btn-link text-orange' data-toggle='modal' data-target='#updateModal' onclick='updateMember(this.parentNode.parentNode)'><i class="fas fa-pen mx-1" style='font-size: 20px' data-toggle="tooltip" title="Update ${walk.data.fname}" data-placement="top"></i></a>
          <a class='btn-link text-success' data-toggle='modal' data-target='#payment-modal' onclick='addPayment(this.parentNode.parentNode)'><i class='fas fa-money-bill-alt mx-1' style='font-size: 20px'></i></a>  
        </td>`;

      tbody.appendChild(tr);
    });
  } else {
    document.getElementById('no-data-div-walkin').style.display = 'flex';
  }
}

// View Member Modal
viewMember = (tr) => {
  let id = tr.getAttribute('data-id');
 
  let res = members.filter(m => m.id == id);
  let doc = res[0];
  let data = doc.data;

  let name = document.getElementById('view-name');
  let email = document.getElementById('view-email');
  let phone = document.getElementById('view-phone');
  let sex = document.getElementById('view-sex');
  let memberType = document.getElementById('view-memberType');
  let annualStart = document.getElementById('view-annualStart');
  let monthlyStart = document.getElementById('view-monthlyStart');
  let monthlyEnd = document.getElementById('view-monthlyEnd');
  let rate = document.getElementById('view-monthlyRate');
  let status = document.getElementById('view-status');
  let program = document.getElementById('view-program');
  let address = document.getElementById('view-address');
  let uid = document.getElementById('view-uid');

  document.getElementById('view-member-name').textContent = data.fname;
  uid.value = doc.id;
  uid.setAttribute('data-id', doc.id);
  name.value = doc.fullName;
  email.value = data.email;
  phone.value = data.phone;
  sex.value = data.sex;
  memberType.value = data.memberType;

  if(data.memberType == 'Walk-in') {
    document.getElementById('flexLa').style.display = 'none';
    status.value = 'N/A';
    program.value = 'N/A';
    rate.value = '50';

    monthlyStart.parentNode.style.display = 'none';
    annualStart.parentNode.style.display = 'none';
    monthlyEnd.parentNode.style.display = 'none';
  } else {
    let ms = data.monthlyStart.toDate();
    let me = data.monthlyEnd.toDate();
    let as = data.annualStart.toDate();

    document.getElementById('flexLa').style.display = 'flex';
    monthlyStart.value = `${months[ms.getMonth()]} ${ms.getDate()}, ${ms.getFullYear()}`;
    annualStart.value = `${months[as.getMonth()]} ${as.getDate()}, ${as.getFullYear()}`;
    monthlyEnd.value = `${months[me.getMonth()]} ${me.getDate()}, ${me.getFullYear()}`;
    status.value = data.status;
    program.value = data.program;
    rate.value = data.monthlyRate;

    monthlyStart.parentNode.style.display = 'block';
    annualStart.parentNode.style.display = 'block';
    monthlyEnd.parentNode.style.display = 'block';
  }
  
  address.value = data.address;
  qrcode.makeCode(id);
}

// Update Modal
updateMember = (tr) => {
  let id = tr.getAttribute('data-id');
  
  let get = members.filter(m => m.id == id);
  let doc = get[0];
  let data = doc.data;

  let fname = document.getElementById('updateFname');
  let lname = document.getElementById('updateLname');
  let uid = document.getElementById('updateUID');
  let program = document.getElementById('updateProgram');
  let dateAdded = document.getElementById('updateDateAdded');
  let memberType = document.getElementById('updateType');
  let status = document.getElementById('updateStatus');

  fname.value = data.fname;
  lname.value = data.lname;
  uid.value = id;
  program.value = data.program;
  programs.forEach((p) => {
    let option = document.createElement('option');
    option.innerHTML = p.data.programName;
    option.setAttribute('value', p.data.programName);
    program.appendChild(option);
  });
  dateAdded.value = data.dateAdded;
  memberType.value = data.memberType;
  status.value = data.status;

  let updateBtn = document.getElementById('updateBtn');
  updateBtn.onclick = () => {
    db.collection('members').doc(id).update({
      memberType: memberType.value,
      status: status.value,
      program: program.value
    }).then(() => {
      alert('Successfully updated member!');
      window.location.reload();
    });
  }
}

// Toggling Regular Member UID Visibility
showID = (id) => {
  let span = document.getElementById(`${id}-span`);
  let small = document.getElementById(`${id}-small`);

  if(span.classList.contains('hidden')) {
    small.innerHTML = ' <i class="fas fa-eye-slash"></i>';
    span.textContent = id;
    span.classList.remove('hidden');
  } else {
    small.innerHTML = ' <i  class="fas fa-eye"></i>';
    span.classList.add('hidden');
    span.textContent = '';
  } 
}

//************ PAYMENTS ************//
// Event Listener to #payment-desc in Payment Modal
paymentDescChange = () => {
  let paymentDesc = document.getElementById('payment-desc').value;
  let amount = document.getElementById('payment-amount');

  if(paymentDesc == 'Annual Subscription') {
    amount.removeAttribute('value');
    amount.value = '200';
  } else if(paymentDesc == 'Monthly Subscription') {
    amount.removeAttribute('value');
    amount.value = '750';
  }
}

// Show/Hide Payment Calculator
document.getElementById('showCalc').addEventListener('click', () => {
  let calc = document.getElementById('calculator');
  if(calc.style.display == 'none') {
    calc.style.display = 'block';
    document.getElementById('showCalc').innerHTML = 'Hide Calculator';
  } else {
    calc.style.display = 'none';
    document.getElementById('showCalc').innerHTML = 'Show Calculator';
  }
});

// Calculating Change
document.getElementById('enterCalc').addEventListener('click', () => {
  let cash = document.getElementById('payment-cash');
  let change = document.getElementById('payment-change');
  let amount = document.getElementById('payment-amount');

  let x = parseInt(cash.value);
  let y = parseInt(amount.value);

  change.value = x-y;
});

 // Add payment
 addPayment = (tr) => {
  let id = tr.getAttribute('data-id');
  let uid = document.getElementById('payment-uid');
  uid.value = id;
  let name = document.getElementById('payment-name');
  let span = document.getElementById('payment-fname-span');

  let res = members.filter(m => m.id == id);
  let mem = res[0];
  let data = mem.data;

  span.textContent = data.fname;
  name.value = mem.fullName;

  let select = document.getElementById('payment-desc');
  let amount = document.getElementById('payment-amount');
  
  if(data.memberType == 'Walk-in') {
    select.innerHTML = '<option value="Walk-in Fee">Walk-in</option>';
    select.setAttribute('disabled', 'disabled');
    amount.removeAttribute('value');
    amount.value = 50;
  } else {
    select.innerHTML = 
      `<option value="Monthly Subscription">Monthly Subscription</option>
      <option value="Annual Subscription">Annual Subscription</option>`;
    select.removeAttribute('disabled');
      amount.value = 750;
  }

  document.getElementById('add-payment-btn').addEventListener('click', () => {
    let amount = document.getElementById('payment-amount').value;
    let paymentDesc = document.getElementById('payment-desc').value;

    let date = new Date();
    
    addZero = (i) => {
      if (i < 10) {
        i = "0" + i;
      }

      return i;
    }

    let name = document.getElementById('payment-name').value;

    db.collection('payments').add({
      memberId: id,
      amount: amount,
      memberName: name,
      paymentDesc: paymentDesc,
      dateOfPayment: firebase.firestore.Timestamp.fromDate(new Date())
    }).then(() => {
      db.collection('members').doc(id).update({
        status: 'Paid'
      });
    }).then(() => {
      alert('Successfully added payment!');
      window.location.reload();
    });
  });
}

//  PROGRAM Functions 
const programs = [];

renderPrograms = () => {
  progTableLoader.style.display = 'none';
  let tbody = document.getElementById('program-tbody');

  if(programs.length > 0) {
    programs.forEach((prog) => {
      let tr = document.createElement('tr');
      tr.setAttribute('data-id', prog.id)

      tr.innerHTML = 
        `<td>${prog.data.programName}</td>
        <td>
          <a class='btn-link text-darkgrey' onclick='viewMember(this.parentNode.parentNode)'><i class="fas fa-eye mx-1" style='font-size: 20px' style='color: #DF3A01'></i></a>
          <a class="btn-link text-orange mx-1" onclick='updateMember(this.parentNode.parentNode)'>
            <i class="fas fa-pen" data-toggle="tooltip" data-placement="top" title="Update ${prog.data.programName}" style="font-size: 20px"></i>
          </a>  
        </td>`;

      tbody.appendChild(tr);

      // For Add Member Modal
      let select = document.getElementById('program');
      let option = document.createElement('option');

      option.innerHTML = prog.data.programName;
      option.setAttribute('value', prog.data.programName)
      select.appendChild(option);
    });
  } else {
    document.getElementById('no-data-div-programs').style.display = 'flex';
  }
}

// Firebase Queries 
// ALL Members
db.collection('members').orderBy('dateAdded', 'desc').get().then((snapshot) => {
  snapshot.forEach((doc) => {
    members.push({id: doc.id, data: doc.data(), fullName: `${doc.data().fname} ${doc.data().lname}`})
  });
}).then(() => {
  renderRegular();
  renderWalkin();
});

// ALL Programs
db.collection('programs').get().then((snapshot) => {
  snapshot.forEach((doc) => {
    programs.push({id: doc.id, data: doc.data()});
  })
}).then(() => {
  renderPrograms();
});

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

function securityReports() {
  let password = prompt('security password');
  if(password == '123') {
    window.location.href = "reports.html";
  }
}

function securityLogtrail() {
  let password = prompt('security password');
  if(password == '123') {
    window.location.href = "logtrail.html";
  } 
}