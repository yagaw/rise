"use client"
import React, { useEffect, useRef, useCallback, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSidebar } from "../context/SidebarContext"
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  BoxCubeIcon,
  DownloadIcon,
  ListIcon,
} from "../icons/index"


type MenuType = "overview" | "be" | "eccd" | "ie" | "admin"

type NavItem = {
  name: string
  icon: React.ReactNode
  path?: string
  new?: boolean
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[]
}

const overviewItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Analysis Dashboard",
    path: "/dashboard",
  },
]

const beItems: NavItem[] = [
  {
    icon: <BoxCubeIcon />,
    name: "BE",
    subItems: [
      { name: "School", path: "/schools" },
      { name: "Teacher", path: "/teachers" },
      { name: "Classroom Observation", path: "/classroom-observation" },
      { name: "School QLE", path: "/school-qle" },
      { name: "Student", path: "/school_students" },
    ],
  },
]

const eccdItems: NavItem[] = [
  {
    icon: <BoxCubeIcon />,
    name: "ECCD",
    subItems: [
      { name: "School", path: "/eccd-school" },
      { name: "Teacher", path: "/eccd-teacher" },
      { name: "Classroom Observation", path: "/eccd-co" },
      { name: "School QLE", path: "/eccd-qle" },
      { name: "Student", path: "/eccd" },
    ],
  },
]

const ieItems: NavItem[] = [
  {
    icon: <BoxCubeIcon />,
    name: "IE",
    subItems: [
      { name: "School", path: "/ie-school" },
      { name: "Teacher", path: "/ie-teacher" },
      { name: "Classroom Observation", path: "/ie-classroom-observation" },
      { name: "School QLE", path: "/ie-qle" },
      { name: "Student", path: "/ie-student" },
    ],
  },
]

const adminItems: NavItem[] = [
  {
    icon: <DownloadIcon />,
    name: "Import Data",
    path: "/import",
  },
  {
    icon: <ListIcon />,
    name: "Excel Data",
    path: "/excel-data",
  },
  {
    icon: <ListIcon />,
    name: "Master Data",
    subItems: [
      { name: "Organizations", path: "/organizations" },
      { name: "User Accounts", path: "/user-accounts" },
      { name: "State / Region", path: "/state_region" },
      { name: "Townships", path: "/ts_mimu" },
      { name: "Subjects", path: "/subjects" },
      { name: "Teacher Types", path: "/teach_types" },
      { name: "Teacher Status", path: "/teacher_status" },
      { name: "Teacher Positions", path: "/techer_position" },
      { name: "Data Type", path: "/data_type" },
          { name: "Data Year", path: "/data_year" },
    ],
  },
]

const sections: { type: MenuType; label: string; items: NavItem[] }[] = [
  { type: "overview", label: "Overview", items: overviewItems },
  { type: "be", label: "Basic Education", items: beItems },
  { type: "eccd", label: "ECCD", items: eccdItems },
  { type: "ie", label: "Inclusive Education", items: ieItems },
  { type: "admin", label: "Administration", items: adminItems },
]

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const getInitialOpenSubmenu = (): { type: MenuType; index: number } | null => {
    for (const section of sections) {
      for (let index = 0; index < section.items.length; index++) {
        const nav = section.items[index]
        if (nav.subItems) {
          for (const subItem of nav.subItems) {
            if (subItem.path === pathname) {
              return { type: section.type, index }
            }
          }
        }
      }
    }
    return null
  }

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: MenuType
    index: number
  } | null>(getInitialOpenSubmenu())
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({})
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const isActive = useCallback((path: string) => path === pathname, [pathname])

  useEffect(() => {
    let submenuMatched = false
    for (const section of sections) {
      section.items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: section.type, index })
              submenuMatched = true
            }
          })
        }
      })
    }
    if (!submenuMatched) {
      setOpenSubmenu(null)
    }
  }, [pathname, isActive])

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }))
      }
    }
  }, [openSubmenu])

  const handleSubmenuToggle = (index: number, menuType: MenuType) => {
    setOpenSubmenu((prev) => {
      if (prev && prev.type === menuType && prev.index === index) {
        return null
      }
      return { type: menuType, index }
    })
  }

  const renderMenuItems = (navItems: NavItem[], menuType: MenuType) => (
    <ul className="flex flex-col gap-0.5">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
              }`}
            >
              <span
                className={
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }
              >
                {nav.icon}
              </span>
              {isMounted && (isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {isMounted && nav.new && (isExpanded || isHovered || isMobileOpen) && (
                <span
                  className={`ml-auto absolute right-10 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "menu-dropdown-badge-active"
                      : "menu-dropdown-badge-inactive"
                  } menu-dropdown-badge`}
                >
                  new
                </span>
              )}
              {isMounted && (isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }
                >
                  {nav.icon}
                </span>
                {isMounted && (isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {isMounted && nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-1 space-y-0.5 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-pro-active"
                                : "menu-dropdown-badge-pro-inactive"
                            } menu-dropdown-badge-pro`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  )

  return (
    <aside
      className={`fixed flex flex-col xl:mt-0 top-0 px-5 left-0 bg-white sidebar-accent dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-full transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
              ? "w-[290px]"
              : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        xl:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "xl:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
            <Image
              src="/images/logo/rise-logo.webp"
              alt="RISE Logo"
              width={150}
              height={40}
            />
          </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-5">
            {sections.map((section) => (
              <div key={section.type}>
                <h2
                  className={`mb-2 text-xs uppercase flex leading-5 tracking-wider font-semibold text-gray-400 dark:text-gray-500 ${
                    !isExpanded && !isHovered ? "xl:justify-center" : "justify-start"
                  }`}
                >
                  {isMounted && (isExpanded || isHovered || isMobileOpen) ? (
                    section.label
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(section.items, section.type)}
              </div>
            ))}
          </div>
        </nav>
        
      </div>
    </aside>
  )
}

export default AppSidebar
