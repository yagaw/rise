import ExcelDataEditorPage from "@/components/excel-data-page/ExcelDataEditorPage"

export default function EccdTeacherPage() {
  return (
    <ExcelDataEditorPage
      pageTitle="ECCD Teacher"
      apiPath="/api/eccd-teacher/excel"
      loadButtonLabel="Load ECCD Teacher"
      fileFallbackName="ECCD Teacher Excel File"
      emptyPrompt="Select a data year and data record to load the ECCD Teacher Excel file."
      dataTypeDescription="ECCD Teacher data uses excel_data records with data_type 4 by default."
      filterIdPrefix="eccd-teacher"
    />
  )
}
