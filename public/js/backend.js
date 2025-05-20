// Core Entities
class Classroom {
  #id;
  #capacity;
  constructor(id, capacity) {
    this.#id = id;
    this.#capacity = capacity;
  }
  get id() {
    return this.#id;
  }
  get capacity() {
    return this.#capacity;
  }
}

class Instructor {
  #id;
  #name;
  constructor(id, name) {
    this.#id = id;
    this.#name = name;
    this.courses = new Set();
  }
  get id() {
    return this.#id;
  }
  get name() {
    return this.#name;
  }
}

class Student {
  #id;
  #name;
  constructor(id, name) {
    this.#id = id;
    this.#name = name;
    this.courses = new Set(); // Courses assigned to the student
  }
  get id() {
    return this.#id;
  }
  get name() {
    return this.#name;
  }
}

class Course {
  #id;
  #name;
  #credits;
  #students;
  #instructor;
  #slotClassroomMap = {};
  #slots = new Set();
  constructor(id, name, credits, students, instructor) {
    this.#id = id;
    this.#name = name;
    this.#credits = credits;
    this.#students = students;
    for (const student of this.#students) student.courses.add(this);
    this.#instructor = instructor;
    instructor.courses.add(this);
  }
  get id() {
    return this.#id;
  }
  get name() {
    return this.#name;
  }
  get credits() {
    return this.#credits;
  }
  get students() {
    return [...this.#students];
  }
  get instructor() {
    return this.#instructor;
  }
  get slotClassroomMap() {
    return { ...this.#slotClassroomMap };
  }
  get slots() {
    return new Set(this.#slots);
  }

  isClassroomAvailable(slot, classroom) {
    for (const course of slot.courses) {
      if (Object.values(course.slotClassroomMap).includes(classroom)) {
        return false;
      }
    }
    return true;
  }

  assignClassroom(slot, classroom) {
    if (!this.#slots.has(slot)) throw new Error(`No such slot for this course`);
    if (!this.isClassroomAvailable(slot, classroom)) return false;
    this.#slotClassroomMap[slot] = classroom;
    return true;
  }

  isSlotAvailable(slot) {
    for (const student of this.#students) {
      for (const course of student.courses) {
        if (course.slots.has(slot)) return false;
      }
    }
    for (const course of this.#instructor.courses) {
      if (course.slots.has(slot)) return false;
    }
    return true;
  }

  assignSlot(slot) {
    if (this.#slots.has(slot)) return false;
    if (!this.isSlotAvailable(slot)) return false;
    slot.courses.add(this);
    this.#slots.add(slot);
    return true;
  }

  removeSlot(slot) {
    if (!this.#slots.has(slot)) return false;
    slot.courses.delete(this);
    this.#slots.delete(slot);
    delete this.#slotClassroomMap[slot];
    return true;
  }
}

class Department {
  #id;
  #name;
  #classrooms;
  #instructors;
  #students;
  #courses;
  constructor(id, name, classrooms, instructors, students, courses) {
    this.#id = id;
    this.#name = name;
    this.#classrooms = classrooms;
    this.#instructors = instructors;
    this.#students = students;
    this.#courses = courses;
  }
  get id() {
    return this.#id;
  }
  get name() {
    return this.#name;
  }
  get classrooms() {
    return this.#classrooms;
  }
  get instructors() {
    return this.#instructors;
  }
  get students() {
    return this.#students;
  }
  get courses() {
    return this.#courses;
  }
}

class Program {
  #id;
  #name;
  #departments;
  constructor(id, name, departments) {
    this.#id = id;
    this.#name = name;
    this.#departments = departments;
  }
  get id() {
    return this.#id;
  }
  get name() {
    return this.#name;
  }
  get departments() {
    return this.#departments;
  }
}

class Slot {
  #day;
  #hour;
  constructor(day, hour) {
    this.#day = day;
    this.#hour = hour;
    this.courses = new Set();
  }
  get day() {
    return this.#day;
  }
  get hour() {
    return this.#hour;
  }
}

class Session {
  #id;
  #name;
  #programs;
  #slots;
  #allCoursesById = {};
  #allClassroomsById = {};
  constructor(id, name, programs) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
    this.#id = id;
    this.#name = name;
    this.#programs = programs;
    this.#slots = days.map((day) => hours.map((hour) => new Slot(day, hour)));
    for (const program of this.#programs) {
      for (const dept of program.departments) {
        for (const course of dept.courses) {
          this.#allCoursesById[course.id] = course;
        }
        for (const classroom of dept.classrooms) {
          this.#allClassroomsById[classroom.id] = classroom;
        }
      }
    }
  }

  get id() {
    return this.#id;
  }
  get name() {
    return this.#name;
  }
  get programs() {
    return this.#programs;
  }
  get slots() {
    return this.#slots;
  }
  get allCoursesById() {
    return { ...this.#allCoursesById };
  }
  get allClassroomsById() {
    return { ...this.#allClassroomsById };
  }
}

// Function to create a session from JSON input
function createSessionFromJson(json) {
  const data = typeof json === "string" ? JSON.parse(json) : json;

  if (!data.id || !data.name || !Array.isArray(data.programs)) {
    throw new Error("Invalid session data: missing id, name, or programs");
  }

  const idMaps = {
    classrooms: new Map(),
    instructors: new Map(),
    students: new Map(),
    courses: new Map(),
  };

  const programs = [];

  for (const programData of data.programs) {
    if (!programData.id || !programData.name || !Array.isArray(programData.departments)) {
      throw new Error(`Invalid program data: ${JSON.stringify(programData)}`);
    }

    const departments = [];

    for (const deptData of programData.departments) {
      if (
        !deptData.id || !deptData.name ||
        !Array.isArray(deptData.classrooms) ||
        !Array.isArray(deptData.instructors) ||
        !Array.isArray(deptData.students) ||
        !Array.isArray(deptData.courses)
      ) {
        throw new Error(`Invalid department data: ${JSON.stringify(deptData)}`);
      }

      const classrooms = [];
      for (const classroomData of deptData.classrooms) {
        if (!classroomData.id || classroomData.capacity === undefined) {
          throw new Error(`Invalid classroom data: ${JSON.stringify(classroomData)}`);
        }
        if (idMaps.classrooms.has(classroomData.id)) {
          throw new Error(`Duplicate classroom ID: ${classroomData.id}`);
        }
        const classroom = new Classroom(classroomData.id, classroomData.capacity);
        idMaps.classrooms.set(classroomData.id, classroom);
        classrooms.push(classroom);
      }

      const instructors = [];
      for (const instructorData of deptData.instructors) {
        if (!instructorData.id || !instructorData.name) {
          throw new Error(`Invalid instructor data: ${JSON.stringify(instructorData)}`);
        }
        if (idMaps.instructors.has(instructorData.id)) {
          throw new Error(`Duplicate instructor ID: ${instructorData.id}`);
        }
        const instructor = new Instructor(instructorData.id, instructorData.name);
        idMaps.instructors.set(instructorData.id, instructor);
        instructors.push(instructor);
      }

      const students = [];
      for (const studentData of deptData.students) {
        if (!studentData.id || !studentData.name) {
          throw new Error(`Invalid student data: ${JSON.stringify(studentData)}`);
        }
        if (idMaps.students.has(studentData.id)) {
          throw new Error(`Duplicate student ID: ${studentData.id}`);
        }
        const student = new Student(studentData.id, studentData.name);
        idMaps.students.set(studentData.id, student);
        students.push(student);
      }

      for (const courseData of deptData.courses) {
        if (
          !courseData.id || !courseData.name || courseData.credits === undefined ||
          !Array.isArray(courseData.studentIds) || !courseData.instructorId
        ) {
          throw new Error(`Invalid course data: ${JSON.stringify(courseData)}`);
        }

        if (idMaps.courses.has(courseData.id)) {
          throw new Error(`Duplicate course ID: ${courseData.id}`);
        }

        const instructor = idMaps.instructors.get(courseData.instructorId);
        if (!instructor) {
          throw new Error(`Instructor not found with ID: ${courseData.instructorId}`);
        }
        if (!instructors.includes(instructor)) {
          throw new Error(`Instructor ${courseData.instructorId} not in department ${deptData.id}`);
        }

        for (const studentId of courseData.studentIds) {
          const student = idMaps.students.get(studentId);
          if (!student) {
            throw new Error(`Student not found with ID: ${studentId}`);
          }
          if (!students.includes(student)) {
            throw new Error(`Student ${studentId} not in department ${deptData.id}`);
          }
        }
      }

      const courses = [];
      for (const courseData of deptData.courses) {
        const instructor = idMaps.instructors.get(courseData.instructorId);
        const courseStudents = courseData.studentIds.map((id) => idMaps.students.get(id));
        const course = new Course(courseData.id, courseData.name, courseData.credits, courseStudents, instructor);
        idMaps.courses.set(courseData.id, course);
        courses.push(course);
      }

      const department = new Department(
        deptData.id, deptData.name, classrooms, instructors, students, courses
      );
      departments.push(department);
    }

    const program = new Program(programData.id, programData.name, departments);
    programs.push(program);
  }

  return new Session(data.id, data.name, programs);
}

// Export the function to be used in app.js
export { createSessionFromJson };
