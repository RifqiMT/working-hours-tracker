# User Stories  
## Working Hours Tracker

Stories are grouped by epic. Format: **As a** [persona], **I want** [action] **so that** [benefit].  
Personas: Individual worker, Contractor, Team lead, HR/Compliance, Solo freelancer. See [USER_PERSONAS.md](USER_PERSONAS.md).

---

## Epic 1: Profiles

| ID | Story | Persona |
|----|--------|---------|
| US-P1 | As an **Individual worker**, I want to create and switch between profiles so that I can separate work contexts (e.g. personal vs contract). | Individual worker / Contractor |
| US-P2 | As an **Individual worker**, I want to see the current profile’s role so that I know which context I am in. | Individual worker |
| US-P3 | As an **Individual worker**, I want to edit a profile’s name and role so that I can keep labels up to date. | Individual worker |
| US-P4 | As a **Contractor**, I want to set vacation days per year per profile so that I can track allowance per client or contract. | Contractor |
| US-P5 | As an **Individual worker**, I want to delete a profile with confirmation so that I can remove a context when no longer needed (with at least one profile remaining). | Individual worker |

---

## Epic 2: Clock and entry

| ID | Story | Persona |
|----|--------|---------|
| US-C1 | As an **Individual worker**, I want to use Clock In and Clock Out for the selected date so that I can quickly log current time without typing. | Individual worker |
| US-C2 | As an **Individual worker**, I want to add or edit an entry with date, clock in/out, break, day status, location, timezone, and description so that I have full control when needed. | Individual worker |
| US-C3 | As an **Individual worker**, I want default times applied when I set day status to sick, holiday, or vacation so that I don’t have to fill times for non-work days. | Individual worker |
| US-C4 | As a **Solo freelancer**, I want each entry to have a timezone (default Germany, Berlin) so that my hours are stored correctly when I work in different zones. | Solo freelancer |

---

## Epic 3: Filters and entries table

| ID | Story | Persona |
|----|--------|---------|
| US-F1 | As an **Individual worker**, I want to filter entries by year, month, day status, location, and duration (basic) so that I can narrow the list quickly. | Individual worker |
| US-F2 | As an **Individual worker**, I want advanced filters (week, day, day name, overtime, description) so that I can find specific entries. | Individual worker |
| US-F3 | As an **Individual worker**, I want “Show all dates” to include future entries when checked so that I can see planned or imported future data. | Individual worker |
| US-F4 | As an **Individual worker**, I want to reset all filters and clear calendar selection with one action so that I can start a new filter set. | Individual worker |
| US-F5 | As a **Solo freelancer**, I want to view table date and times in another timezone (“View times in”) so that I can read times in a chosen zone. | Solo freelancer |
| US-F6 | As an **Individual worker**, I want to select rows and edit one or delete selected with confirmation so that I can correct or remove entries safely. | Individual worker |
| US-F7 | As an **Individual worker**, I want to sort the table by date, duration, status, or location so that I can order the list as needed. | Individual worker |
| US-F8 | As an **Individual worker**, I want to toggle calendar days to filter by specific dates so that I can focus on chosen days. | Individual worker |

---

## Epic 4: Export and import

| ID | Story | Persona |
|----|--------|---------|
| US-X1 | As an **Individual worker**, I want to export filtered entries as CSV or JSON so that I can back up or share data. | Individual worker |
| US-X2 | As an **Individual worker**, I want to import CSV or JSON and merge by date and clock in so that I can combine data without losing existing entries. | Individual worker / Team lead |
| US-X3 | As a **Contractor**, I want to export per profile (by switching profile and exporting) so that I can send client-specific reports. | Contractor |

---

## Epic 5: Reporting (Statistics, Infographic, Key highlights PPT)

| ID | Story | Persona |
|----|--------|---------|
| US-R1 | As an **Individual worker**, I want to see total and average working hours and overtime and days by type in the Statistics card so that I get a quick summary of filtered data. | Individual worker |
| US-R2 | As an **Individual worker**, I want to open Statistics summary and view charts by Weekly/Monthly/Quarterly/Annually so that I can see trends over time. | Individual worker |
| US-R3 | As an **Individual worker**, I want to enlarge a chart and download it as PNG so that I can use it in reports or presentations. | Individual worker |
| US-R4 | As an **HR/Compliance** user, I want to open the Infographic and see vacation quota, used, and remaining so that I can verify vacation balance. | HR/Compliance |
| US-R5 | As an **Individual worker**, I want to export Infographic tables as CSV so that I can use them in other tools. | Individual worker |
| US-R6 | As a **Contractor** or **Team lead**, I want to generate Key highlights PowerPoint with selected years, metrics (days and hours), and trend slides so that I can present a yearly summary. | Contractor / Team lead |

---

## Epic 6: Calendar and vacation

| ID | Story | Persona |
|----|--------|---------|
| US-Cal1 | As an **Individual worker**, I want to see a month calendar with day-status colors and location dots so that I can scan my month at a glance. | Individual worker |
| US-Cal2 | As an **Individual worker**, I want to change month with arrows and have the calendar align with filters so that it stays in sync with the entries list. | Individual worker |
| US-Cal3 | As a **Contractor**, I want to set vacation days per year in the Vacation days modal so that the Infographic and PPT show correct quota and remaining. | Contractor |

---

## Epic 7: Help and feedback

| ID | Story | Persona |
|----|--------|---------|
| US-H1 | As any user, I want a help button (ⓘ) per section that opens section-specific help so that I can learn without leaving the page. | All |
| US-H2 | As any user, I want a toast after import or other actions so that I get clear feedback on success or issues. | All |

---

## Reference

- **Personas:** [USER_PERSONAS.md](USER_PERSONAS.md)  
- **PRD:** [PRD.md](PRD.md)  
- **Full documentation:** [README.md](../README.md)  
- **Product documentation standard:** [PRODUCT_DOCUMENTATION_STANDARD.md](../PRODUCT_DOCUMENTATION_STANDARD.md)
