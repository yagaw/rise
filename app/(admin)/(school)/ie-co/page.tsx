import ExcelDataEditorPage from "@/components/excel-data-page/ExcelDataEditorPage"

export default function IeCoPage() {
  return (
    <ExcelDataEditorPage
      pageTitle="IE CO"
      apiPath="/api/ie-co/excel"
      loadButtonLabel="Load IE CO"
      fileFallbackName="IE CO Excel File"
      emptyPrompt="Select a data year and data record to load the IE CO Excel file."
      dataTypeDescription="IE CO data uses excel_data records with data_type 12 by default."
      filterIdPrefix="ie-co"
    />
  )
}
