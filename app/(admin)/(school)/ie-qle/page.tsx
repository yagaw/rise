import ExcelDataEditorPage from "@/components/excel-data-page/ExcelDataEditorPage"

export default function IeQlePage() {
  return (
    <ExcelDataEditorPage
      pageTitle="IE QLE"
      apiPath="/api/ie-qle/excel"
      loadButtonLabel="Load IE QLE"
      fileFallbackName="IE QLE Excel File"
      emptyPrompt="Select a data year and data record to load the IE QLE Excel file."
      dataTypeDescription="IE QLE data uses excel_data records with data_type 11 by default."
      filterIdPrefix="ie-qle"
    />
  )
}
