# User Personas  
## Working Hours Tracker

Personas represent primary users of the tool. They inform features, user stories, and documentation.

---

## Persona 1: Individual worker (Primary)

| Attribute | Description |
|-----------|-------------|
| **Name** | Alex (Individual worker) |
| **Role** | Employee or contractor tracking own working hours and leave. |
| **Goals** | Record clock in/out and breaks accurately, track overtime, manage vacation and sick days, have one place for compliance or self-review. |
| **Pain points** | Spreadsheets are error-prone; no single place for hours and leave; hard to show “how much overtime” or “vacation used vs remaining.” |
| **Needs** | Quick clock in/out for the day, manual entry when needed, filters and table to review, Statistics and Infographic for totals and vacation, export CSV/JSON for records. |
| **Tech context** | Uses browser daily; prefers no sign-up or backend; may open index.html or run local server. |
| **Relevant features** | Profile, Clock In/Out, entry form, filters, entries table, Statistics card, Infographic, Export/Import. |

---

## Persona 2: Contractor / Multi-role worker

| Attribute | Description |
|-----------|-------------|
| **Name** | Sam (Contractor) |
| **Role** | Freelancer or contractor with multiple clients or contracts. |
| **Goals** | Separate hours per client/contract, set vacation allowance per context, export or report per profile for invoicing or audits. |
| **Pain points** | Mixing hours in one list is confusing; vacation quota is global instead of per contract. |
| **Needs** | One profile per client/contract; switch profile to log or view; vacation days per profile per year; export filtered or per profile; Key highlights PPT for yearly summary per profile. |
| **Tech context** | Comfortable with web apps; may use same browser for all profiles; backup via export. |
| **Relevant features** | Multiple profiles, vacation days per profile, Export/Import, Key highlights PPT, filters. |

---

## Persona 3: Team lead / Manager

| Attribute | Description |
|-----------|-------------|
| **Name** | Jordan (Team lead) |
| **Role** | Leads a small team; reviews hours and overtime for capacity or compliance. |
| **Goals** | See team members’ hours in one view (e.g. via shared export), check overtime and vacation usage, produce summary for management. |
| **Pain points** | Data in different tools or spreadsheets; no standard format for hours and leave. |
| **Needs** | Import CSV/JSON from team members (or use one profile per person if shared device); filters by period, status, overtime; Statistics summary and Infographic; Key highlights PPT for reporting. |
| **Tech context** | Uses browser; may collect exported files from team and import into one profile or compare exports. |
| **Relevant features** | Import/merge, filters (including Overtime), Statistics summary, Infographic, Key highlights PPT, Export. |

---

## Persona 4: HR / Compliance

| Attribute | Description |
|-----------|-------------|
| **Name** | Casey (HR/Compliance) |
| **Role** | HR or compliance officer ensuring work and leave records are complete and auditable. |
| **Goals** | Verify vacation quota vs used/remaining, ensure work/sick/holiday/vacation are recorded per day, obtain export for audits. |
| **Pain points** | Inconsistent or missing records; no clear vacation balance. |
| **Needs** | Day status and vacation tracking; vacation quota per year; Infographic for quota/used/remaining; Export CSV/JSON; optional Key highlights PPT for yearly summary. |
| **Tech context** | May receive exported files from employees or run app for spot checks. |
| **Relevant features** | Day status, Vacation days (quota), Infographic (vacation tables), Export, Key highlights PPT. |

---

## Persona 5: Solo freelancer / Remote worker

| Attribute | Description |
|-----------|-------------|
| **Name** | Morgan (Solo freelancer) |
| **Role** | Remote worker or freelancer tracking hours across timezones. |
| **Goals** | Log work in local timezone; view or export in another timezone; minimal setup; data stays private. |
| **Pain points** | Tools require sign-up or sync; timezone handling is wrong. |
| **Needs** | Per-entry timezone (default Europe/Berlin); “View times in” for table; searchable timezone pickers; single profile or few; export for client or backup. |
| **Tech context** | Opens index.html or local server; no account; relies on export for backup. |
| **Relevant features** | Timezone per entry, View times in, timezone pickers, Export/Import, filters. |

---

## Summary matrix

| Persona           | Primary use                 | Key features                                                |
|-------------------|-----------------------------|-------------------------------------------------------------|
| Individual worker | Daily hours and leave       | Clock In/Out, entry form, filters, Statistics, Infographic  |
| Contractor        | Per-client separation       | Profiles, vacation per profile, Export, Key highlights PPT |
| Team lead         | Review and reporting        | Import, filters, Statistics summary, Infographic, PPT      |
| HR/Compliance     | Audit and vacation balance  | Day status, vacation quota, Infographic, Export            |
| Solo freelancer   | Timezone and privacy        | Timezone, View times in, Export/Import                      |

For user stories derived from these personas, see [USER_STORIES.md](USER_STORIES.md). For full product documentation, see [README.md](../README.md).
