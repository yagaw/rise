import type { AnalyticsProgram } from "./useExcelAnalytics"

type ExportDashboardVisualOptions = {
  dashboardElement?: HTMLElement | null
  program: AnalyticsProgram
  programLabel: string
  dataYearLabel: string
  dataYearId: string
  organization: string
}

function formatOrganization(organization: string) {
  return organization === "all" ? "All organizations" : organization
}

function formatFileNamePart(value: string) {
  return value
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
}

function getFileName(options: ExportDashboardVisualOptions, extension: string) {
  return [
    "dashboard",
    formatFileNamePart(options.program),
    formatFileNamePart(options.dataYearLabel || options.dataYearId),
    formatFileNamePart(formatOrganization(options.organization)),
  ]
    .filter(Boolean)
    .join("-")
    .concat(`.${extension}`)
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement("a")

  link.href = dataUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = dataUrl
  })
}

async function captureDashboardImage(
  dashboardElement?: HTMLElement | null,
): Promise<string> {
  if (!dashboardElement) {
    throw new Error("Dashboard content is not ready for export.")
  }

  const { toPng } = await import("html-to-image")
  const backgroundColor = document.documentElement.classList.contains("dark")
    ? "#101828"
    : "#F9FAFB"
  const width = dashboardElement.scrollWidth
  const height = dashboardElement.scrollHeight

  return toPng(dashboardElement, {
    backgroundColor,
    cacheBust: true,
    height,
    pixelRatio: 1.5,
    width,
    style: {
      height: `${height}px`,
      maxWidth: "none",
      width: `${width}px`,
    },
    filter: (node) => {
      if (!(node instanceof HTMLElement)) return true
      return node.dataset.exportExclude !== "true"
    },
  })
}

export async function exportDashboardImage(
  options: ExportDashboardVisualOptions,
) {
  const dataUrl = await captureDashboardImage(options.dashboardElement)

  downloadDataUrl(dataUrl, getFileName(options, "png"))
}

export async function exportDashboardPdf(options: ExportDashboardVisualOptions) {
  const dataUrl = await captureDashboardImage(options.dashboardElement)
  const image = await loadImage(dataUrl)
  const { jsPDF } = await import("jspdf")
  const pdf = new jsPDF({
    compress: true,
    format: "a4",
    orientation: "portrait",
    unit: "mm",
  })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 8
  const printableWidth = pageWidth - margin * 2
  const printableHeight = pageHeight - margin * 2
  const imageHeight = (image.naturalHeight * printableWidth) / image.naturalWidth
  let renderedHeight = 0

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(12)
  pdf.text(
    `${options.programLabel} Dashboard | ${options.dataYearLabel} | ${formatOrganization(options.organization)}`,
    margin,
    6,
  )

  pdf.addImage(dataUrl, "PNG", margin, margin, printableWidth, imageHeight)
  renderedHeight += printableHeight

  while (renderedHeight < imageHeight) {
    pdf.addPage()
    pdf.addImage(
      dataUrl,
      "PNG",
      margin,
      margin - renderedHeight,
      printableWidth,
      imageHeight,
    )
    renderedHeight += printableHeight
  }

  pdf.save(getFileName(options, "pdf"))
}
