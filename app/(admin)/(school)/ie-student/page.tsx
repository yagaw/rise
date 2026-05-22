import ExcelDataEditorPage from "@/components/excel-data-page/ExcelDataEditorPage"

export default function IeStudentPage() {
  return (
    <ExcelDataEditorPage
      pageTitle="Student IE"
      apiPath="/api/ie-student/excel"
      loadButtonLabel="Load Student IE"
      fileFallbackName="Student IE Excel File"
      emptyPrompt="Select a data year and data record to load the Student IE Excel file."
      dataTypeDescription="Student IE data uses excel_data records with data_type 13 by default."
      filterIdPrefix="ie-student"
    />
  )
}
