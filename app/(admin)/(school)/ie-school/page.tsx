import ExcelDataEditorPage from "@/components/excel-data-page/ExcelDataEditorPage"

export default function IeSchoolPage() {
  return (
    <ExcelDataEditorPage
      pageTitle="IE School"
      apiPath="/api/ie-school/excel"
      loadButtonLabel="Load IE School"
      fileFallbackName="IE School Excel File"
      emptyPrompt="Select a data year and data record to load the IE School Excel file."
      dataTypeDescription="IE School data uses excel_data records with data_type 10 by default."
      filterIdPrefix="ie-school"
    />
  )
}
