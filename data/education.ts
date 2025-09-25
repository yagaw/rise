// Simple in-memory dummy data for education domain

export type Organization = {
  id: string
  name: string
}

export type SchoolYear = {
  id: string
  label: string // e.g., "2024-2025"
  organizationId: string
}

export type School = {
  id: string
  name: string
  organizationId: string
}

export type Gender = "male" | "female"

export type Teacher = {
  id: string
  fullName: string
  schoolId: string
  subject?: string
  gender: Gender
}

export type Student = {
  id: string
  fullName: string
  schoolId: string
  gradeLevel: string // e.g., "Grade 6"
  gender: Gender
}

export const organizations: Organization[] = [
  { id: "org-north", name: "North District" },
  { id: "org-south", name: "South District" },
  { id: "org-east", name: "East Academy Group" },
]

export const schoolYears: SchoolYear[] = [
  { id: "sy-23-24-n", label: "2023-2024", organizationId: "org-north" },
  { id: "sy-24-25-n", label: "2024-2025", organizationId: "org-north" },
  { id: "sy-24-25-s", label: "2024-2025", organizationId: "org-south" },
  { id: "sy-24-25-e", label: "2024-2025", organizationId: "org-east" },
]

// Generate larger dummy dataset (200+ per entity type)
const generateSchools = () => {
  const list: School[] = []
  const orgToPrefix: Record<string, string> = {
    "org-north": "N",
    "org-south": "S",
    "org-east": "E",
  }
  const perOrg = 80 // 3 * 80 = 240 schools total
  organizations.forEach((org) => {
    const prefix = orgToPrefix[org.id] ?? "X"
    for (let i = 1; i <= perOrg; i++) {
      list.push({
        id: `sch-${prefix}-${i}`,
        name: `${org.name} School ${i}`,
        organizationId: org.id,
      })
    }
  })
  return list
}

export const schools: School[] = generateSchools()

const firstNames = [
  "Alex",
  "Jordan",
  "Taylor",
  "Casey",
  "Riley",
  "Drew",
  "Morgan",
  "Quinn",
  "Avery",
  "Jamie",
]
const lastNames = [
  "Johnson",
  "Smith",
  "Gomez",
  "Lee",
  "Chen",
  "Davis",
  "Patel",
  "Khan",
  "Williams",
  "Brown",
]
const subjects = ["Math", "Science", "English", "History", "Biology"]

const generateTeachers = () => {
  const list: Teacher[] = []
  const total = 260 // > 200
  for (let i = 0; i < total; i++) {
    const school = schools[i % schools.length]
    const fullName = `${firstNames[i % firstNames.length]} ${
      lastNames[i % lastNames.length]
    }`
    const subject = subjects[i % subjects.length]
    const gender: Gender = i % 2 === 0 ? "male" : "female"
    list.push({
      id: `t-${i + 1}`,
      fullName,
      schoolId: school.id,
      subject,
      gender,
    })
  }
  return list
}

export const teachers: Teacher[] = generateTeachers()

const gradeLevels = [
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
]

const generateStudents = () => {
  const list: Student[] = []
  const total = 1200 // plenty above 200
  for (let i = 0; i < total; i++) {
    const school = schools[i % schools.length]
    const fullName = `${firstNames[i % firstNames.length]} ${
      lastNames[(i * 7) % lastNames.length]
    }`
    const gradeLevel = gradeLevels[i % gradeLevels.length]
    const gender: Gender = i % 2 === 0 ? "female" : "male"
    list.push({
      id: `s-${i + 1}`,
      fullName,
      schoolId: school.id,
      gradeLevel,
      gender,
    })
  }
  return list
}

export const students: Student[] = generateStudents()

export function getOrganizationScopedData(organizationId?: string) {
  const isAll = !organizationId || organizationId === "all"

  const scopedSchools = isAll
    ? schools
    : schools.filter((s) => s.organizationId === organizationId)

  const scopedSchoolIds = new Set(scopedSchools.map((s) => s.id))

  const scopedTeachers = teachers.filter((t) => scopedSchoolIds.has(t.schoolId))
  const scopedStudents = students.filter((s) => scopedSchoolIds.has(s.schoolId))

  const scopedSchoolYears = isAll
    ? schoolYears
    : schoolYears.filter((y) => y.organizationId === organizationId)

  return {
    schools: scopedSchools,
    teachers: scopedTeachers,
    students: scopedStudents,
    schoolYears: scopedSchoolYears,
  }
}
