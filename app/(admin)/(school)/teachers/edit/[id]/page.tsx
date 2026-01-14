"use client"
import React, { useState, useEffect } from "react"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { useRouter } from "next/navigation"
import { Teacher } from "@/types/teacher"
import Form from "@/components/form/Form"
import Label from "@/components/form/Label"
import Input from "@/components/form/input/InputField"
import Select from "@/components/form/Select"
import Checkbox from "@/components/form/input/Checkbox"
import Button from "@/components/ui/button/Button"
import TextArea from "@/components/form/input/TextArea"

// Mock data - replace with actual API call
const getTeacherById = (id: string): Teacher => {
  return {
    id: id,
    teach_id: "T001",
    teach_name_eng: "Aung Kyaw",
    teach_name_bur: "အောင်ကျော်",
    sch_code: "SCH001",
    sch_name_eng: "Central High School",
    org: "Ministry of Education",
    gender: "Male",
    yob: 1985,
    marital_status: "Married",
    religion: "Buddhist",
    position: "Senior Teacher",
    status: "stay",
    edu_level: "Bachelor's Degree",
    teach_exp_year: 15,
    teach_exp_month: 3,
    english: true,
    math: true,
    grade_9: true,
    grade_10: true,
  }
}

export default function EditTeacherPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [formData, setFormData] = useState<Partial<Teacher>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch teacher data
    const teacherData = getTeacherById(params.id)
    setFormData(teacherData)
    setLoading(false)
  }, [params.id])

  const handleInputChange = (
    field: keyof Teacher,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // TODO: Add API call to update teacher
    alert("Teacher updated successfully!")
    router.push("/teachers")
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
    { id: "school", label: "School & Position" },
    { id: "qualification", label: "Qualifications" },
    { id: "subjects", label: "Subject Competencies" },
    { id: "grades", label: "Grade Levels" },
  ]

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Teacher" />

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
                <Label htmlFor="teach_id">Teacher ID *</Label>
                <Input
                  id="teach_id"
                  type="text"
                  placeholder="Enter teacher ID"
                  defaultValue={formData.teach_id}
                  onChange={(e) =>
                    handleInputChange("teach_id", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="teach_name_eng">Teacher Name (English) *</Label>
                <Input
                  id="teach_name_eng"
                  type="text"
                  placeholder="Enter teacher name in English"
                  defaultValue={formData.teach_name_eng}
                  onChange={(e) =>
                    handleInputChange("teach_name_eng", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="teach_name_bur">Teacher Name (Burmese)</Label>
                <Input
                  id="teach_name_bur"
                  type="text"
                  placeholder="Enter teacher name in Burmese"
                  defaultValue={formData.teach_name_bur}
                  onChange={(e) =>
                    handleInputChange("teach_name_bur", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" },
                  ]}
                  placeholder="Select gender"
                  defaultValue={formData.gender}
                  onChange={(value) => handleInputChange("gender", value)}
                />
              </div>
              <div>
                <Label htmlFor="yob">Year of Birth</Label>
                <Input
                  id="yob"
                  type="number"
                  placeholder="Enter year of birth"
                  defaultValue={formData.yob}
                  onChange={(e) =>
                    handleInputChange("yob", parseInt(e.target.value))
                  }
                />
              </div>
              <div>
                <Label htmlFor="marital_status">Marital Status</Label>
                <Select
                  options={[
                    { value: "Single", label: "Single" },
                    { value: "Married", label: "Married" },
                    { value: "Divorced", label: "Divorced" },
                    { value: "Widowed", label: "Widowed" },
                  ]}
                  placeholder="Select marital status"
                  defaultValue={formData.marital_status}
                  onChange={(value) =>
                    handleInputChange("marital_status", value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="religion">Religion</Label>
                <Input
                  id="religion"
                  type="text"
                  placeholder="Enter religion"
                  defaultValue={formData.religion}
                  onChange={(e) =>
                    handleInputChange("religion", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* School & Position Tab */}
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
              <div>
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
                <Label htmlFor="sch_name_bur">School Name (Burmese)</Label>
                <Input
                  id="sch_name_bur"
                  type="text"
                  placeholder="Enter school name in Burmese"
                  defaultValue={formData.sch_name_bur}
                  onChange={(e) =>
                    handleInputChange("sch_name_bur", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="sch_name_loc">School Name (Local)</Label>
                <Input
                  id="sch_name_loc"
                  type="text"
                  placeholder="Enter school name in local language"
                  defaultValue={formData.sch_name_loc}
                  onChange={(e) =>
                    handleInputChange("sch_name_loc", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="pcode_sr_mimu">State/Region Code</Label>
                <Input
                  id="pcode_sr_mimu"
                  type="text"
                  placeholder="Enter state/region code"
                  defaultValue={formData.pcode_sr_mimu}
                  onChange={(e) =>
                    handleInputChange("pcode_sr_mimu", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="sr_eng_minu">State/Region (English)</Label>
                <Input
                  id="sr_eng_minu"
                  type="text"
                  placeholder="Enter state/region"
                  defaultValue={formData.sr_eng_minu}
                  onChange={(e) =>
                    handleInputChange("sr_eng_minu", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="pcode_ts_mimu">Township Code</Label>
                <Input
                  id="pcode_ts_mimu"
                  type="text"
                  placeholder="Enter township code"
                  defaultValue={formData.pcode_ts_mimu}
                  onChange={(e) =>
                    handleInputChange("pcode_ts_mimu", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="ts_eng_mimu">Township (English)</Label>
                <Input
                  id="ts_eng_mimu"
                  type="text"
                  placeholder="Enter township"
                  defaultValue={formData.ts_eng_mimu}
                  onChange={(e) =>
                    handleInputChange("ts_eng_mimu", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Select
                  options={[
                    { value: "Teacher", label: "Teacher" },
                    { value: "Senior Teacher", label: "Senior Teacher" },
                    { value: "Head Teacher", label: "Head Teacher" },
                    {
                      value: "Assistant Head Teacher",
                      label: "Assistant Head Teacher",
                    },
                    {
                      value: "Deputy Head Teacher",
                      label: "Deputy Head Teacher",
                    },
                  ]}
                  placeholder="Select position"
                  defaultValue={formData.position}
                  onChange={(value) => handleInputChange("position", value)}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  options={[
                    { value: "new", label: "New" },
                    { value: "stay", label: "Stay" },
                    { value: "transfer_from", label: "Transfer From" },
                    { value: "resume", label: "Resume" },
                    { value: "transfer_to", label: "Transfer To" },
                    { value: "retire", label: "Retire" },
                    { value: "resign", label: "Resign" },
                  ]}
                  placeholder="Select status"
                  defaultValue={formData.status}
                  onChange={(value) => handleInputChange("status", value)}
                />
              </div>
              <div>
                <Label htmlFor="transfer_to_from">Transfer To/From</Label>
                <Input
                  id="transfer_to_from"
                  type="text"
                  placeholder="Enter transfer location"
                  defaultValue={formData.transfer_to_from}
                  onChange={(e) =>
                    handleInputChange("transfer_to_from", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* Qualifications Tab */}
          {activeTab === "qualification" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="edu_level">Education Level</Label>
                <Select
                  options={[
                    { value: "High School", label: "High School" },
                    { value: "Diploma", label: "Diploma" },
                    { value: "Bachelor's Degree", label: "Bachelor's Degree" },
                    { value: "Master's Degree", label: "Master's Degree" },
                    { value: "PhD", label: "PhD" },
                  ]}
                  placeholder="Select education level"
                  defaultValue={formData.edu_level}
                  onChange={(value) => handleInputChange("edu_level", value)}
                />
              </div>
              <div>
                <Label htmlFor="training">Training</Label>
                <Input
                  id="training"
                  type="text"
                  placeholder="Enter training details"
                  defaultValue={formData.training}
                  onChange={(e) =>
                    handleInputChange("training", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="teaching_began">Teaching Began (Year)</Label>
                <Input
                  id="teaching_began"
                  type="text"
                  placeholder="Enter year teaching began"
                  defaultValue={formData.teaching_began}
                  onChange={(e) =>
                    handleInputChange("teaching_began", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="teach_exp_year">
                  Teaching Experience (Years)
                </Label>
                <Input
                  id="teach_exp_year"
                  type="number"
                  placeholder="Enter years of experience"
                  defaultValue={formData.teach_exp_year}
                  onChange={(e) =>
                    handleInputChange(
                      "teach_exp_year",
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="teach_exp_month">
                  Teaching Experience (Months)
                </Label>
                <Input
                  id="teach_exp_month"
                  type="number"
                  placeholder="Enter months of experience"
                  defaultValue={formData.teach_exp_month}
                  onChange={(e) =>
                    handleInputChange(
                      "teach_exp_month",
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="com_moe_support">Community/MOE Support</Label>
                <Select
                  options={[
                    { value: "MOE", label: "MOE" },
                    { value: "Community", label: "Community" },
                    { value: "Both", label: "Both" },
                    { value: "None", label: "None" },
                  ]}
                  placeholder="Select support type"
                  defaultValue={formData.com_moe_support}
                  onChange={(value) =>
                    handleInputChange("com_moe_support", value)
                  }
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="comments">Comments</Label>
                <TextArea
                  id="comments"
                  placeholder="Enter any additional comments"
                  rows={4}
                  value={formData.comments}
                  onChange={(value) => handleInputChange("comments", value)}
                />
              </div>
            </div>
          )}

          {/* Subject Competencies Tab */}
          {activeTab === "subjects" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                  Subject Competencies
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.local_languages || false}
                      onChange={(checked) =>
                        handleInputChange("local_languages", checked)
                      }
                    />
                    <Label className="mb-0">Local Languages</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.english || false}
                      onChange={(checked) =>
                        handleInputChange("english", checked)
                      }
                    />
                    <Label className="mb-0">English</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.burmese || false}
                      onChange={(checked) =>
                        handleInputChange("burmese", checked)
                      }
                    />
                    <Label className="mb-0">Burmese</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.math || false}
                      onChange={(checked) => handleInputChange("math", checked)}
                    />
                    <Label className="mb-0">Mathematics</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.health || false}
                      onChange={(checked) =>
                        handleInputChange("health", checked)
                      }
                    />
                    <Label className="mb-0">Health</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.geography || false}
                      onChange={(checked) =>
                        handleInputChange("geography", checked)
                      }
                    />
                    <Label className="mb-0">Geography</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.history || false}
                      onChange={(checked) =>
                        handleInputChange("history", checked)
                      }
                    />
                    <Label className="mb-0">History</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.science || false}
                      onChange={(checked) =>
                        handleInputChange("science", checked)
                      }
                    />
                    <Label className="mb-0">Science</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.eco || false}
                      onChange={(checked) => handleInputChange("eco", checked)}
                    />
                    <Label className="mb-0">Economics</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.che || false}
                      onChange={(checked) => handleInputChange("che", checked)}
                    />
                    <Label className="mb-0">Chemistry</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.phy || false}
                      onChange={(checked) => handleInputChange("phy", checked)}
                    />
                    <Label className="mb-0">Physics</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.bio || false}
                      onChange={(checked) => handleInputChange("bio", checked)}
                    />
                    <Label className="mb-0">Biology</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.social || false}
                      onChange={(checked) =>
                        handleInputChange("social", checked)
                      }
                    />
                    <Label className="mb-0">Social Studies</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.moral_civic || false}
                      onChange={(checked) =>
                        handleInputChange("moral_civic", checked)
                      }
                    />
                    <Label className="mb-0">Moral & Civic</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.life_skills || false}
                      onChange={(checked) =>
                        handleInputChange("life_skills", checked)
                      }
                    />
                    <Label className="mb-0">Life Skills</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.art || false}
                      onChange={(checked) => handleInputChange("art", checked)}
                    />
                    <Label className="mb-0">Art</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.physical_education || false}
                      onChange={(checked) =>
                        handleInputChange("physical_education", checked)
                      }
                    />
                    <Label className="mb-0">Physical Education</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.other_subject || false}
                      onChange={(checked) =>
                        handleInputChange("other_subject", checked)
                      }
                    />
                    <Label className="mb-0">Other</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grade Levels Tab */}
          {activeTab === "grades" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                  Grade Levels Teaching
                </h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.nursery || false}
                      onChange={(checked) =>
                        handleInputChange("nursery", checked)
                      }
                    />
                    <Label className="mb-0">Nursery</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.kg || false}
                      onChange={(checked) => handleInputChange("kg", checked)}
                    />
                    <Label className="mb-0">KG</Label>
                  </div>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                    <div key={grade} className="flex items-center gap-2">
                      <Checkbox
                        checked={
                          (formData[
                            `grade_${grade}` as keyof Teacher
                          ] as boolean) || false
                        }
                        onChange={(checked) =>
                          handleInputChange(
                            `grade_${grade}` as keyof Teacher,
                            checked
                          )
                        }
                      />
                      <Label className="mb-0">Grade {grade}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-8 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/teachers")}
            >
              Cancel
            </Button>
            <Button type="submit">Update Teacher</Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
