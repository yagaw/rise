import ExcelDataEditorPage from "@/components/excel-data-page/ExcelDataEditorPage"

export default function SchoolQlePage() {
  return (
    <ExcelDataEditorPage
      pageTitle="School BE QLE"
      apiPath="/api/school-qle/excel"
      loadButtonLabel="Load School BE QLE"
      fileFallbackName="School BE QLE Excel File"
      emptyPrompt="Select a data year and data record to load the School BE QLE Excel file."
      dataTypeDescription="School BE QLE data uses excel_data records with data_type 5."
      filterIdPrefix="school-qle"
    />
  )
}
