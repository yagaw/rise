import ExcelDataEditorPage from "@/components/excel-data-page/ExcelDataEditorPage"

export default function TeachersPage() {
  return (
    <ExcelDataEditorPage
      pageTitle="Teachers"
      apiPath="/api/teachers/excel"
      loadButtonLabel="Load Teacher List"
      fileFallbackName="Teacher Excel File"
      emptyPrompt="Select a data year to load the teacher Excel file."
      dataTypeDescription="Teacher data uses excel_data records with data_type 2."
      filterIdPrefix="teacher"
    />
  )
}
