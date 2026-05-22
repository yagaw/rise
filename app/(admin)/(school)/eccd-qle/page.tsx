import ExcelDataEditorPage from "@/components/excel-data-page/ExcelDataEditorPage"

export default function EccdQlePage() {
  return (
    <ExcelDataEditorPage
      pageTitle="ECCD QLE"
      apiPath="/api/eccd-qle/excel"
      loadButtonLabel="Load ECCD QLE"
      fileFallbackName="ECCD QLE Excel File"
      emptyPrompt="Select a data year and data record to load the ECCD QLE Excel file."
      dataTypeDescription="ECCD QLE data uses excel_data records with data_type 7 by default."
      filterIdPrefix="eccd-qle"
    />
  )
}
