"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Form from "@/components/form/Form"
import Label from "@/components/form/Label"
import Input from "@/components/form/input/InputField"
import Button from "@/components/ui/button/Button"
import { DataType } from "@/types/dataType"

export default function EditDataTypePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<DataType>>({})
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchDataType = async () => {
      try {
        const response = await fetch(`/api/data_type/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch Data Type")
        }

        const data = (await response.json()) as DataType
        setFormData(data)
      } catch (error) {
        console.error(error)
        alert("Failed to load Data Type")
        router.push("/data_type")
      } finally {
        setLoading(false)
      }
    }

    fetchDataType()
  }, [id, router])

  const handleInputChange = (field: keyof DataType, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/data_type/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string }
        throw new Error(errorData.error || "Failed to update Data Type")
      }

      alert("Data Type updated successfully!")
      router.push("/data_type")
    } catch (error) {
      console.error(error)
      alert("Failed to update Data Type")
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
      <PageBreadcrumb pageTitle="Edit Data Type" />

      <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <Form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter name"
                defaultValue={formData.name}
                onChange={(event) =>
                  handleInputChange("name", event.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="short">Short</Label>
              <Input
                id="short"
                type="text"
                placeholder="Enter short name"
                defaultValue={formData.short}
                onChange={(event) =>
                  handleInputChange("short", event.target.value)
                }
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
              onClick={() => router.push("/data_type")}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}