import ExcelDataEditorPage from "@/components/excel-data-page/ExcelDataEditorPage"

export default function WomenLiteracyPage() {
  return (
    <ExcelDataEditorPage
      pageTitle="Women Literacy"
      apiPath="/api/women-literacy/excel"
      loadButtonLabel="Load Women Literacy"
      fileFallbackName="Women Literacy Excel File"
      emptyPrompt="Select a data year and data record to load the Women Literacy Excel file."
      dataTypeDescription="Women Literacy data uses excel_data records with data_type 17 by default."
      filterIdPrefix="women-literacy"
    />
  )
}
