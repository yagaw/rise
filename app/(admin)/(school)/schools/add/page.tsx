"use client"
import React, { useState } from "react"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { useRouter } from "next/navigation"
import { School } from "@/types/school"
import Form from "@/components/form/Form"
import Label from "@/components/form/Label"
import Input from "@/components/form/input/InputField"
import Select from "@/components/form/Select"
import Checkbox from "@/components/form/input/Checkbox"
import Button from "@/components/ui/button/Button"
import TextArea from "@/components/form/input/TextArea"

export default function AddSchoolPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [formData, setFormData] = useState<Partial<School>>({
    joined_rise: false,
    nfe: false,
  })

  const handleInputChange = (
    field: keyof School,
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
    // TODO: Add API call to create school
    alert("School added successfully!")
    router.push("/schools")
  }

  const tabs = [
    { id: "basic", label: "Basic Information" },
    { id: "location", label: "Location" },
    { id: "academic", label: "Academic Details" },
    { id: "enrollment", label: "Student Enrollment" },
    { id: "staff", label: "Staff & Teachers" },
    { id: "facilities", label: "Facilities & Resources" },
    { id: "support", label: "Support & Services" },
    { id: "community", label: "Community Info" },
  ]

  return (
    <div>
      <PageBreadcrumb pageTitle="Add School" />

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
                <Label htmlFor="sch_code">School Code *</Label>
                <Input
                  id="sch_code"
                  type="text"
                  placeholder="Enter school code"
                  onChange={(e) =>
                    handleInputChange("sch_code", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="org">Organization</Label>
                <Input
                  id="org"
                  type="text"
                  placeholder="Enter organization"
                  onChange={(e) => handleInputChange("org", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sch_name_eng">School Name (English) *</Label>
                <Input
                  id="sch_name_eng"
                  type="text"
                  placeholder="Enter school name in English"
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
                  onChange={(e) =>
                    handleInputChange("sch_name_loc", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="sch_estd_year">Established Year</Label>
                <Input
                  id="sch_estd_year"
                  type="number"
                  placeholder="Enter year"
                  onChange={(e) =>
                    handleInputChange("sch_estd_year", parseInt(e.target.value))
                  }
                />
              </div>
              <div>
                <Label htmlFor="sch_status">School Status</Label>
                <Select
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                    {
                      value: "Temporarily Closed",
                      label: "Temporarily Closed",
                    },
                  ]}
                  placeholder="Select status"
                  onChange={(value) => handleInputChange("sch_status", value)}
                />
              </div>
              <div>
                <Label htmlFor="sch_type">School Type</Label>
                <Select
                  options={[
                    { value: "Government", label: "Government" },
                    { value: "Private", label: "Private" },
                    { value: "Monastery", label: "Monastery" },
                    { value: "Community", label: "Community" },
                  ]}
                  placeholder="Select type"
                  onChange={(value) => handleInputChange("sch_type", value)}
                />
              </div>
              <div>
                <Label htmlFor="cur">Curriculum</Label>
                <Input
                  id="cur"
                  type="text"
                  placeholder="Enter curriculum"
                  onChange={(e) => handleInputChange("cur", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="grade_system">Grade System</Label>
                <Input
                  id="grade_system"
                  type="text"
                  placeholder="Enter grade system"
                  onChange={(e) =>
                    handleInputChange("grade_system", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="main_lang_in">
                  Main Language of Instruction
                </Label>
                <Input
                  id="main_lang_in"
                  type="text"
                  placeholder="Enter main language"
                  onChange={(e) =>
                    handleInputChange("main_lang_in", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="sch_location_type">Location Type</Label>
                <Select
                  options={[
                    { value: "Urban", label: "Urban" },
                    { value: "Rural", label: "Rural" },
                    { value: "Remote", label: "Remote" },
                  ]}
                  placeholder="Select location type"
                  onChange={(value) =>
                    handleInputChange("sch_location_type", value)
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.joined_rise || false}
                  onChange={(checked) =>
                    handleInputChange("joined_rise", checked)
                  }
                />
                <Label htmlFor="joined_rise" className="mb-0">
                  Joined RISE Program
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.nfe || false}
                  onChange={(checked) => handleInputChange("nfe", checked)}
                />
                <Label htmlFor="nfe" className="mb-0">
                  NFE (Non-Formal Education)
                </Label>
              </div>
            </div>
          )}

          {/* Location Tab */}
          {activeTab === "location" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="pcode_sr_mimu">State/Region Code</Label>
                <Input
                  id="pcode_sr_mimu"
                  type="text"
                  placeholder="Enter state/region code"
                  onChange={(e) =>
                    handleInputChange("pcode_sr_mimu", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="sr_eng_mimu">State/Region (English)</Label>
                <Input
                  id="sr_eng_mimu"
                  type="text"
                  placeholder="Enter state/region in English"
                  onChange={(e) =>
                    handleInputChange("sr_eng_mimu", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="sr_bur_mimu">State/Region (Burmese)</Label>
                <Input
                  id="sr_bur_mimu"
                  type="text"
                  placeholder="Enter state/region in Burmese"
                  onChange={(e) =>
                    handleInputChange("sr_bur_mimu", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="pcode_dist_mimu">District Code</Label>
                <Input
                  id="pcode_dist_mimu"
                  type="text"
                  placeholder="Enter district code"
                  onChange={(e) =>
                    handleInputChange("pcode_dist_mimu", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="dist_eng_mimu">District (English)</Label>
                <Input
                  id="dist_eng_mimu"
                  type="text"
                  placeholder="Enter district in English"
                  onChange={(e) =>
                    handleInputChange("dist_eng_mimu", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="dist_bur_mimu">District (Burmese)</Label>
                <Input
                  id="dist_bur_mimu"
                  type="text"
                  placeholder="Enter district in Burmese"
                  onChange={(e) =>
                    handleInputChange("dist_bur_mimu", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="pcode_ts_mimu">Township Code</Label>
                <Input
                  id="pcode_ts_mimu"
                  type="text"
                  placeholder="Enter township code"
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
                  placeholder="Enter township in English"
                  onChange={(e) =>
                    handleInputChange("ts_eng_mimu", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="ts_bur_mimu">Township (Burmese)</Label>
                <Input
                  id="ts_bur_mimu"
                  type="text"
                  placeholder="Enter township in Burmese"
                  onChange={(e) =>
                    handleInputChange("ts_bur_mimu", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="ts_loc">Township (Local)</Label>
                <Input
                  id="ts_loc"
                  type="text"
                  placeholder="Enter township in local language"
                  onChange={(e) => handleInputChange("ts_loc", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="pcode_vt_mimu">Village Tract Code</Label>
                <Input
                  id="pcode_vt_mimu"
                  type="text"
                  placeholder="Enter village tract code"
                  onChange={(e) =>
                    handleInputChange("pcode_vt_mimu", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="vt_eng_mimu">Village Tract (English)</Label>
                <Input
                  id="vt_eng_mimu"
                  type="text"
                  placeholder="Enter village tract in English"
                  onChange={(e) =>
                    handleInputChange("vt_eng_mimu", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="vt_bur_mimu">Village Tract (Burmese)</Label>
                <Input
                  id="vt_bur_mimu"
                  type="text"
                  placeholder="Enter village tract in Burmese"
                  onChange={(e) =>
                    handleInputChange("vt_bur_mimu", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="vt_loc">Village Tract (Local)</Label>
                <Input
                  id="vt_loc"
                  type="text"
                  placeholder="Enter village tract in local language"
                  onChange={(e) => handleInputChange("vt_loc", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="pcode_vil_mimu">Village Code</Label>
                <Input
                  id="pcode_vil_mimu"
                  type="text"
                  placeholder="Enter village code"
                  onChange={(e) =>
                    handleInputChange("pcode_vil_mimu", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="vil_eng">Village (English)</Label>
                <Input
                  id="vil_eng"
                  type="text"
                  placeholder="Enter village in English"
                  onChange={(e) => handleInputChange("vil_eng", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="vil_bur">Village (Burmese)</Label>
                <Input
                  id="vil_bur"
                  type="text"
                  placeholder="Enter village in Burmese"
                  onChange={(e) => handleInputChange("vil_bur", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="vil_loc">Village (Local)</Label>
                <Input
                  id="vil_loc"
                  type="text"
                  placeholder="Enter village in local language"
                  onChange={(e) => handleInputChange("vil_loc", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Academic Details Tab */}
          {activeTab === "academic" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="enroll_fee">Enrollment Fee</Label>
                <Input
                  id="enroll_fee"
                  type="number"
                  placeholder="Enter enrollment fee"
                  onChange={(e) =>
                    handleInputChange("enroll_fee", parseFloat(e.target.value))
                  }
                />
              </div>
              <div>
                <Label htmlFor="n_fee">Nursery Fee</Label>
                <Input
                  id="n_fee"
                  type="number"
                  placeholder="Enter nursery fee"
                  onChange={(e) =>
                    handleInputChange("n_fee", parseFloat(e.target.value))
                  }
                />
              </div>
              <div>
                <Label htmlFor="p_fee">Primary Fee</Label>
                <Input
                  id="p_fee"
                  type="number"
                  placeholder="Enter primary fee"
                  onChange={(e) =>
                    handleInputChange("p_fee", parseFloat(e.target.value))
                  }
                />
              </div>
              <div>
                <Label htmlFor="m_fee">Middle School Fee</Label>
                <Input
                  id="m_fee"
                  type="number"
                  placeholder="Enter middle school fee"
                  onChange={(e) =>
                    handleInputChange("m_fee", parseFloat(e.target.value))
                  }
                />
              </div>
              <div>
                <Label htmlFor="h_fee">High School Fee</Label>
                <Input
                  id="h_fee"
                  type="number"
                  placeholder="Enter high school fee"
                  onChange={(e) =>
                    handleInputChange("h_fee", parseFloat(e.target.value))
                  }
                />
              </div>
              <div>
                <Label htmlFor="std_dorm">Student Dormitory</Label>
                <Select
                  options={[
                    { value: "Yes", label: "Yes" },
                    { value: "No", label: "No" },
                  ]}
                  placeholder="Select option"
                  onChange={(value) => handleInputChange("std_dorm", value)}
                />
              </div>
              <div>
                <Label htmlFor="class_sun_light">Classroom Sunlight</Label>
                <Select
                  options={[
                    { value: "Good", label: "Good" },
                    { value: "Fair", label: "Fair" },
                    { value: "Poor", label: "Poor" },
                  ]}
                  placeholder="Select option"
                  onChange={(value) =>
                    handleInputChange("class_sun_light", value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="class_wind_vent">Classroom Ventilation</Label>
                <Select
                  options={[
                    { value: "Good", label: "Good" },
                    { value: "Fair", label: "Fair" },
                    { value: "Poor", label: "Poor" },
                  ]}
                  placeholder="Select option"
                  onChange={(value) =>
                    handleInputChange("class_wind_vent", value)
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.has_sch_fence || false}
                  onChange={(checked) =>
                    handleInputChange("has_sch_fence", checked)
                  }
                />
                <Label htmlFor="has_sch_fence" className="mb-0">
                  Has School Fence
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.sch_flag || false}
                  onChange={(checked) => handleInputChange("sch_flag", checked)}
                />
                <Label htmlFor="sch_flag" className="mb-0">
                  Has School Flag
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.signboard || false}
                  onChange={(checked) =>
                    handleInputChange("signboard", checked)
                  }
                />
                <Label htmlFor="signboard" className="mb-0">
                  Has Signboard
                </Label>
              </div>
            </div>
          )}

          {/* Student Enrollment Tab */}
          {activeTab === "enrollment" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                  Total Enrollment
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="stu_female_tt">Total Female Students</Label>
                    <Input
                      id="stu_female_tt"
                      type="number"
                      placeholder="Enter number"
                      onChange={(e) =>
                        handleInputChange(
                          "stu_female_tt",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="stu_male_tt">Total Male Students</Label>
                    <Input
                      id="stu_male_tt"
                      type="number"
                      placeholder="Enter number"
                      onChange={(e) =>
                        handleInputChange(
                          "stu_male_tt",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                  Grade-wise Enrollment
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="kg_female">KG Female</Label>
                    <Input
                      id="kg_female"
                      type="number"
                      placeholder="Enter number"
                      onChange={(e) =>
                        handleInputChange("kg_female", parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="kg_male">KG Male</Label>
                    <Input
                      id="kg_male"
                      type="number"
                      placeholder="Enter number"
                      onChange={(e) =>
                        handleInputChange("kg_male", parseInt(e.target.value))
                      }
                    />
                  </div>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                    <React.Fragment key={grade}>
                      <div>
                        <Label htmlFor={`g${grade}_female`}>
                          Grade {grade} Female
                        </Label>
                        <Input
                          id={`g${grade}_female`}
                          type="number"
                          placeholder="Enter number"
                          onChange={(e) =>
                            handleInputChange(
                              `g${grade}_female` as keyof School,
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor={`g${grade}_male`}>
                          Grade {grade} Male
                        </Label>
                        <Input
                          id={`g${grade}_male`}
                          type="number"
                          placeholder="Enter number"
                          onChange={(e) =>
                            handleInputChange(
                              `g${grade}_male` as keyof School,
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Staff & Teachers Tab */}
          {activeTab === "staff" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                  MOE Teachers
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="tea_female_moe">Female MOE Teachers</Label>
                    <Input
                      id="tea_female_moe"
                      type="number"
                      placeholder="Enter number"
                      onChange={(e) =>
                        handleInputChange(
                          "tea_female_moe",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="tea_male_moe">Male MOE Teachers</Label>
                    <Input
                      id="tea_male_moe"
                      type="number"
                      placeholder="Enter number"
                      onChange={(e) =>
                        handleInputChange(
                          "tea_male_moe",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                  Community Teachers
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="tea_female_com">
                      Female Community Teachers
                    </Label>
                    <Input
                      id="tea_female_com"
                      type="number"
                      placeholder="Enter number"
                      onChange={(e) =>
                        handleInputChange(
                          "tea_female_com",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="tea_male_com">
                      Male Community Teachers
                    </Label>
                    <Input
                      id="tea_male_com"
                      type="number"
                      placeholder="Enter number"
                      onChange={(e) =>
                        handleInputChange(
                          "tea_male_com",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                  School Committees
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="sch_com">School Committee Total</Label>
                    <Input
                      id="sch_com"
                      type="number"
                      placeholder="Enter number"
                      onChange={(e) =>
                        handleInputChange("sch_com", parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="sch_com_f">School Committee Female</Label>
                    <Input
                      id="sch_com_f"
                      type="number"
                      placeholder="Enter number"
                      onChange={(e) =>
                        handleInputChange("sch_com_f", parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="sch_pta">PTA Total</Label>
                    <Input
                      id="sch_pta"
                      type="number"
                      placeholder="Enter number"
                      onChange={(e) =>
                        handleInputChange("sch_pta", parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="sch_pta_f">PTA Female</Label>
                    <Input
                      id="sch_pta_f"
                      type="number"
                      placeholder="Enter number"
                      onChange={(e) =>
                        handleInputChange("sch_pta_f", parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="sch_pta_m">PTA Male</Label>
                    <Input
                      id="sch_pta_m"
                      type="number"
                      placeholder="Enter number"
                      onChange={(e) =>
                        handleInputChange("sch_pta_m", parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Facilities & Resources Tab */}
          {activeTab === "facilities" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                  Building Materials
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.sch_build_bb || false}
                      onChange={(checked) =>
                        handleInputChange("sch_build_bb", checked)
                      }
                    />
                    <Label className="mb-0">Brick/Block</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.sch_build_wd || false}
                      onChange={(checked) =>
                        handleInputChange("sch_build_wd", checked)
                      }
                    />
                    <Label className="mb-0">Wood</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.sch_build_bk_cmt || false}
                      onChange={(checked) =>
                        handleInputChange("sch_build_bk_cmt", checked)
                      }
                    />
                    <Label className="mb-0">Brick/Cement</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.sch_build_oth || false}
                      onChange={(checked) =>
                        handleInputChange("sch_build_oth", checked)
                      }
                    />
                    <Label className="mb-0">Other</Label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                  School Facilities
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.sch_facil_pg || false}
                      onChange={(checked) =>
                        handleInputChange("sch_facil_pg", checked)
                      }
                    />
                    <Label className="mb-0">Playground</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.sch_facil_lby || false}
                      onChange={(checked) =>
                        handleInputChange("sch_facil_lby", checked)
                      }
                    />
                    <Label className="mb-0">Library</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.sch_facil_off || false}
                      onChange={(checked) =>
                        handleInputChange("sch_facil_off", checked)
                      }
                    />
                    <Label className="mb-0">Office</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.sch_facil_dw || false}
                      onChange={(checked) =>
                        handleInputChange("sch_facil_dw", checked)
                      }
                    />
                    <Label className="mb-0">Drinking Water</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.sch_facil_fc || false}
                      onChange={(checked) =>
                        handleInputChange("sch_facil_fc", checked)
                      }
                    />
                    <Label className="mb-0">Fence/Compound</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.sch_facil_tl || false}
                      onChange={(checked) =>
                        handleInputChange("sch_facil_tl", checked)
                      }
                    />
                    <Label className="mb-0">Toilet</Label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                  School Resources
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.sch_resou_com || false}
                      onChange={(checked) =>
                        handleInputChange("sch_resou_com", checked)
                      }
                    />
                    <Label className="mb-0">Computer</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.sch_resou_pri || false}
                      onChange={(checked) =>
                        handleInputChange("sch_resou_pri", checked)
                      }
                    />
                    <Label className="mb-0">Printer</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.sch_resou_sol || false}
                      onChange={(checked) =>
                        handleInputChange("sch_resou_sol", checked)
                      }
                    />
                    <Label className="mb-0">Solar Panel</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.sch_resou_gen || false}
                      onChange={(checked) =>
                        handleInputChange("sch_resou_gen", checked)
                      }
                    />
                    <Label className="mb-0">Generator</Label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                  Water Sources
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.water_source_well || false}
                      onChange={(checked) =>
                        handleInputChange("water_source_well", checked)
                      }
                    />
                    <Label className="mb-0">Well</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.water_source_stream || false}
                      onChange={(checked) =>
                        handleInputChange("water_source_stream", checked)
                      }
                    />
                    <Label className="mb-0">Stream</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.water_source_river || false}
                      onChange={(checked) =>
                        handleInputChange("water_source_river", checked)
                      }
                    />
                    <Label className="mb-0">River</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.water_source_rain || false}
                      onChange={(checked) =>
                        handleInputChange("water_source_rain", checked)
                      }
                    />
                    <Label className="mb-0">Rain Water</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Support & Services Tab */}
          {activeTab === "support" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                  Outside Support
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.out_tea_stipend || false}
                      onChange={(checked) =>
                        handleInputChange("out_tea_stipend", checked)
                      }
                    />
                    <Label className="mb-0">Teacher Stipend</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.out_sch_fin || false}
                      onChange={(checked) =>
                        handleInputChange("out_sch_fin", checked)
                      }
                    />
                    <Label className="mb-0">School Finance</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.out_mat_support || false}
                      onChange={(checked) =>
                        handleInputChange("out_mat_support", checked)
                      }
                    />
                    <Label className="mb-0">Material Support</Label>
                  </div>
                  <div>
                    <Label htmlFor="out_who_support">
                      Who Provides Support
                    </Label>
                    <Input
                      id="out_who_support"
                      type="text"
                      placeholder="Enter organization name"
                      onChange={(e) =>
                        handleInputChange("out_who_support", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                  Community Support
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.com_tea_stipend || false}
                      onChange={(checked) =>
                        handleInputChange("com_tea_stipend", checked)
                      }
                    />
                    <Label className="mb-0">Teacher Stipend</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.com_food || false}
                      onChange={(checked) =>
                        handleInputChange("com_food", checked)
                      }
                    />
                    <Label className="mb-0">Food Support</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.com_sch_fin || false}
                      onChange={(checked) =>
                        handleInputChange("com_sch_fin", checked)
                      }
                    />
                    <Label className="mb-0">School Finance</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.com_mat_support || false}
                      onChange={(checked) =>
                        handleInputChange("com_mat_support", checked)
                      }
                    />
                    <Label className="mb-0">Material Support</Label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                  MOE Support
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.moe_tea_stipend || false}
                      onChange={(checked) =>
                        handleInputChange("moe_tea_stipend", checked)
                      }
                    />
                    <Label className="mb-0">Teacher Stipend</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.moe_mat_support || false}
                      onChange={(checked) =>
                        handleInputChange("moe_mat_support", checked)
                      }
                    />
                    <Label className="mb-0">Material Support</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Community Info Tab */}
          {activeTab === "community" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="vil_admin_level">Village Admin Level</Label>
                <Input
                  id="vil_admin_level"
                  type="text"
                  placeholder="Enter admin level"
                  onChange={(e) =>
                    handleInputChange("vil_admin_level", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="vil_transportation">Transportation</Label>
                <Input
                  id="vil_transportation"
                  type="text"
                  placeholder="Enter transportation info"
                  onChange={(e) =>
                    handleInputChange("vil_transportation", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="vil_livelihood">Livelihood</Label>
                <Input
                  id="vil_livelihood"
                  type="text"
                  placeholder="Enter livelihood info"
                  onChange={(e) =>
                    handleInputChange("vil_livelihood", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="vil_household">Number of Households</Label>
                <Input
                  id="vil_household"
                  type="number"
                  placeholder="Enter number"
                  onChange={(e) =>
                    handleInputChange("vil_household", parseInt(e.target.value))
                  }
                />
              </div>
              <div>
                <Label htmlFor="vil_ethnic">Village Ethnicity</Label>
                <Input
                  id="vil_ethnic"
                  type="text"
                  placeholder="Enter ethnicity"
                  onChange={(e) =>
                    handleInputChange("vil_ethnic", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="vil_main_lang">Main Language</Label>
                <Input
                  id="vil_main_lang"
                  type="text"
                  placeholder="Enter main language"
                  onChange={(e) =>
                    handleInputChange("vil_main_lang", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="vil_oth_lang">Other Languages</Label>
                <Input
                  id="vil_oth_lang"
                  type="text"
                  placeholder="Enter other languages"
                  onChange={(e) =>
                    handleInputChange("vil_oth_lang", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="religion_in_vil">Religion in Village</Label>
                <Input
                  id="religion_in_vil"
                  type="text"
                  placeholder="Enter religion"
                  onChange={(e) =>
                    handleInputChange("religion_in_vil", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="boys_oosc_5_18">
                  Boys Out of School (5-18)
                </Label>
                <Input
                  id="boys_oosc_5_18"
                  type="number"
                  placeholder="Enter number"
                  onChange={(e) =>
                    handleInputChange(
                      "boys_oosc_5_18",
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="girls_oosc_5_18">
                  Girls Out of School (5-18)
                </Label>
                <Input
                  id="girls_oosc_5_18"
                  type="number"
                  placeholder="Enter number"
                  onChange={(e) =>
                    handleInputChange(
                      "girls_oosc_5_18",
                      parseInt(e.target.value)
                    )
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
              onClick={() => router.push("/schools")}
            >
              Cancel
            </Button>
            <Button type="submit">Save School</Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
