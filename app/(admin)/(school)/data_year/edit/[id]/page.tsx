"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Form from "@/components/form/Form"
import Label from "@/components/form/Label"
import Input from "@/components/form/input/InputField"
import TextArea from "@/components/form/input/TextArea"
import Button from "@/components/ui/button/Button"
import { DataYear } from "@/types/dataYear"

export default function EditDataYearPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<DataYear>>({})
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchDataYear = async () => {
      try {
        const response = await fetch(`/api/data_year/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch Data Year")
        }

        const data = (await response.json()) as DataYear
        setFormData(data)
      } catch (error) {
        console.error(error)
        alert("Failed to load Data Year")
        router.push("/data_year")
      } finally {
        setLoading(false)
      }
    }

    fetchDataYear()
  }, [id, router])

  const handleInputChange = (field: keyof DataYear, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/data_year/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string }
        throw new Error(errorData.error || "Failed to update Data Year")
      }

      alert("Data Year updated successfully!")
      router.push("/data_year")
    } catch (error) {
      console.error(error)
      alert("Failed to update Data Year")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Data Year" />

      <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <Form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter title"
                defaultValue={formData.title}
                onChange={(event) =>
                  handleInputChange("title", event.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                defaultValue={formData.start_date}
                onChange={(event) =>
                  handleInputChange("start_date", event.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                defaultValue={formData.end_date}
                onChange={(event) =>
                  handleInputChange("end_date", event.target.value)
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="remark">Remark</Label>
              <TextArea
                id="remark"
                rows={4}
                value={formData.remark || ""}
                onChange={(value) => handleInputChange("remark", value)}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push("/data_year")}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
