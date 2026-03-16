import React from "react"
import Badge from "../ui/badge/Badge"

const mockData = [
  {
    id: 1,
    title: "Unique Visitors",
    value: "24.7K",
    change: "+20%",
    direction: "up",
    comparisonText: "Vs last month",
  },
  {
    id: 2,
    title: "Total Pageviews",
    value: "55.9K",
    change: "+4%",
    direction: "up",
    comparisonText: "Vs last month",
  },
  {
    id: 3,
    title: "Bounce Rate",
    value: "54%",
    change: "-1.59%",
    direction: "down",
    comparisonText: "Vs last month",
  },
  {
    id: 4,
    title: "Visit Duration",
    value: "2m 56s",
    change: "+7%",
    direction: "up",
    comparisonText: "Vs last month",
  },
]

type MetricItem = {
  id: number
  title: string
  value: string
  change: string
  direction: "up" | "down" | "warning"
  comparisonText: string
}

type Props = {
  items?: MetricItem[]
}

const gradientClasses = [
  "stat-gradient-blue",
  "stat-gradient-green",
  "stat-gradient-orange",
  "stat-gradient-purple",
]

const iconColors = [
  "bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400",
  "bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400",
  "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
]

const MetricIcon: React.FC<{ index: number }> = ({ index }) => {
  const icons = [
    // School
    <svg
      key="school"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
      />
    </svg>,
    // Students
    <svg
      key="students"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
      />
    </svg>,
    // Teachers
    <svg
      key="teachers"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>,
    // Calendar
    <svg
      key="calendar"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
      />
    </svg>,
  ]
  return icons[index % icons.length]
}

const AnalyticsMetrics: React.FC<Props> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {(items ?? mockData).map((item, index) => (
        <div
          key={item.id}
          className={`animate-card-enter hover-lift rounded-2xl border border-gray-200 p-5 dark:border-gray-800 ${gradientClasses[index % gradientClasses.length]}`}
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-theme-sm dark:text-gray-400">
              {item.title}
            </p>
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconColors[index % iconColors.length]}`}
            >
              <MetricIcon index={index} />
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
              {item.value}
            </h4>
            <div className="mt-2 flex items-center gap-1.5">
              <Badge
                color={
                  item.direction === "up"
                    ? "success"
                    : item.direction === "down"
                      ? "error"
                      : "warning"
                }
              >
                <span className="text-xs"> {item.change}</span>
              </Badge>
              <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                {item.comparisonText}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AnalyticsMetrics
