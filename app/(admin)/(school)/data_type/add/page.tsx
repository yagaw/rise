"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Form from "@/components/form/Form"
import Label from "@/components/form/Label"
import Input from "@/components/form/input/InputField"
import Button from "@/components/ui/button/Button"
import { DataType } from "@/types/dataType"

export default function AddDataTypePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<DataType>>({})

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

      const response = await fetch("/api/data_type", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string }
        throw new Error(errorData.error || "Failed to create Data Type")
      }

      alert("Data Type added successfully!")
      router.push("/data_type")
    } catch (error) {
      console.error(error)
      alert("Failed to add Data Type")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Data Type" />

      <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <Form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter name"
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
              {isSubmitting ? "Creating..." : "Create Data Type"}
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