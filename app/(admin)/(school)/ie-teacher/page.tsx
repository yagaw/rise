import ExcelDataEditorPage from "@/components/excel-data-page/ExcelDataEditorPage"

export default function IeTeacherPage() {
  return (
    <ExcelDataEditorPage
      pageTitle="IE Teacher"
      apiPath="/api/ie-teacher/excel"
      loadButtonLabel="Load IE Teacher"
      fileFallbackName="IE Teacher Excel File"
      emptyPrompt="Select a data year and data record to load the IE Teacher Excel file."
      dataTypeDescription="IE Teacher data uses excel_data records with data_type 9 by default."
      filterIdPrefix="ie-teacher"
    />
  )
}
