import ExcelDataEditorPage from "@/components/excel-data-page/ExcelDataEditorPage"

export default function EccdCoPage() {
  return (
    <ExcelDataEditorPage
      pageTitle="ECCD CO"
      apiPath="/api/eccd-co/excel"
      loadButtonLabel="Load ECCD CO"
      fileFallbackName="ECCD CO Excel File"
      emptyPrompt="Select a data year and data record to load the ECCD CO Excel file."
      dataTypeDescription="ECCD CO data uses excel_data records with data_type 8 by default."
      filterIdPrefix="eccd-co"
    />
  )
}
