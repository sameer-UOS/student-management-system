let student_data = [];
let editId = null

let student_details = document.getElementById("student-details");
let student_nameInput = document.getElementById("student-name");
let ageInput = document.getElementById("student-age");
let addBtn = document.getElementById("add-btn");
let searchInput = document.getElementById("search");

let sortBtn = document.getElementById("sort-name");
let sortDescBtn = document.getElementById("sort-name-desc");

let sortAgeAsc = document.getElementById("sort-age-asc");
let sortAgeDesc = document.getElementById("sort-age-desc");
let filterCourse = document.getElementById("filter-course");
let exportBtn = document.getElementById("export-btn");
let importFile = document.getElementById("import-file");

const deleteModal = document.getElementById("delete-modal");
const cancelBtn = document.getElementById("cancel-btn");
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
let studentToDelete = null;

addBtn.addEventListener("click",()=>{
    const student_name = student_nameInput.value.trim()
    const age = ageInput.value.trim()

    const course = document.querySelector(`input[name="course"]:checked`)
    if (student_name === "") {
        alert("Enter student name")
        return ;
    }

    if (age === "") {
        alert("Enter age:")
        return ;
    }

    if (course === null) {
        alert("Select a course")
        return ;
    }
    
    if (isNaN(age) || age < 1 || age > 100) {
    alert("Please enter a valid age between 1 and 100")
        return ;
    }
  
    if (editId !== null) {
    
    const i = student_data.findIndex(s => s.id === editId);
    student_data[i] = { id: editId, name: student_name, student_age: age, select_course: course.value };
    showToast("✏️ Student Updated Successfully");
    editId = null;
    addBtn.textContent = "Add Student";
  } else {

    let user_data = {
      id: Date.now(),  
      name: student_name,
      student_age: age,
      select_course: course.value
    };
    student_data.push(user_data);
    showToast("✅ Student Added Successfully");
  }

  localStorage.setItem("student_data",JSON.stringify(student_data))

    renderStudents();
    clearForm();
});

sortBtn.addEventListener("click",()=>{
    student_data.sort((a,b) => a.name.localeCompare(b.name));
    renderStudents();
});

sortDescBtn.addEventListener("click",()=>{
    student_data.sort((a,b) => b.name.localeCompare(a.name));
    renderStudents();
});

sortAgeAsc.addEventListener("click",()=>{
  student_data.sort((a,b) => Number(a.student_age) - Number(b.student_age));
  renderStudents();
});

sortAgeDesc.addEventListener("click",()=>{
  student_data.sort((a,b) => Number(b.student_age) - Number(a.student_age));
  renderStudents();
});

searchInput.addEventListener("input",()=>{
    let searchText = searchInput.value.trim().toLowerCase();

    const filtered = student_data.filter(student=>{
        return student.name.toLowerCase().includes(searchText) || student.select_course.toLowerCase().includes(searchText)
    });

    renderStudents(filtered);
});

filterCourse.addEventListener("change", () => {
    let selectedCourse = filterCourse.value;

    if (selectedCourse === "all") {
        renderStudents();
      } 
    else {
        const filtered = student_data.filter(student => {
            return student.select_course === selectedCourse;
        });

        renderStudents(filtered);
    }
});

exportBtn.addEventListener("click", () => {
  let csv = "Name,Age,Course\n";

  student_data.forEach(student => {
    csv += `${student.name},${student.student_age},${student.select_course}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "students.csv";
  a.click();
  URL.revokeObjectURL(url);
});

importFile.addEventListener("change", () => {
  const file = importFile.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.readAsText(file, "UTF-8");

  reader.onload = function() {
    const csv = reader.result;
    const rows = csv.split("\n");
    rows.shift();

    rows.forEach(row => {
      if (row.trim() === "") return;

        const [name, age, course] = row.split(",");

        student_data.push({
    id: Date.now() + Math.random(),
    name: name,
    student_age: age,
    select_course: course
  });
});

  localStorage.setItem("student_data", JSON.stringify(student_data));
  renderStudents();
};

});

function renderStudents(list = student_data){
  const studentCount = document.getElementById("student-count");

  if (list.length === 0) {
    student_details.innerHTML = `
        <div class="empty-state">
            <h3>📚 No Students Found</h3>
            <p>Click "Add Student" to create your first record.</p>
        </div>
    `;
    studentCount.textContent = `Total Students: 0`;
    return;
  }

    const result = list.map((student)=>{
         return `<div>
              <p>👤 ${student.name} <span class="id-tag">(id: ${student.id})</span></p>
              <p>🎂 Age: ${student.student_age}</p>
              <p>📚 Course: ${student.select_course}</p>
              
              <div class="actions"><button class="edit-btn" onclick="editStudent(${student.id})">✏ Edit</button>
              <button class="delete-btn" onclick="deleteStudent(${student.id})">🗑 Delete</button></div>
            </div>`;
  }).join("");

    student_details.innerHTML = result;
    studentCount.textContent = `Total Students: ${list.length}`
}

function editStudent(id) {
  const student = student_data.find(s => s.id === id); 
  if (!student) return;
 
  student_nameInput.value = student.name;
  ageInput.value = student.student_age;
 
  const matchedRadio = document.querySelector(`input[name="course"][value="${student.select_course}"]`);
  if (matchedRadio){
     matchedRadio.checked = true;
  }
 
  editId = id;
  addBtn.textContent = "Update Student";
  student_nameInput.focus();
}

cancelBtn.addEventListener("click",()=> {
    deleteModal.style.display = "none";
});

confirmDeleteBtn.addEventListener("click",()=> {

    student_data = student_data.filter(s => s.id !== studentToDelete);

    if (editId === studentToDelete) {
        editId = null;
        addBtn.textContent = "Add Student";
    }

    clearForm();

    localStorage.setItem("student_data", JSON.stringify(student_data));

    renderStudents();

    showToast("🗑 Student Deleted Successfully");

    deleteModal.style.display = "none";

    studentToDelete = null;

});

function deleteStudent(id){
    studentToDelete = id;
    deleteModal.style.display = "flex";
    return;

}

function showToast(message){
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.opacity = "1";

  setTimeout(function () {
    toast.style.opacity = "0";
  }, 3000);

}

function clearForm(){
    student_nameInput.value = "";
    ageInput.value = "";
    const matchedRadio = document.querySelector('input[name="course"]:checked');

  if (matchedRadio){
     matchedRadio.checked = false;
    }

    student_nameInput.focus();
}

function loadData(){
    let saved = localStorage.getItem("student_data");

    if(saved){
        student_data = JSON.parse(saved)
        renderStudents();
    }
}

loadData();