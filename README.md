You're right — the formatting (especially the directory tree and code blocks) needs Markdown syntax to be preserved properly. Here's your cleaned-up and properly formatted `README.md` version:

---

```markdown
# Classroom Scheduler App

The **Classroom Scheduler App** is a web-based tool for universities or institutions to manage and visualize the scheduling of courses, instructors, students, and classrooms in an interactive way.

It allows users to:
- Upload session data (courses, departments, instructors, students, classrooms)
- Schedule courses with a drag-and-drop timetable
- Assign classrooms intelligently
- Generate and export a final timetable as JSON

---

##  Features

-  Import session data via JSON
-  Interactive drag-and-drop timetable grid
-  Conflict-aware scheduling (students & instructors)
-  Smart classroom assignment based on capacity
-  Export final timetable as structured JSON
-  Responsive design for tablets/laptops

---

##  Directory Structure

```

Classroom-Scheduler/
├── public/                  # Frontend assets
│   ├── index.html           # Main HTML page
│   ├── css/
│   │   └── style.css        # All UI styles
│   ├── js/
│   │   ├── app.js           # DOM interaction, UI logic
│   │   └── backend.js       # Core classes and scheduling logic
├── server/
│   └── server.js            # Express server to serve the app
├── package.json             # Project metadata and dependencies
└── README.md                # Project overview

````

---

##  Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **Backend**: Node.js with Express.js

---

##  How to Start and Use the App

###  Prerequisites
Before starting, ensure you have:
- [Node.js & npm](https://nodejs.org/)
- A terminal or command prompt

---

###  1. Clone the Repository
```bash
git clone https://github.com/NeerajMansingh/Classroom-Scheduler.git
cd Classroom-Scheduler
````

---

###  2. Install Dependencies

```bash
npm install
```

---

### 3. Start the Development Server

```bash
npm start
```

---

### 4. Open the App

Visit in your browser:

```
http://localhost:3000
```

---

##  How to Use the App

###  Step 1: Import Session JSON

* In the **"Import Data"** tab, click **Browse Files** or drag & drop a `.json` file.
* A preview will be shown — click **Load Data**.

###  Step 2: Create a Session

* Go to the **"Session Info"** tab.
* Click **Create Session**.

###  Step 3: Schedule Courses

* Drag a course from the left and drop it into an available time slot.
* The app automatically checks for student and instructor conflicts.

###  Step 4: Assign Classrooms

* For each scheduled course, choose an appropriate classroom.
* Valid classrooms will match the student count and availability.

###  Step 5: View & Export

* Go to **"View Timetable"**
* Click **Generate Timetable** to visualize it.
* Click **Download JSON** to export.

---

##  Sample `session.json`

```json
{
  "id": "fall2025",
  "name": "Fall 2025",
  "programs": [
    {
      "id": "engg",
      "name": "Engineering",
      "departments": [
        {
          "id": "cse",
          "name": "Computer Science",
          "classrooms": [
            { "id": "C101", "capacity": 60 }
          ],
          "instructors": [
            { "id": "i1", "name": "Dr. Ada" }
          ],
          "students": [
            { "id": "s1", "name": "Alice" },
            { "id": "s2", "name": "Bob" }
          ],
          "courses": [
            {
              "id": "cs101",
              "name": "Data Structures",
              "credits": 3,
              "studentIds": ["s1", "s2"],
              "instructorId": "i1"
            }
          ]
        }
      ]
    }
  ]
}
```
