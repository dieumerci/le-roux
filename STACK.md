# React Stack Reference

## Foundation

| Package | Use |
|---|---|
| `shadcn/ui` | Core UI components — buttons, dialogs, inputs, cards. Copy-paste into your project, full Tailwind control. |
| `lucide-react` | Clean, consistent icon set. One import per icon, works perfectly with Tailwind sizing. |
| `clsx` | Conditional class names without conflicts. Essential once you start using Shadcn components. |
| `tailwind-merge` | Merges conflicting Tailwind classes cleanly. Required alongside clsx when using Shadcn. |

---

## Forms & Validation

| Package | Use |
|---|---|
| `react-hook-form` | All appointment and contact forms. Minimal re-renders, great performance. |
| `zod` | Schema validation paired with React Hook Form. Validates form data before it hits your API. |

---

## Data Fetching & State

| Package | Use |
|---|---|
| `@tanstack/react-query` | Fetching, caching and syncing all data from your Rails backend. Handles loading and error states cleanly. |
| `zustand` | Global state management. Only add when prop drilling becomes painful — lightweight alternative to Redux. |

---

## Calendar & Dates

| Package | Use |
|---|---|
| `@fullcalendar/react` | Main appointment calendar. Month/week/day views, drag-to-reschedule, time slot support. |
| `@fullcalendar/daygrid` | Month view plugin for FullCalendar. |
| `@fullcalendar/timegrid` | Week and day time slot views for FullCalendar. |
| `date-fns` | Date manipulation and formatting throughout the app. Pairs naturally with FullCalendar. |
| `react-datepicker` | Date/time inputs inside forms — booking date, appointment time. Lighter than FullCalendar for input fields. |

---

## Dashboard & Analytics

| Package | Use |
|---|---|
| `@tanstack/react-table` | All data tables in the dashboard — appointments, contacts, conversation history. Headless, fully customisable. |
| `@tremor/react` | Stats cards, KPIs, and charts built for dashboards. Tailwind-based and looks polished out of the box. |
| `recharts` | Custom charts Tremor doesn't cover. Use for anything more bespoke like conversation volume over time. |

---

## Chat & WhatsApp Display

| Package | Use |
|---|---|
| `@chatscope/chat-ui-kit-react` | Pre-built chat bubbles and message lists for displaying WhatsApp conversation history in the dashboard. |
| `react-dropzone` | Drag-and-drop file upload for importing historical WhatsApp chat exports through the dashboard. |

---

## Notifications, Animation & Drag and Drop

| Package | Use |
|---|---|
| `sonner` | Toast notifications for confirmations, errors, and system alerts. Minimal and clean. |
| `framer-motion` | Page transitions and UI polish. Add last once the app is functional — don't use it on everything. |
| `@formkit/auto-animate` | Smooth list and table animations with one line of code. Great for the dashboard when rows update. |
| `@dnd-kit/core` | Drag-to-reschedule appointments on the calendar. Only needed once that feature is being built. |
| `@dnd-kit/sortable` | Sortable list plugin for dnd-kit. Used alongside @dnd-kit/core. |

---

## Suggested Install Order

> Install as you build each feature — don't add everything upfront.

### 1. Foundation
```bash
npx shadcn-ui@latest init
npm install lucide-react clsx tailwind-merge
```

### 2. Forms & Validation
```bash
npm install react-hook-form zod @hookform/resolvers
```

### 3. Data Fetching
```bash
npm install @tanstack/react-query axios
```

### 4. Calendar Feature
```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction date-fns react-datepicker
```

### 5. Dashboard & Tables
```bash
npm install @tanstack/react-table @tremor/react recharts
```

### 6. Notifications
```bash
npm install sonner
```

### 7. Chat Display & File Upload
```bash
npm install @chatscope/chat-ui-kit-react react-dropzone
```

### 8. State Management *(only if needed)*
```bash
npm install zustand
```

### 9. Animation & Polish *(add last)*
```bash
npm install framer-motion @formkit/auto-animate
```

### 10. Drag & Drop *(when building that feature)*
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```
