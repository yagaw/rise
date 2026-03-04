# TailAdmin Pro - Next.js (v2.2)

[TailAdmin](https://tailadmin.com) is a modern, responsive, and customizable admin dashboard template built using
Tailwind CSS and Next.js. It is designed to help developers build beautiful and functional dashboards quickly and
easily.

## Quick Links

- [✨ Visit Website](https://tailadmin.com)
- [📄 Documentation](https://tailadmin.com/docs)
- [⬇️ Download](https://tailadmin.com/download)
- [🌐 Live Site](https://nextjs-demo.tailadmin.com)

## Installation

### Prerequisites

To get started with TailAdmin, ensure you have the following prerequisites installed and set up:

- Node.js 18.x or later (recommended to use Node.js 20.x or later)

### Getting Started

1. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

   > Use `--legacy-peer-deps` flag if you face peer-dependency error during installation.

2. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Supabase Setup (Schools)

This project now uses Supabase for school CRUD in the `/schools` pages.
The setup follows the modern `@supabase/ssr` pattern (replacement for `@supabase/auth-helpers-nextjs`).

1. Copy environment template:

```bash
cp .env.example .env.local
```

2. Set your Supabase project values in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SCHOOLS_TABLE` (defaults to `sp_ease`)
- `SUPABASE_TEACHERS_TABLE` (defaults to `tp_ease`)
- `SUPABASE_SCHOOL_QLE_TABLE` (defaults to `qle_ease`)
- `SUPABASE_ECCD_TABLE` (defaults to `eccd_ease`)
- `SUPABASE_TEES_TABLE` (defaults to `tees_ease`)
- `SUPABASE_DATA_YEAR_TABLE` (defaults to `data_year`)

3. Ensure your Supabase database has tables named `sp_ease`, `tp_ease`, `qle_ease`, `eccd_ease`, `tees_ease`, and `data_year` (or set different names via `SUPABASE_SCHOOLS_TABLE`, `SUPABASE_TEACHERS_TABLE`, `SUPABASE_SCHOOL_QLE_TABLE`, `SUPABASE_ECCD_TABLE`, `SUPABASE_TEES_TABLE`, and `SUPABASE_DATA_YEAR_TABLE`) with columns matching `types/school.ts`, `types/teacher.ts`, `types/schoolQle.ts`, `types/eccdStudent.ts`, `types/teesStudent.ts`, and `types/dataYear.ts`.

4. If you get `row-level security policy` errors for School QLE CRUD, run:

- SQL script: `supabase/qle_ease_rls.sql`

4. Supabase helpers used in this project:

- Browser client: `lib/supabase/client.ts`
- Server/route handler client: `lib/supabase/server.ts`
- Session middleware: `middleware.ts` + `lib/supabase/middleware.ts`

## Changelog

### Version 2.2.0 - [July 30, 2025]

- Fixed reported minor bugs and UI issues
- Updated packages

#### 🧭 **Logistics Dashboard** – _Added_

- Redesigned logistics dashboard interface
- Delivery activity table
- Delivery tracking timeline
- Total revenue earned chart

#### 🛍️ **E-commerce Pages** – _Added_

- **Products**:
  - Product list table
  - Add product form

- **Invoices**:
  - Invoice list table
  - Single invoice view
  - View invoice modal
  - Create invoice form

- **Transactions**:
  - Transaction list table
  - Single transaction detail view

#### 🧠 **AI Assistant Suite (New App Example)** – _Newly Added_

- Text generator
- Image generator
- Code generator
- Video generator

#### 🔑 **API Key Management** – _Newly Added_

- API key dashboard
- API key table view
- Add API key modal

#### 🔌 **Integrations (Pages)** – _Newly Added_

- Integration cards UI
- Integration details modal
- Add integration modal
- Integration settings modal
- Delete integration confirmation modal

### ⚙️ **Support (New App Example)** – _Newly Added_

- Support ticket list page
- Support ticket reply interface

#### 📊 **Charts & Visuals** - _Imporoved_

- New bar chart design added

### Version 2.1.2 - [Jun 02, 2025]

#### Update Overview

- Basic Table 3 Dropdown (cropped) update
- Popover and Tooltip component overflow (cropped) issue update

### Version 2.1.1 - [March 25, 2025]

- Updated to Next v15.2.3 for [CVE-2025-29927](https://nextjs.org/blog/cve-2025-29927) concerns
- Included overrides vectormaps for packages to prevent peer dependency errors during installation.
- Migrated from react-flatpickr to flatpickr package for React 19 support

### Version 2.1.0 - [March 10, 2025]

#### Update Overview

- Added new dashboard design for saas product.
- New Metrics card
- Product performance tab with charts

### Version 2.0.1 - [February 27, 2025]

#### Update Overview

- Upgraded to Tailwind CSS v4 for better performance and efficiency.
- Updated class usage to match the latest syntax and features.
- Replaced deprecated class and optimized styles.

#### Next Steps

- Run npm install or yarn install to update dependencies.
- Check for any style changes or compatibility issues.
- Refer to the Tailwind CSS v4 [Migration Guide](https://tailwindcss.com/docs/upgrade-guide) on this release. if needed.
- This update keeps the project up to date with the latest Tailwind improvements. 🚀

### v2.0.0 (February 2025)

A major update focused on Next.js 15 implementation and comprehensive redesign.

#### Major Improvements

- Complete redesign using Next.js 15 App Router and React Server Components
- Enhanced user interface with Next.js-optimized components
- Improved responsiveness and accessibility
- New features including collapsible sidebar, chat screens, and calendar
- Redesigned authentication using Next.js App Router and server actions
- Updated data visualization using ApexCharts for React

#### Breaking Changes

- Migrated from Next.js 14 to Next.js 15
- Chart components now use ApexCharts for React
- Authentication flow updated to use Server Actions and middleware

#### Breaking Changes

- Migrated from Next.js 14 to Next.js 15
- Chart components now use ApexCharts for React
- Authentication flow updated to use Server Actions and middleware

[Read more](https://tailadmin.com/docs/update-logs/nextjs) on this release.

### v1.3.4 (July 01, 2024)

- Fixed JSvectormap rendering issues

### v1.3.3 (June 20, 2024)

- Fixed build error related to Loader component

### v1.3.2 (June 19, 2024)

- Added ClickOutside component for dropdown menus
- Refactored sidebar components
- Updated Jsvectormap package

### v1.3.1 (Feb 12, 2024)

- Fixed layout naming consistency
- Updated styles

### v1.3.0 (Feb 05, 2024)

- Upgraded to Next.js 14
- Added Flatpickr integration
- Improved form elements
- Enhanced multiselect functionality
- Added default layout component

## License

Refer to our [LICENSE](https://tailadmin.com/license) page for more information.
