# Classroom Scheduler App

The **Classroom Scheduler App** is a web-based tool for universities or institutions to manage and visualize the scheduling of courses, instructors, students, and classrooms in an interactive way.

It allows users to:
- Upload session data (courses, departments, instructors, students, classrooms)
- Schedule courses with a drag-and-drop timetable
- Assign classrooms intelligently
- Generate and export a final timetable as JSON

---

## Features

- Import session data via JSON
- Interactive drag-and-drop timetable grid
- Conflict-aware scheduling (students & instructors)
- Smart classroom assignment based on capacity
- Export final timetable as structured JSON
- Responsive design for tablets/laptops
  
---

Classroom-Scheduler/
├── public/ # Frontend assets
│ ├── index.html # Main HTML page
│ ├── css/
│ │ └── style.css # All UI styles
│ ├── js/
│ │ ├── app.js # DOM interaction, UI logic
│ │ └── backend.js # Core classes and scheduling logic
├── server/
│ └── server.js # Express server to serve the app
├── package.json # Project metadata and dependencies
└── README.md # Project overview

---

---

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **Backend**: Node.js with Express.js

---

## Setup Instructions

1. **Clone the repository**
   git clone https://github.com/NeerajMansingh/Classroom-Scheduler.git
   cd Classroom-Scheduler
