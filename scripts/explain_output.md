Explanation of the structure:

projects: This is a list of project objects.

project_name: The name of the project.
weekly_data: A list containing weekly snapshots of the project's progress and KPIs. Each object in this list represents a week.
week_end_date: The end date of the week (Sunday) in 'YYYY-MM-DD' format.
cumulative_total_ticket_weight_score: The cumulative sum of ticket weight scores for the project up to that week.
cumulative_actual_mandays: The cumulative actual mandays spent on the project up to that week.
kpis_ratio: The calculated KPI ratio for the project for that week.
completion_rate: The calculated completion rate for the project for that week.
department_mandays: A list of objects showing manday contributions per department for that week.
latest_summary: An object containing the data from the most recent week in the weekly_data list.
users: This is a list of user objects.

username: The username of the user.
weekly_data: A list containing weekly snapshots of the user's performance. Each object in this list represents a week.
week_end_date: The end date of the week (Sunday) in 'YYYY-MM-DD' format.
cumulative_user_ticket_weight_score: The cumulative sum of ticket weight scores for tickets assigned to the user up to that week.
cumulative_user_actual_mandays: The cumulative actual mandays spent by the user up to that week.
user_timeliness_score: The calculated timeliness score for the user for that week.
user_utilization: The calculated utilization rate for the user for that week.
annual_summary: An object containing an annual summary for the user.
contribution: The calculated user contribution percentage for the current year.
latest_weekly_data: An object containing the data from the most recent week in the weekly_data list for the user