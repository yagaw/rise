// Simple in-memory dummy data for education domain
import { School } from "@/types/school"
import { Teacher } from "@/types/teacher"

export type Organization = {
  id: string
  name: string
}

export type SchoolYear = {
  id: string
  label: string // e.g., "2024-2025"
  organizationId: string
}

export type Gender = "male" | "female"

export type Student = {
  id: string
  fullName: string
  schoolId: string
  gradeLevel: string // e.g., "Grade 6"
  gender: Gender
}

export const organizations: Organization[] = [
  { id: "SEE", name: "SEE" },
  { id: "STF", name: "STF" },
  { id: "KTWG", name: "KTWG" },
  { id: "SENG", name: "SENG" },
  { id: "TEI", name: "TEI" },
  { id: "CDN", name: "CDN" },
  { id: "BF", name: "BF" },
  { id: "CRED", name: "CRED" },
  { id: "DDI", name: "DDI" },
  { id: "ENDO", name: "ENDO" },
  { id: "LHM", name: "LHM" },
  { id: "LDN", name: "LDN" },
  { id: "TSYU", name: "TSYU" },
]

export const schoolYears: SchoolYear[] = [
  { id: "sy-23-24-see", label: "2023-2024", organizationId: "SEE" },
  { id: "sy-24-25-see", label: "2024-2025", organizationId: "SEE" },
  { id: "sy-24-25-stf", label: "2024-2025", organizationId: "STF" },
  { id: "sy-24-25-ktwg", label: "2024-2025", organizationId: "KTWG" },
  { id: "sy-24-25-seng", label: "2024-2025", organizationId: "SENG" },
  { id: "sy-24-25-tei", label: "2024-2025", organizationId: "TEI" },
  { id: "sy-24-25-cdn", label: "2024-2025", organizationId: "CDN" },
  { id: "sy-24-25-bf", label: "2024-2025", organizationId: "BF" },
  { id: "sy-24-25-cred", label: "2024-2025", organizationId: "CRED" },
  { id: "sy-24-25-ddi", label: "2024-2025", organizationId: "DDI" },
  { id: "sy-24-25-endo", label: "2024-2025", organizationId: "ENDO" },
  { id: "sy-24-25-lhm", label: "2024-2025", organizationId: "LHM" },
  { id: "sy-24-25-ldn", label: "2024-2025", organizationId: "LDN" },
  { id: "sy-24-25-tsyu", label: "2024-2025", organizationId: "TSYU" },
]

// Generate larger dummy dataset (200+ per entity type)
const stateRegions = [
  { pcode: "MMR001", eng: "Kachin", bur: "ကချင်" },
  { pcode: "MMR002", eng: "Kayah", bur: "ကယား" },
  { pcode: "MMR003", eng: "Kayin", bur: "ကရင်" },
  { pcode: "MMR004", eng: "Chin", bur: "ချင်း" },
  { pcode: "MMR005", eng: "Sagaing", bur: "စစ်ကိုင်း" },
  { pcode: "MMR013", eng: "Yangon", bur: "ရန်ကုန်" },
  { pcode: "MMR014", eng: "Mandalay", bur: "မန္တလေး" },
]

const schoolStatuses = ["Active", "Inactive", "Pending"]
const schoolTypes = ["Government", "Private", "Monastic"]
const curricula = ["National", "International", "Mixed"]

const generateSchools = () => {
  const list: School[] = []
  const perOrg = 18 // 13 orgs * 18 = 234 schools total
  organizations.forEach((org, orgIndex) => {
    for (let i = 1; i <= perOrg; i++) {
      const stateRegion =
        stateRegions[(orgIndex * perOrg + i) % stateRegions.length]
      const schoolNum = orgIndex * perOrg + i
      list.push({
        id: `sch-${org.id}-${i}`,
        org: org.id,
        sch_code: `${org.id}${String(i).padStart(3, "0")}`,
        sch_name_eng: `${org.name} School ${i}`,
        sch_name_bur: `${org.name} ကျောင်း ${i}`,
        pcode_sr_mimu: stateRegion.pcode,
        sr_eng_mimu: stateRegion.eng,
        sr_bur_mimu: stateRegion.bur,
        sch_status: schoolStatuses[i % schoolStatuses.length],
        sch_estd_year: 1990 + (i % 35),
        sch_type: schoolTypes[i % schoolTypes.length],
        cur: curricula[i % curricula.length],
        tea_female_moe: 10 + (i % 20),
        tea_male_moe: 8 + (i % 15),
        tea_female_com: 2 + (i % 5),
        tea_male_com: 1 + (i % 5),
        created_at: new Date().toISOString(),
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
const subjects = [
  "Math",
  "Science",
  "English",
  "History",
  "Biology",
  "Geography",
  "Physics",
  "Chemistry",
]
const positions = [
  "Principal",
  "Vice Principal",
  "Teacher",
  "Assistant Teacher",
]
const teacherStatuses = ["new", "stay", "transfer_from", "resume"]
const religions = ["Buddhism", "Christianity", "Islam", "Hindu", "Other"]
const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"]
const eduLevels = ["Bachelor", "Master", "PhD", "Diploma"]

const generateTeachers = () => {
  const list: Teacher[] = []
  const total = 260 // > 200
  for (let i = 0; i < total; i++) {
    const school = schools[i % schools.length]
    const fullName = `${firstNames[i % firstNames.length]} ${
      lastNames[i % lastNames.length]
    }`
    const gender: Gender = i % 2 === 0 ? "male" : "female"
    const currentYear = new Date().getFullYear()
    const yob = 1960 + (i % 40)
    const teachingBeganYear = yob + 22 + (i % 10)
    const expYears = currentYear - teachingBeganYear

    list.push({
      id: `t-${i + 1}`,
      org: school.org,
      sch_code: school.sch_code,
      sch_name_eng: school.sch_name_eng,
      sch_name_bur: school.sch_name_bur,
      pcode_sr_mimu: school.pcode_sr_mimu,
      sr_eng_minu: school.sr_eng_mimu,
      teach_id: `T${String(i + 1).padStart(6, "0")}`,
      teach_name_eng: fullName,
      teach_name_bur: fullName,
      gender,
      yob,
      marital_status: maritalStatuses[i % maritalStatuses.length],
      religion: religions[i % religions.length],
      edu_level: eduLevels[i % eduLevels.length],
      teaching_began: `${teachingBeganYear}`,
      teach_exp_year: expYears,
      teach_exp_month: i % 12,
      position: positions[i % positions.length],
      status: teacherStatuses[i % teacherStatuses.length],
      // Assign 1-3 subjects per teacher
      math: i % 3 === 0,
      science: i % 4 === 0,
      english: i % 2 === 0,
      burmese: i % 5 === 0,
      history: i % 6 === 0,
      geography: i % 7 === 0,
      phy: i % 8 === 0,
      che: i % 9 === 0,
      bio: i % 10 === 0,
      // Assign 1-3 grade levels per teacher
      grade_1: i % 3 === 0,
      grade_2: i % 4 === 0,
      grade_3: i % 5 === 0,
      grade_4: i % 6 === 0,
      grade_5: i % 7 === 0,
      grade_6: i % 8 === 0,
      grade_7: i % 9 === 0,
      grade_8: i % 10 === 0,
      grade_9: i % 11 === 0,
      grade_10: i % 12 === 0,
      created_at: new Date().toISOString(),
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
    : schools.filter((s) => s.org === organizationId)

  const scopedSchoolIds = new Set(scopedSchools.map((s) => s.id))

  const scopedTeachers = teachers.filter((t) =>
    scopedSchools.some((s) => s.sch_code === t.sch_code)
  )

  const scopedStudents = students.filter((st) =>
    scopedSchoolIds.has(st.schoolId)
  )

  const scopedSchoolYears = isAll
    ? schoolYears
    : schoolYears.filter((sy) => sy.organizationId === organizationId)

  return {
    schools: scopedSchools,
    teachers: scopedTeachers,
    students: scopedStudents,
    schoolYears: scopedSchoolYears,
  }
}
