import ExcelDataEditorPage from "@/components/excel-data-page/ExcelDataEditorPage"

export default function TeesStudentPage() {
  return (
    <ExcelDataEditorPage
      pageTitle="Student TEES"
      apiPath="/api/tees-student/excel"
      loadButtonLabel="Load Student TEES"
      fileFallbackName="Student TEES Excel File"
      emptyPrompt="Select a data year and data record to load the Student TEES Excel file."
      dataTypeDescription="Student TEES data uses excel_data records with data_type 16 by default."
      filterIdPrefix="tees-student"
    />
  )
}
