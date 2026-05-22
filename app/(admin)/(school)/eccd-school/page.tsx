import ExcelDataEditorPage from "@/components/excel-data-page/ExcelDataEditorPage"

export default function EccdSchoolPage() {
  return (
    <ExcelDataEditorPage
      pageTitle="ECCD School"
      apiPath="/api/eccd-school/excel"
      loadButtonLabel="Load ECCD School"
      fileFallbackName="ECCD School Excel File"
      emptyPrompt="Select a data year and data record to load the ECCD School Excel file."
      dataTypeDescription="ECCD School data uses excel_data records with data_type 3 by default."
      filterIdPrefix="eccd-school"
    />
  )
}
