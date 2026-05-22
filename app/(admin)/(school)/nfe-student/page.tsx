import ExcelDataEditorPage from "@/components/excel-data-page/ExcelDataEditorPage"

export default function NfeStudentPage() {
  return (
    <ExcelDataEditorPage
      pageTitle="Student NFE"
      apiPath="/api/nfe-student/excel"
      loadButtonLabel="Load Student NFE"
      fileFallbackName="Student NFE Excel File"
      emptyPrompt="Select a data year and data record to load the Student NFE Excel file."
      dataTypeDescription="Student NFE data uses excel_data records with data_type 15 by default."
      filterIdPrefix="nfe-student"
    />
  )
}
