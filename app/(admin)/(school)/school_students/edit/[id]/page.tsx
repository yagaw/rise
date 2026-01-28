"use client"
import React, { useState, useEffect } from "react"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { useRouter } from "next/navigation"
import Form from "@/components/form/Form"
import Label from "@/components/form/Label"
import Input from "@/components/form/input/InputField"
import Select from "@/components/form/Select"
import Button from "@/components/ui/button/Button"

type SchoolStudentForm = {
  id: string
  org: string
  sch_code: string
  sch_status: string
  sch_name_eng: string
  sr_eng_mimu: string
  ts_eng_mimu: string
  std_id: string
  std_name_eng: string
  std_name_bur: string
  enroll_date: string
  sex: string
  dob: string
  age: string
  grade_16_17: string
  grade_17_18: string
  grade_18_19: string
  grade_19_20: string
  grade_20_21: string
  grade_21_22: string
  grade_22_23: string
  grade_23_24: string
  year_tees_std_began: string
}

// Mock data - replace with actual API call
const getSchoolStudentById = (id: string): SchoolStudentForm => {
  return {
    id: id,
    org: "SEE",
    sch_code: "SEE001",
    sch_status: "Active",
    sch_name_eng: "SEE School 1",
    sr_eng_mimu: "Kachin",
    ts_eng_mimu: "Falam",
    std_id: "STD-0001",
    std_name_eng: "Aung Kyaw",
    std_name_bur: "အောင်ကျော်",
    enroll_date: "2025-09-01",
    sex: "male",
    dob: "2010-03-10",
    age: "15",
    grade_16_17: "Grade 6",
    grade_17_18: "Grade 7",
    grade_18_19: "Grade 8",
    grade_19_20: "Grade 9",
    grade_20_21: "Grade 10",
    grade_21_22: "Grade 11",
    grade_22_23: "Grade 12",
    grade_23_24: "Grade 13",
    year_tees_std_began: "2016",
  }
}

export default function EditSchoolStudentPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [formData, setFormData] = useState<Partial<SchoolStudentForm>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch school student data
    const studentData = getSchoolStudentById(params.id)
    setFormData(studentData)
    setLoading(false)
  }, [params.id])

  const handleInputChange = (field: keyof SchoolStudentForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // TODO: Add API call to update school student
    alert("School student updated successfully!")
    router.push("/school_students")
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  const tabs = [
    { id: "basic", label: "Basic Information" },
    { id: "school", label: "School Information" },
    { id: "academic", label: "Academic History" },
  ]

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit School Student" />

      <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-brand-500 text-brand-500"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Form onSubmit={handleSubmit}>
          {/* Basic Information Tab */}
          {activeTab === "basic" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="std_id">Student ID *</Label>
                <Input
                  id="std_id"
                  type="text"
                  placeholder="Enter student ID"
                  defaultValue={formData.std_id}
                  onChange={(e) => handleInputChange("std_id", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="std_name_eng">Student Name (English) *</Label>
                <Input
                  id="std_name_eng"
                  type="text"
                  placeholder="Enter student name in English"
                  defaultValue={formData.std_name_eng}
                  onChange={(e) =>
                    handleInputChange("std_name_eng", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="std_name_bur">Student Name (Burmese)</Label>
                <Input
                  id="std_name_bur"
                  type="text"
                  placeholder="Enter student name in Burmese"
                  defaultValue={formData.std_name_bur}
                  onChange={(e) =>
                    handleInputChange("std_name_bur", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="sex">Gender</Label>
                <Select
                  options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                  ]}
                  placeholder="Select gender"
                  defaultValue={formData.sex}
                  onChange={(value) => handleInputChange("sex", value)}
                />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  placeholder="Enter date of birth"
                  defaultValue={formData.dob}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter age"
                  defaultValue={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="enroll_date">Enrollment Date</Label>
                <Input
                  id="enroll_date"
                  type="date"
                  placeholder="Enter enrollment date"
                  defaultValue={formData.enroll_date}
                  onChange={(e) =>
                    handleInputChange("enroll_date", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="year_tees_std_began">
                  Year TEES Student Began
                </Label>
                <Input
                  id="year_tees_std_began"
                  type="number"
                  placeholder="Enter year student began at TEES"
                  defaultValue={formData.year_tees_std_began}
                  onChange={(e) =>
                    handleInputChange("year_tees_std_began", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* School Information Tab */}
          {activeTab === "school" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="org">Organization</Label>
                <Input
                  id="org"
                  type="text"
                  placeholder="Enter organization"
                  defaultValue={formData.org}
                  onChange={(e) => handleInputChange("org", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sch_code">School Code</Label>
                <Input
                  id="sch_code"
                  type="text"
                  placeholder="Enter school code"
                  defaultValue={formData.sch_code}
                  onChange={(e) =>
                    handleInputChange("sch_code", e.target.value)
                  }
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="sch_name_eng">School Name (English)</Label>
                <Input
                  id="sch_name_eng"
                  type="text"
                  placeholder="Enter school name in English"
                  defaultValue={formData.sch_name_eng}
                  onChange={(e) =>
                    handleInputChange("sch_name_eng", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="sch_status">School Status</Label>
                <Select
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                    { value: "Pending", label: "Pending" },
                  ]}
                  placeholder="Select school status"
                  defaultValue={formData.sch_status}
                  onChange={(value) => handleInputChange("sch_status", value)}
                />
              </div>
              <div>
                <Label htmlFor="sr_eng_mimu">State/Region (English)</Label>
                <Input
                  id="sr_eng_mimu"
                  type="text"
                  placeholder="Enter state/region in English"
                  defaultValue={formData.sr_eng_mimu}
                  onChange={(e) =>
                    handleInputChange("sr_eng_mimu", e.target.value)
                  }
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="ts_eng_mimu">Township (English)</Label>
                <Input
                  id="ts_eng_mimu"
                  type="text"
                  placeholder="Enter township in English"
                  defaultValue={formData.ts_eng_mimu}
                  onChange={(e) =>
                    handleInputChange("ts_eng_mimu", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* Academic History Tab */}
          {activeTab === "academic" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="grade_16_17">Grade (2016-2017)</Label>
                <Input
                  id="grade_16_17"
                  type="text"
                  placeholder="Enter grade for 2016-2017"
                  defaultValue={formData.grade_16_17}
                  onChange={(e) =>
                    handleInputChange("grade_16_17", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="grade_17_18">Grade (2017-2018)</Label>
                <Input
                  id="grade_17_18"
                  type="text"
                  placeholder="Enter grade for 2017-2018"
                  defaultValue={formData.grade_17_18}
                  onChange={(e) =>
                    handleInputChange("grade_17_18", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="grade_18_19">Grade (2018-2019)</Label>
                <Input
                  id="grade_18_19"
                  type="text"
                  placeholder="Enter grade for 2018-2019"
                  defaultValue={formData.grade_18_19}
                  onChange={(e) =>
                    handleInputChange("grade_18_19", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="grade_19_20">Grade (2019-2020)</Label>
                <Input
                  id="grade_19_20"
                  type="text"
                  placeholder="Enter grade for 2019-2020"
                  defaultValue={formData.grade_19_20}
                  onChange={(e) =>
                    handleInputChange("grade_19_20", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="grade_20_21">Grade (2020-2021)</Label>
                <Input
                  id="grade_20_21"
                  type="text"
                  placeholder="Enter grade for 2020-2021"
                  defaultValue={formData.grade_20_21}
                  onChange={(e) =>
                    handleInputChange("grade_20_21", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="grade_21_22">Grade (2021-2022)</Label>
                <Input
                  id="grade_21_22"
                  type="text"
                  placeholder="Enter grade for 2021-2022"
                  defaultValue={formData.grade_21_22}
                  onChange={(e) =>
                    handleInputChange("grade_21_22", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="grade_22_23">Grade (2022-2023)</Label>
                <Input
                  id="grade_22_23"
                  type="text"
                  placeholder="Enter grade for 2022-2023"
                  defaultValue={formData.grade_22_23}
                  onChange={(e) =>
                    handleInputChange("grade_22_23", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="grade_23_24">Grade (2023-2024)</Label>
                <Input
                  id="grade_23_24"
                  type="text"
                  placeholder="Enter grade for 2023-2024"
                  defaultValue={formData.grade_23_24}
                  onChange={(e) =>
                    handleInputChange("grade_23_24", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-8 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/school_students")}
            >
              Cancel
            </Button>
            <Button type="submit">Update School Student</Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
