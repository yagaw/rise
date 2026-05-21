import DashboardContent from "@/components/analytics/DashboardContent"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Analytics Dashboard | RISE Education Management",
  description:
    "Education analytics dashboard from uploaded excel_data files",
}

export default function Analytics() {
  return <DashboardContent />
}
