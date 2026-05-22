import ExcelDataEditorPage from "@/components/excel-data-page/ExcelDataEditorPage"

export default function SchoolsPage() {
  return (
    <ExcelDataEditorPage
      pageTitle="Schools"
      apiPath="/api/schools/excel"
      loadButtonLabel="Load School List"
      fileFallbackName="School Excel File"
      emptyPrompt="Select a data year and data record to load the school Excel file."
      dataTypeDescription="School data uses excel_data records with data_type 1."
      filterIdPrefix="school"
    />
  )
}
