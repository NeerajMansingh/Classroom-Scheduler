import { createSessionFromJson } from './backend.js';

// Global session object
let currentSession = null;
let jsonData = null;
let currentDraggedCourseId = null;

// DOM Elements
const jsonFileInput = document.getElementById("json-file");
const loadJsonButton = document.getElementById("load-json");
const jsonPreview = document.getElementById("json-preview");
const jsonPreviewContainer = document.getElementById("json-preview-container");
const createSessionButton = document.getElementById("create-session");
const sessionInfo = document.getElementById("session-info");
const availableCourses = document.getElementById("available-courses");
const timetableBody = document.getElementById("timetable-body");
const scheduledCourses = document.getElementById("scheduled-courses");
const generateTimetableButton = document.getElementById("generate-timetable");
const finalTimetable = document.getElementById("final-timetable");
const statusMessage = document.getElementById("status-message");
const browseFilesBtn = document.getElementById("browse-files");
const dropArea = document.getElementById("drop-area");
const downloadTimetableBtn = document.getElementById("download-timetable");

// Sections
const uploadSection = document.getElementById("upload-section");
const sessionSection = document.getElementById("session-section");
const schedulingSection = document.getElementById("scheduling-section");
const classroomSection = document.getElementById("classroom-section");
const resultSection = document.getElementById("result-section");
const navItems = document.querySelectorAll(".nav-item");

// Navigation
navItems.forEach((item) => {
  item.addEventListener("click", function () {
    if (this.hasAttribute("disabled")) return;

    navItems.forEach((nav) => nav.classList.remove("active"));
    this.classList.add("active");

    const sectionId = this.getAttribute("data-section");
    document.querySelectorAll("section").forEach((section) => {
      section.classList.add("hidden");
    });
    document.getElementById(sectionId).classList.remove("hidden");
  });
});

// File upload handlers
browseFilesBtn.addEventListener("click", () => jsonFileInput.click());

dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("dragging");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("dragging");
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("dragging");

  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

jsonFileInput.addEventListener("change", () => {
  const file = jsonFileInput.files[0];
  if (file) handleFile(file);
});

function handleFile(file) {
  if (file.type !== "application/json") {
    showMessage("Please select a JSON file", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      jsonData = JSON.parse(e.target.result);
      jsonPreview.textContent = JSON.stringify(jsonData, null, 2);
      jsonPreviewContainer.style.display = "block";
      showMessage("JSON file loaded successfully", "success");
    } catch (error) {
      showMessage(`Error parsing JSON: ${error.message}`, "error");
    }
  };
  reader.readAsText(file);
}

// Event Listeners
loadJsonButton.addEventListener("click", handleJsonLoad);
createSessionButton.addEventListener("click", createSession);
generateTimetableButton.addEventListener("click", generateFinalTimetable);
downloadTimetableBtn.addEventListener("click", downloadTimetableAsJson);

function handleJsonLoad() {
  if (!jsonData) {
    showMessage("No JSON data loaded", "error");
    return;
  }

  document.querySelector('[data-section="session-section"]').removeAttribute("disabled");
  document.querySelector('[data-section="session-section"]').click();
  showMessage("JSON data loaded successfully", "success");
}

function createSession() {
  try {
    currentSession = createSessionFromJson(jsonData);
    displaySessionInfo();
    navItems.forEach((item) => item.removeAttribute("disabled"));
    document.querySelector('[data-section="scheduling-section"]').click();
    createTimetableStructure();
    populateAvailableCourses();
    showMessage("Session created successfully", "success");
  } catch (error) {
    showMessage(`Error creating session: ${error.message}`, "error");
  }
}

function displaySessionInfo() {
  let html = `<div class="session-card"><h3>${currentSession.name} (ID: ${currentSession.id})</h3><div class="programs">`;

  currentSession.programs.forEach((program) => {
    html += `<div><strong>${program.name}</strong> (${program.id})</div>`;
    program.departments.forEach((dept) => {
      html += `<div style="margin-left: 20px">
        <strong>Department:</strong> ${dept.name} (${dept.id})
        <ul>
          <li>Courses: ${dept.courses.length}</li>
          <li>Students: ${dept.students.length}</li>
          <li>Instructors: ${dept.instructors.length}</li>
          <li>Classrooms: ${dept.classrooms.length}</li>
        </ul>
      </div>`;
    });
  });

  html += "</div></div>";
  sessionInfo.innerHTML = html;
}

function createTimetableStructure() {
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  let html = "";

  hours.forEach((hour) => {
    const displayHour = hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? "PM" : "AM";
    html += `<tr><th>${displayHour}:00 ${ampm}</th>`;
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].forEach((day) => {
      html += `<td class="drop-target" data-day="${day}" data-hour="${hour}"></td>`;
    });
    html += `</tr>`;
  });

  timetableBody.innerHTML = html;

  document.querySelectorAll(".drop-target").forEach((cell) => {
    cell.addEventListener("dragover", (e) => e.preventDefault());
    cell.addEventListener("drop", function (e) {
      e.preventDefault();
      const courseId = e.dataTransfer.getData("text");
      clearSlotHighlights();
      handleCourseDrop(courseId, this);
    });
  });
}

function highlightAvailableSlots(courseId) {
  const course = findCourseById(courseId);
  if (!course) return;

  document.querySelectorAll(".drop-target").forEach((cell) => {
    const day = cell.getAttribute("data-day");
    const hour = parseInt(cell.getAttribute("data-hour"));
    const slot = findSlot(day, hour);

    if (slot && course.isSlotAvailable(slot)) {
      cell.classList.add("available");
    } else {
      cell.classList.add("unavailable");
    }
  });
}

function clearSlotHighlights() {
  document.querySelectorAll(".drop-target").forEach((cell) => {
    cell.classList.remove("available", "unavailable");
  });
}

function handleCourseDrop(courseId, dropTarget) {
  const day = dropTarget.getAttribute("data-day");
  const hour = parseInt(dropTarget.getAttribute("data-hour"));
  const course = findCourseById(courseId);
  const slot = findSlot(day, hour);

  if (!course || !slot) {
    showMessage("Invalid course or slot", "error");
    return;
  }

  if (course.assignSlot(slot)) {
    const courseElement = document.createElement("div");
    courseElement.className = "scheduled-course";
    courseElement.setAttribute("data-course-id", course.id);
    courseElement.setAttribute("data-day", day);
    courseElement.setAttribute("data-hour", hour);
    courseElement.innerHTML = `
      <div class="remove-course" title="Remove course">×</div>
      <strong>${course.name}</strong><br>${course.instructor.name}
    `;
    courseElement.querySelector(".remove-course").addEventListener("click", () => {
      removeCourseFromSlot(course, slot, courseElement);
    });
    dropTarget.appendChild(courseElement);
    showMessage(`Course ${course.name} scheduled`, "success");
    updateScheduledCoursesList();
    document.querySelector('[data-section="classroom-section"]').removeAttribute("disabled");
  } else {
    showMessage(`Cannot schedule ${course.name} here due to conflicts`, "error");
  }
}

function removeCourseFromSlot(course, slot, courseElement) {
  if (course.removeSlot(slot)) {
    courseElement.remove();
    showMessage(`Removed ${course.name}`, "success");
    updateScheduledCoursesList();
  } else {
    showMessage(`Failed to remove ${course.name}`, "error");
  }
}

function populateAvailableCourses() {
  let html = "";

  currentSession.programs.forEach((program) => {
    program.departments.forEach((dept) => {
      dept.courses.forEach((course) => {
        html += `<div class="course-item" draggable="true" data-course-id="${course.id}">
          <strong>${course.name}</strong>
          <div class="course-meta">
            <span>Credits: ${course.credits}</span>
            <span>Students: ${course.students.length}</span>
          </div>
          <div>Instructor: ${course.instructor.name}</div>
        </div>`;
      });
    });
  });

  availableCourses.innerHTML = html;

  document.querySelectorAll(".course-item").forEach((item) => {
    item.addEventListener("dragstart", function (e) {
      const courseId = this.getAttribute("data-course-id");
      e.dataTransfer.setData("text", courseId);
      currentDraggedCourseId = courseId;
      setTimeout(() => highlightAvailableSlots(courseId), 50);
    });

    item.addEventListener("dragend", function () {
      clearSlotHighlights();
      currentDraggedCourseId = null;
    });
  });
}

function updateScheduledCoursesList() {
  let html = "";

  currentSession.programs.forEach((program) => {
    program.departments.forEach((dept) => {
      dept.courses.forEach((course) => {
        if (course.slots.size > 0) {
          html += `<div class="scheduled-course-item">
            <h4>${course.name} (${course.id})</h4><div class="slots-list">`;
          course.slots.forEach((slot) => {
            const hour = slot.hour > 12 ? slot.hour - 12 : slot.hour;
            const ampm = slot.hour >= 12 ? "PM" : "AM";
            const classroom = course.slotClassroomMap[slot];
            let classroomText = `<select class="classroom-select"
                data-course-id="${course.id}"
                data-slot-day="${slot.day}"
                data-slot-hour="${slot.hour}">
              <option value="">Select classroom</option>
              ${getAvailableClassroomsOptions(course, slot)}
            </select>`;
            if (classroom) {
              classroomText = `<div class="assigned-classroom">Assigned to: ${classroom.id} (capacity: ${classroom.capacity})</div>` + classroomText;
            }
            html += `<div class="slot-item">
              <span class="slot-time">${slot.day}, ${hour}:00 ${ampm}</span>
              <span>${classroomText}</span>
            </div>`;
          });
          html += `</div></div>`;
        }
      });
    });
  });

  scheduledCourses.innerHTML = html;

  document.querySelectorAll(".classroom-select").forEach((select) => {
    select.addEventListener("change", (e) => {
      assignClassroom(e);
      updateScheduledCoursesList();
    });
  });
}

function assignClassroom(event) {
  const select = event.target;
  const courseId = select.getAttribute("data-course-id");
  const slotDay = select.getAttribute("data-slot-day");
  const slotHour = parseInt(select.getAttribute("data-slot-hour"));
  const classroomId = select.value;

  if (!classroomId) return;

  const course = findCourseById(courseId);
  const slot = findSlot(slotDay, slotHour);
  const classroom = findClassroomById(classroomId);

  if (course && slot && classroom) {
    if (course.assignClassroom(slot, classroom)) {
      showMessage(`Classroom ${classroom.id} assigned`, "success");
    } else {
      showMessage(`Cannot assign ${classroom.id} to ${course.name}`, "error");
    }
  }
}

function getAvailableClassroomsOptions(course, slot) {
  let options = "";
  currentSession.programs.forEach((program) => {
    program.departments.forEach((dept) => {
      dept.classrooms.forEach((classroom) => {
        if (
          classroom.capacity >= course.students.length &&
          course.isClassroomAvailable(slot, classroom)
        ) {
          options += `<option value="${classroom.id}">${classroom.id} (capacity: ${classroom.capacity})</option>`;
        }
      });
    });
  });
  return options;
}

function generateFinalTimetable() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

  let html = '<table class="final-timetable"><thead><tr><th>Time</th>';
  days.forEach((day) => {
    html += `<th>${day}</th>`;
  });
  html += '</tr></thead><tbody>';

  hours.forEach((hour) => {
    const displayHour = hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? "PM" : "AM";
    html += `<tr><th>${displayHour}:00 ${ampm}</th>`;

    days.forEach((day) => {
      html += "<td>";
      currentSession.programs.forEach((program) => {
        program.departments.forEach((dept) => {
          dept.courses.forEach((course) => {
            course.slots.forEach((slot) => {
              if (slot.day === day && slot.hour === hour) {
                const classroom = course.slotClassroomMap[slot];
                const classroomText = classroom
                  ? `Room: ${classroom.id}`
                  : "No room assigned";
                html += `<div class="scheduled-course">
                  <strong>${course.name}</strong><br>
                  ${course.instructor.name}<br>
                  ${classroomText}
                </div>`;
              }
            });
          });
        });
      });
      html += "</td>";
    });

    html += "</tr>";
  });

  html += "</tbody></table>";
  finalTimetable.innerHTML = html;
  downloadTimetableBtn.disabled = false;
  showMessage("Timetable generated successfully", "success");
}

function downloadTimetableAsJson() {
  if (!currentSession) {
    showMessage("No session data available", "error");
    return;
  }

  const timetableData = {
    sessionName: currentSession.name,
    sessionId: currentSession.id,
    generatedAt: new Date().toISOString(),
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    hours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    schedule: {}
  };

  timetableData.days.forEach((day) => {
    timetableData.schedule[day] = {};
    timetableData.hours.forEach((hour) => {
      timetableData.schedule[day][hour] = [];
    });
  });

  currentSession.programs.forEach((program) => {
    program.departments.forEach((dept) => {
      dept.courses.forEach((course) => {
        course.slots.forEach((slot) => {
          const classroom = course.slotClassroomMap[slot];
          timetableData.schedule[slot.day][slot.hour].push({
            courseId: course.id,
            courseName: course.name,
            instructorId: course.instructor.id,
            instructorName: course.instructor.name,
            classroom: classroom ? {
              id: classroom.id,
              capacity: classroom.capacity
            } : null,
            studentCount: course.students.length
          });
        });
      });
    });
  });

  const json = JSON.stringify(timetableData, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `timetable_${currentSession.id}_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showMessage("Timetable downloaded successfully", "success");
}

// Utility functions
function showMessage(message, type = "info") {
  statusMessage.textContent = message;
  statusMessage.className = type;
  statusMessage.style.display = "block";
  setTimeout(() => {
    statusMessage.style.display = "none";
  }, 5000);
}

function findCourseById(id) {
  return currentSession.allCoursesById[id];
}

function findSlot(day, hour) {
  const dayIndex = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].indexOf(day);
  if (dayIndex === -1) return null;
  const hourIndex = hour - 8;
  return currentSession.slots[dayIndex][hourIndex];
}

function findClassroomById(id) {
  return currentSession.allClassroomsById[id];
}
