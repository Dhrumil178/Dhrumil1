// Sample JSON data
const students = [
  {"id":1, "name":"Patel Mantra", "age":18, "course":"CSE"},
  {"id":2, "name":"Patel Manav", "age":19, "course":"CSE"},
  {"id":3, "name":"Patel Srujal", "age":17, "course":"CSE"},
  {"id":4, "name":"Patel Prince", "age":18, "course":"CSE"},
  {"id":5, "name":"Rathod Neev", "age":19, "course":"CSE"}
];

const events = [
  {"id":1, "title":"Tech Fest", "date":"2025-10-05"},
  {"id":2, "title":"Sports Day", "date":"2025-11-12"},
  {"id":3, "title":"Cultural Fest", "date":"2025-12-01"}
];

// Pagination
let currentPage = 1;
const rowsPerPage = 2;

// Render student table
function renderStudents(page){
  const tbody = document.querySelector("#studentTable tbody");
  tbody.innerHTML = "";
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedStudents = students.slice(start, end);

  paginatedStudents.forEach(s => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.age}</td>
      <td>${s.course}</td>
    `;
    tbody.appendChild(row);
  });
}

// Render events
function renderEvents(){
  const eventList = document.getElementById("eventList");
  eventList.innerHTML = "";
  events.forEach(e => {
    const li = document.createElement("li");
    li.textContent = `${e.title} - ${e.date}`;
    eventList.appendChild(li);
  });
}

// Pagination buttons
document.getElementById("prevBtn").addEventListener("click", () => {
  if(currentPage > 1){
    currentPage--;
    renderStudents(currentPage);
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  if(currentPage < Math.ceil(students.length / rowsPerPage)){
    currentPage++;
    renderStudents(currentPage);
  }
});

// Initial render
renderStudents(currentPage);
renderEvents();
