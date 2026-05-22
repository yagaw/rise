import ExcelDataEditorPage from "@/components/excel-data-page/ExcelDataEditorPage"

export default function ClassroomObservationPage() {
  return (
    <ExcelDataEditorPage
      pageTitle="Classroom Observation"
      apiPath="/api/classroom-observation/excel"
      loadButtonLabel="Load Classroom Observation"
      fileFallbackName="Classroom Observation Excel File"
      emptyPrompt="Select a data year and data record to load the Classroom Observation Excel file."
      dataTypeDescription="Classroom Observation data uses excel_data records with data_type 6 by default."
      filterIdPrefix="classroom-observation"
    />
  )
}
