# Data Processing Formulas

This document details the formulas used to process the raw data from the two CSV files and admin control input into the structured JSON data used by the BizFlow Dashboard. The processing is performed weekly.

## Data Sources

1.  **Ticket Data CSV:** Contains ticket-level information including status, dates, and assignment.
2.  **Timesheet Data CSV:** Contains daily hours logged by users, associated with projects and departments.
3.  **Admin Control Data:** Provided via the frontend, includes project start/end dates, total manday allocation per project, and studio annual configuration (including total working days up to a given week).
4.  **`static_data.json`:** Contains status weights used for calculations.

## Formulas

### Ticket Weight Score

Calculated for each individual ticket.

**Formula:**

`Ticket Weight Score = Status Weight * Duration`

*   `Status Weight`: Looked up from `static_data.json` based on the ticket's `current_status`.
*   `Duration`: Calculated as the difference between `due_date` and `start_date` from the Ticket Data CSV. The unit (days or hours) should be consistent across all tickets.

### Total Ticket Weight Score (Cumulative Weekly)

Calculated for each project for each week.

**Formula:**

`Total Ticket Weight Score (Cumulative Weekly) = Sum of Ticket Weight Scores for all tickets in the project with a `current_status_changed_date` up to the end of the current week.`

*   This is a cumulative sum, adding the weight of tickets whose status changed to their current state within or before the current week.

### Actual Manday (Cumulative Weekly)

Calculated for each project, each user, and each department for each week.

**Formula:**

`Actual Manday (Cumulative Weekly) = (Sum of HOURS from Timesheet Data CSV for the relevant entity (project, user, or department) with a `DATE` up to the end of the current week) / 8`

*   The sum of `HOURS` is grouped by project, user, or department as needed.
*   Dividing by 8 converts total hours to mandays.

### Project KPIs Ratio (Cumulative Weekly)

Calculated for each project for each week. This represents the project score.

**Formula:**

`Project KPIs Ratio (Cumulative Weekly) = (Total Ticket Weight Score (Cumulative Weekly) / Total Project Ticket Duration) / (Actual Manday (Cumulative Weekly for Project) / Total Manday Allocation)`

*   `Total Project Ticket Duration`: Sum of the `Duration` for all tickets belonging to the project (calculated once). This represents the total possible weight for the project.
*   `Total Manday Allocation`: Provided from the Admin Control Data for the specific project.
*   `Total Ticket Weight Score (Cumulative Weekly)`: Calculated as described above.
*   `Actual Manday (Cumulative Weekly for Project)`: Calculated as described above, aggregated for the entire project.

### Completion Rate (Weekly Snapshot)

Calculated for each project for each week.

**Formula:**

`Completion Rate (Weekly Snapshot) = (Total Ticket Weight Score (Cumulative Weekly) / Total Project Ticket Duration) * 100%`

*   This formula uses the cumulative ticket weight achieved up to the current week compared to the total potential weight of the project.

### User KPI - Timeliness to Complete Score (Cumulative Weekly)

Calculated for each user for each week.

**Formula:**

`User KPI - Timeliness to Complete Score (Cumulative Weekly) = (Sum of Ticket Weight Scores for tickets assigned to the user with a `current_status_changed_date` up to the end of the current week) / (Sum of Durations for all tickets assigned to the user)`

*   This is similar to the project KPI but scoped to the tickets assigned to a specific user.

### User KPI - Utilization (Weekly Snapshot)

Calculated for each user for each week.

**Formula:**

`User KPI - Utilization (Weekly Snapshot) = Actual Manday (Cumulative Weekly for User) / Current Total Working Days up to the current week`

*   `Actual Manday (Cumulative Weekly for User)`: Calculated as described above, aggregated for the specific user.
*   `Current Total Working Days up to the current week`: Provided from the Admin Control Data (Studio Annual Config), representing the number of working days from the start of the year up to the end of the current week.

### User KPI - Contribution (Annual)

Calculated for each user annually (typically at the end of the year or for a specific year).

**Formula:**

`User KPI - Contribution (Annual) = (Number of tickets assigned to the user with start_date and due_date within the year) / (Total number of tickets in the project with start_date and due_date within the year)`

*   This calculation is based on the initial assignment of tickets within a given year, not necessarily their completion status.

### Aggregating by Department (Cumulative Weekly)

This is not a single formula but a process of grouping and summing the `Actual Manday (Cumulative Weekly)` data.

**Process:**

For each project and each week, group the `Actual Manday (Cumulative Weekly)` data from the Timesheet Data CSV by the `Department` column. This provides the cumulative manday contribution of each department to the project for that week. This data is used for department-specific visualizations.