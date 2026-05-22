import ExcelDataEditorPage from "@/components/excel-data-page/ExcelDataEditorPage"

export default function EccdStudentPage() {
  return (
    <ExcelDataEditorPage
      pageTitle="Student ECCD"
      apiPath="/api/eccd-student/excel"
      loadButtonLabel="Load Student ECCD"
      fileFallbackName="Student ECCD Excel File"
      emptyPrompt="Select a data year and data record to load the Student ECCD Excel file."
      dataTypeDescription="Student ECCD data uses excel_data records with data_type 14 by default."
      filterIdPrefix="eccd-student"
    />
  )
}
