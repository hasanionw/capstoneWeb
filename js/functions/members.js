auth.onAuthStateChanged((user) => {
  if(user) {
    document.getElementById('username').innerText = user.email;
  } else {
    window.location.href = 'index.html';
  }
});


// Global Variables
const members = [];
let valid = true;
const qrcode = new QRCode("view-qrcode", {
  height: 90,
  width: 90
});
const waitModal = document.getElementById('waitModal');

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
  valid = checkValidityAll();
  if(valid == true) {
    waitModal.click();
    let fname = document.getElementById('fName').value;
    let lname = document.getElementById('lName').value;
    let email = document.getElementById('email').value;
    let memberType = document.getElementById('memberType').value;
    let sex = document.getElementById('sex').value;
    let phone = document.getElementById('phone').value;
    let address = document.getElementById('address').value;
    let program = document.getElementById('program').value;
    let birthdate = document.getElementById('birthdate').value;
    let monthlyRate;

    if(memberType == 'Regular') {
      monthlyRate = 750;
    } else {
      monthlyRate = null;
    }

    let date = new Date();
    let annualStart = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    let monthlyStart = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

    let members = db.collection('members');
    let member = members.where('fname', '==', fname).where('lname', '==', lname).where('email', '==', email);

    member.get().then((snapshot) => {
      if(snapshot.docs.length > 0) {
        alert('ERROR: Member already exists!');
      } else {
        members.add({
          fname: fname,
          lname: lname,
          memberType: memberType,
          status: 'Unpaid',
          sex: sex,
          dateAdded: firebase.firestore.Timestamp.fromDate(new Date()),
          phone: phone,
          monthlyRate: monthlyRate,
          annualStart: null,
          annualEnd: null,
          monthlyStart: null,
          monthlyEnd: null,
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
                waitModal.click();
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
              waitModal.click();
              alert('Successfully added new walk-in!');
              window.location.reload();
            }
          });
        }).catch((error) => {
          waitModal.click();
          alert(error.message);
        });
      }
    });
  }
}

// Display Regular Members
renderRegular = (list) => {
  regTableLoader.style.display = 'none';
  document.getElementById('no-data-div').style.display = 'none';
  let tbody = document.getElementById('tbody');
  tbody.innerHTML = ``;

  if(list.length > 0) {
    list.forEach((reg) => {
      let tr = document.createElement('tr');
      tr.setAttribute('data-id', reg.id);
      tr.innerHTML = 
        `<td>${reg.data.lname}</td>
        <td>${reg.data.fname}</td>
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
          <a class='btn-link text-red' onclick='deleteMember(this.parentNode.parentNode)'><i class='fas fa-trash-alt mx-1' style='font-size: 20px'></i></a>  
        </td>`;
  
      tbody.appendChild(tr);
    });
  } else {
    document.getElementById('no-data-div').style.display = 'flex';
  }
}

// DELETE MEMBER FUNCTION
deleteMember = (tr) => {
  let x = confirm('Are you sure you want to delete?');
  
  if(x === true) {
    let id = tr.getAttribute('data-id');
    waitModal.click();
    
    db.collection('members').doc(id).update({
      isDeleted: true,
      dateDeleted: new Date()
    })
    .then(() => {
      waitModal.click();
      $("#wait").on("hidden.bs.modal", () => {
        alert("Successfully deleted member!");
        window.location.reload();
      });
    });
  }
}

// end of delete

buildNewTable = (val) => {
  let res = members.filter(m => m.fullName.toLowerCase().includes(val.toLowerCase()) && m.data.memberType == 'Regular');
  let state = {
    page: 1,
    rows: 5
  }

  let data = pagination(res, state.page, state.rows);
  let list = data.querySet;
  let pagi_no = data.pages;  
  let pageSpan = document.getElementById('page');

  if(data.pages > 0) {
    pageSpan.innerText = `Page: ${state.page} of ${data.pages}`;
  } else {
    pageSpan.innerText = `Page: 0 of 0`;
  }

  putPagination(pagi_no);
  renderRegular(list);
}

// Searching Regular Members
let searchReg = document.getElementById('search-member');
searchReg.onkeyup = () => {
  if(searchReg.value != '') {
    buildNewTable(searchReg.value);
  } else {
    buildTable();
  }
}

buildNewWalkTable = (val) => {
  let res = members.filter(m => m.fullName.toLowerCase().includes(val.toLowerCase()) && m.data.memberType == 'Walk-in');
  let state = {
    page: 1,
    rows: 3
  }

  let data = pagination(res, state.page, state.rows);
  let list = data.querySet;
  let pagi_no = data.pages;  
  let pageSpan = document.getElementById('walk-page');

  if(data.pages > 0) {
    pageSpan.innerText = `Page: ${state.page} of ${data.pages}`;
  } else {
    pageSpan.innerText = `Page: 0 of 0`;
  }

  putWalkPagination(pagi_no);
  renderWalkin(list);
}

// Searching Walk-in Members
let searchWalk = document.getElementById('search-walkin');
searchWalk.onkeyup = () => {
  if(searchWalk.value != '') {
    buildNewWalkTable(searchWalk.value);
  } else {
    buildWalkTable();
  }
}

// Display Walkin Members
renderWalkin = (walks) => {
  walkTableLoader.style.display = 'none';
  document.getElementById('no-data-div-walkin').style.display = 'none';
  let tbody = document.getElementById('tbody-walk-in');
  tbody.innerHTML = ``;

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
          <a class='btn-link text-red' onclick='deleteMember(this.parentNode.parentNode)'><i class='fas fa-trash-alt mx-1' style='font-size: 20px'></i></a>  
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
  let dateAdded = document.getElementById('view-dateAdded');

  memsince = new Date(data.dateAdded.toDate());

  document.getElementById('view-member-name').textContent = data.fname;
  uid.value = doc.id;
  uid.setAttribute('data-id', doc.id);
  name.value = doc.fullName;
  email.value = data.email;
  phone.value = data.phone;
  sex.value = data.sex;
  memberType.value = data.memberType;
  dateAdded.value = `${months[memsince.getMonth()]} ${memsince.getDate()}, ${memsince.getFullYear()}`;

  if(data.memberType == 'Walk-in') {
    document.getElementById('flexLa').style.display = 'none';
    status.value = 'N/A';
    program.value = 'N/A';
    rate.value = '50';

    monthlyStart.parentNode.style.display = 'none';
    annualStart.parentNode.style.display = 'none';
    monthlyEnd.parentNode.style.display = 'none';
  } else if(data.annualStart == null || data.monthlyStart == null || data.monthlyEnd == null) {
    monthlyStart.value = "N/A";
    annualStart.value = "N/A";
    monthlyEnd.value = "N/A";

    rate.value = data.monthlyRate;
    status.value = data.status;
    program.value = data.program;
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

  let d = data.dateAdded.toDate();

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
  dateAdded.value = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  memberType.value = data.memberType;
  status.value = data.status;

  let updateBtn = document.getElementById('updateBtn');
  updateBtn.onclick = () => {
    waitModal.click();
    db.collection('members').doc(id).update({
      memberType: memberType.value,
      status: status.value,
      program: program.value
    }).then(() => {
      waitModal.click();
      document.getElementById('close-updateModal').click();
      $("#updateModal").on('hidden.bs.modal', () => {
        alert('Successfully updated member!');
        window.location.reload();
      });
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

// PAGINATION
let state = {
  page: 1,
  rows: 5,
  wpage: 1,
  wrows: 3
}

pagination = (querySet, page, rows) => {
  let trimStart = (page - 1) * rows;
  let trimEnd = trimStart + rows;

  let trimmedData = querySet.slice(trimStart, trimEnd);

  let pages = Math.ceil(querySet.length / rows)

  return {
    querySet: trimmedData,
    pages: pages
  }
}

buildTable = () => {
  let val = document.getElementById('search-member').value;
  let regs = members.filter(m => m.data.memberType == 'Regular' && m.fullName.toLowerCase().includes(val.toLowerCase()) && m.data.isDeleted != true);
  let data = pagination(regs, state.page, state.rows);
  let list = data.querySet;
  let pagi_no = data.pages;  
  let pageSpan = document.getElementById('page');

  if(data.pages > 0) {
    pageSpan.innerText = `Page: ${state.page} of ${data.pages}`;
  } else {
    pageSpan.innerText = `Page: 0 of 0`;
  }

  putPagination(pagi_no);
  renderRegular(list);
}

buildWalkTable = () => {
  let val = document.getElementById('search-walkin').value;
  let walks = members.filter(m => m.data.memberType == 'Walk-in' && m.fullName.toLowerCase().includes(val.toLowerCase()) && m.data.isDeleted != true);
  let walkData = pagination(walks, state.wpage, state.wrows);
  let walklist = walkData.querySet;
  let wpagi_no = walkData.pages;
  let walkPageSpan = document.getElementById('walk-page');

  walkPageSpan.innerText = `Page: ${state.wpage} of ${walkData.pages}`;

  putWalkPagination(wpagi_no);
  renderWalkin(walklist);
}

putPagination = (no) => {
  let pagination = document.getElementById('pagination');
  pagination.innerHTML = ``;
  for(let i = 1; i <= no; i++) {
    let li = document.createElement('li');
    li.classList.add('page-item');
    li.innerHTML = `<a class="page-link" onclick="changeTablePage(this)" data-id="${i}">${i}</a>`;
    pagination.appendChild(li);
  }
}

putWalkPagination = (no) => {
  let pagination = document.getElementById('walk-pagination');
  pagination.innerHTML = ``;
  for(let i = 1; i <= no; i++) {
    let li = document.createElement('li');
    li.classList.add('page-item');
    li.innerHTML = `<a class="page-link" onclick="changeWalkTablePage(this)" data-id="${i}">${i}</a>`;
    pagination.appendChild(li);
  }
}

changeTablePage = (li) => {
  let page = li.getAttribute('data-id');
  let pageSpan = document.getElementById('page');

  state.page = page;
  pageSpan.innerHTML = `Page: ${page}`;
  buildTable();
}

changeWalkTablePage = (li) => {
  let page = li.getAttribute('data-id');
  let pageSpan = document.getElementById('walk-page');

  state.wpage = page;
  pageSpan.innerHTML = `Page: ${page}`;
  buildWalkTable();
}

// Render deleted members
renderDel = () => {
  let del = members.filter(m => m.data.isDeleted === true);
  
  if(del.length > 0) {
    document.getElementById('no-data-div-deleted').style.display = 'none';
    let delTbody = document.getElementById('view-deleted-tbody');
    delTbody.innerHTML = ``;
    del.forEach((doc) => {
      let tr = document.createElement('tr');
      tr.setAttribute('data-id', doc.id);

      let add = new Date(doc.data.dateAdded.toDate());
      let del = new Date(doc.data.dateDeleted.toDate());

      tr.innerHTML = 
        `<td>${doc.fullName}</td>
        <td>${months[add.getMonth()]} ${add.getDate()}, ${add.getFullYear()}</td>
        <td>${months[del.getMonth()]} ${del.getDate()}, ${del.getFullYear()}</td>
        <td>
          <a onclick="recover(this.parentNode.parentNode)">
            <i class="fas fa-redo-alt text-success"></i>
          </a>
        </td>`;

      delTbody.appendChild(tr);
    });
  } else {
    document.getElementById('no-data-div-deleted').style.display = 'flex';
  }
}

recover = (tr) => {
  let x = confirm("Are you sure you want to recover?");

  if(x === true) {
    waitModal.click();
    let id = tr.getAttribute('data-id');

    db.collection('members').doc(id).update({
      isDeleted: false
    })
    .then(() => {
      waitModal.click();
      $("#wait").on("hidden.bs.modal", () => {
        $("#viewDeleted").click();
        $("#view-deleted").on("hidden.bs.modal", () => {
          alert('Successfully recovered member!');
          window.location.reload();
        });
      });
    });
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
  
  let val = parseInt(cash.value);

  if(Number.isInteger(val) == true) {
    if(val <= 0 || val >= 9999) {
      alert('Please enter a valid amount!');
    } else if(val < parseInt(amount.value)) {
      alert('Insufficient cash!');
    } else {
      let x = val;
      let y = parseInt(amount.value);

      change.value = `₱${x-y}.00`;
    }
  } else {
    console.log(val)
    alert('Please enter an appropriate amount!');
  }
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
    waitModal.click();
    let amount = document.getElementById('payment-amount').value;
    let paymentDesc = document.getElementById('payment-desc').value;
    
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
      waitModal.click();
      $("#close-paymentModal").click();
      $("#payment-modal").on("hidden.bs.modal", () => {
        alert('Successfully added payment!');
        window.location.reload();
      });
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
db.collection('members').orderBy('lname', 'asc').get().then((snapshot) => {
  snapshot.forEach((doc) => {
    members.push({id: doc.id, data: doc.data(), fullName: `${doc.data().fname} ${doc.data().lname}`})
  });
}).then(() => {
  buildTable();
  buildWalkTable();
  renderDel();
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

// VALIDATION

checkIfValid = (e) => {
  let empty = document.getElementById(`${e.id}-empty`);
  if(e.id != 'address') {
    let invalid = document.getElementById(`${e.id}-invalid`);

    if(e.value == '') {
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
    }

    if(parseInt(e.value) || e.value.match(/\d+/) != null) {
      invalid.style.display = 'block';
    } else {
      invalid.style.display = 'none';
    }
  } else {
    if(e.value == '') {
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
    }
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
    } else if(e.value.length != 11) {
      length.style.display = 'block';
      valid = false;
    } else {
      length.style.display = 'none';
    }
  }
}

validateEmail = (email) => {
  let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

checkEmail = (e) => {
  let empty = document.getElementById(`${e.id}-empty`);
  let invalid = document.getElementById(`${e.id}-invalid`);

  if(e.value == '') {
    empty.style.display = 'block';
    invalid.style.display = 'none';
  } else {
    empty.style.display = 'none';

    if(!validateEmail(e.value)) {
      invalid.style.display = 'block';
    } else {
      invalid.style.display = 'none';
    }
  }
}

checkDate = (e) => {
  let invalid = document.getElementById(`${e.id}-invalid`);
  let underage = document.getElementById(`${e.id}-underage`)
  if(e.value == '') {
    invalid.style.display = 'block';
    underage.style.display = 'none';
  } else {
    let date = new Date(e.value);
    if(date.getFullYear() >= new Date().getFullYear()) {
      invalid.style.display = 'block';
      underage.style.display = 'none';
    } else {
      if(date.getFullYear() > new Date().getFullYear() - 12) {
        invalid.style.display = 'none';
        underage.style.display = 'block';
      } else if(date.getFullYear() < new Date('1920-01-01').getFullYear()) {
        invalid.style.display = 'block';
        underage.style.display = 'none';
      } else {
        invalid.style.display = 'none';
        underage.style.display = 'none';
      }
    }
  }
}

checkValidityAll = () => {
  // fname
  let fname = document.getElementById('fName');
  let fnameValid;
  if(fname.value == '') {
    document.getElementById(`fName-empty`).style.display = 'block';
    fnameValid = false;
  } else {
    document.getElementById(`fName-empty`).style.display = 'none';
    if(parseInt(fname.value) || fname.value.match(/\d+/) != null) {
      document.getElementById(`fName-invalid`).style.display = 'block';
      fnameValid = false;
    } else {
      document.getElementById(`fName-invalid`).style.display = 'none';
      fnameValid = true;
    }
  }

  // lname
  let lname = document.getElementById('lName');
  let lnameValid;
  if(lname.value == '') {
    document.getElementById(`lName-empty`).style.display = 'block';
    lnameValid = false;
  } else {
    document.getElementById(`lName-empty`).style.display = 'none';
    if(parseInt(lname.value) || lname.value.match(/\d+/) != null) {
      document.getElementById(`lName-invalid`).style.display = 'block';
      lnameValid = false;
    } else {
      document.getElementById(`lName-invalid`).style.display = 'none';
      lnameValid = true;
    }
  }

  // birthdate
  let birthdate = document.getElementById('birthdate');
  let invalid = document.getElementById(`birthdate-invalid`);
  let underage = document.getElementById(`birthdate-underage`);
  let birthdateValid;
  if(birthdate.value == '') {
    invalid.style.display = 'block';
    underage.style.display = 'none';
    birthdateValid = false;
  } else {
    let date = new Date(birthdate.value);
    if(date.getFullYear() >= new Date().getFullYear()) {
      invalid.style.display = 'block';
      underage.style.display = 'none';
      birthdateValid = false;
    } else {
      if(date.getFullYear() > new Date().getFullYear() - 12) {
        invalid.style.display = 'none';
        underage.style.display = 'block';
        birthdateValid = false;
      } else if(date.getFullYear() < new Date('1920-01-01').getFullYear()) {
        invalid.style.display = 'block';
        underage.style.display = 'none';
        birthdateValid = false;
      } else {
        invalid.style.display = 'none';
        underage.style.display = 'none';
        birthdateValid = true;
      }
    }
  }

  // email
  let email = document.getElementById('email');
  let emptyEmail = document.getElementById(`email-empty`);
  let invalidEmail = document.getElementById(`email-invalid`);
  let emailValid;
  if(email.value == '') {
    emptyEmail.style.display = 'block';
    invalidEmail.style.display = 'none';
    emailValid = false;
  } else {
    emptyEmail.style.display = 'none';

    if(!validateEmail(email.value)) {
      invalidEmail.style.display = 'block';
      emailValid = false;
    } else {
      invalidEmail.style.display = 'none';
      emailValid = true;
    }
  }

  // address
  let address = document.getElementById('address');
  let addressEmpty = document.getElementById('address-empty');
  let addressValid;
  if(address.value == '') {
    addressEmpty.style.display = 'block';
    addressValid = false;
  } else {
    addressEmpty.style.display = 'none';
    addressValid = true;
  }

  // phone
  let phone = document.getElementById('phone');
  let phoneEmpty = document.getElementById(`phone-empty`);
  let phoneInvalid = document.getElementById(`phone-invalid`);
  let length = document.getElementById(`phone-length`);
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
      } else if(phone.value.length != 11) {
        length.style.display = 'block';
        phoneValid = false;
      } else {
        length.style.display = 'none';
        phoneValid = true;
      }
    }
  }

  if(fnameValid == true 
    && lnameValid == true
    && birthdateValid == true
    && emailValid == true
    && addressValid == true
    && phoneValid == true) {
    return true;
  }
}