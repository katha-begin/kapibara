import pandas as pd
import json
from datetime import datetime, timedelta

# Define file paths
TICKET_DATA_PATH = 'src/data/ticketdata_example.csv'
TIMESHEET_DATA_PATH = 'src/data/timesheetdata_example.csv'
STATIC_DATA_PATH = 'src/data/static_data.json'
PROJECTS_ADMIN_PATH = 'src/data/projects_admin.json'
STUDIO_CONFIG_PATH = 'src/data/studio_config.json'
PROCESSED_DATA_PATH = 'src/data/processed_data.json'

# Manday definition (hours per manday)
HOURS_PER_MANDAY = 8

def calculate_working_days(start_date, end_date, working_day_dates):
    """Calculates working days between two dates based on a list of working day dates."""
    if start_date is None or end_date is None:
        return 0
    count = 0
    current_date = start_date
    while current_date <= end_date:
        if current_date in working_day_dates:
            count += 1
        current_date += timedelta(days=1)
    return count

def process_data():
    """Processes raw data to generate project and user KPIs with weekly snapshots."""

    # Read input files
    try:
        ticket_df = pd.read_csv(TICKET_DATA_PATH)
        timesheet_df = pd.read_csv(TIMESHEET_DATA_PATH)
        with open(STATIC_DATA_PATH, 'r') as f:
            static_data = json.load(f)
        with open(PROJECTS_ADMIN_PATH, 'r') as f:
            projects_admin_data = json.load(f)
        with open(STUDIO_CONFIG_PATH, 'r') as f:
            studio_config = json.load(f)
    except FileNotFoundError as e:
        print(f"Error: Input file not found - {e}")
        return
    except json.JSONDecodeError as e:
        print(f"Error: Could not decode JSON file - {e}")
        return

    status_weights = static_data.get('default', {})
    # Assume studio_config has a list of working dates in 'working_days'
    working_day_dates = [datetime.strptime(d, '%Y-%m-%d').date() for d in studio_config.get('working_days', [])]

    # --- Data Cleaning and Preparation ---
    ticket_df['create_date'] = pd.to_datetime(ticket_df['create_date'])
    ticket_df['start_date'] = pd.to_datetime(ticket_df['start_date'])
    ticket_df['due_date'] = pd.to_datetime(ticket_df['due_date'])
    ticket_df['current_status_changed_date'] = pd.to_datetime(ticket_df['current_status_changed_date'])
    timesheet_df['DATE'] = pd.to_datetime(timesheet_df['DATE'])

    # Calculate ticket duration (in days for simplicity, adjust if needed)
    # Handle potential NaT values after conversion
    ticket_df['duration'] = (ticket_df['due_date'] - ticket_df['start_date']).dt.days.fillna(0)

    # Calculate ticket weight score
    ticket_df['status_weight'] = ticket_df['current_status'].apply(lambda x: status_weights.get(x, 0.0))
    ticket_df['ticket_weight_score'] = ticket_df['status_weight'] * ticket_df['duration']

    # Process projects admin data
    projects_admin_map = {p['project_name']: p for p in projects_admin_data}

    # Get unique projects and users
    all_projects = ticket_df['project_name'].unique().tolist()
    all_users = timesheet_df['USERNAME'].unique().tolist()

    # Determine the range of weeks for weekly snapshots
    min_date = min(ticket_df['create_date'].min(), timesheet_df['DATE'].min())
    max_date = max(ticket_df['current_status_changed_date'].max(), timesheet_df['DATE'].max())
    # Start from the first Monday before the min_date and end on the last Sunday after the max_date
    start_week = min_date - timedelta(days=min_date.weekday())
    end_week = max_date + timedelta(days=(6 - max_date.weekday()))
    weeks = pd.date_range(start=start_week, end=end_week, freq='W-MON') # Weekly snapshots ending on Sunday

    processed_data = {'projects': [], 'users': []}

    # --- Process Project Data ---
    for project_name in all_projects:
        project_data = {
            'project_name': project_name,
            'weekly_data': [],
            'latest_summary': {} # To store the final weekly summary
        }
        project_tickets = ticket_df[ticket_df['project_name'] == project_name].copy()
        project_timesheet = timesheet_df[timesheet_df['PROJECT'] == project_name].copy()

        project_admin_info = projects_admin_map.get(project_name, {})
        total_manday_allocation = project_admin_info.get('allocatedMandays', 0)
        project_start_date = pd.to_datetime(project_admin_info.get('startDate'))
        project_end_date = pd.to_datetime(project_admin_info.get('endDate'))

        # Calculate total project ticket duration for completion rate denominator
        total_project_ticket_duration = project_tickets.groupby('ticket_id')['duration'].first().sum()


        for week_end_date in weeks:
            week_start_date = week_end_date - timedelta(days=6)

            # Filter data up to the end of the current week
            tickets_up_to_week = project_tickets[project_tickets['current_status_changed_date'] <= week_end_date].copy()
            timesheet_up_to_week = project_timesheet[project_timesheet['DATE'] <= week_end_date].copy()

            # Calculate cumulative weekly total ticket weight score
            cumulative_total_ticket_weight_score = tickets_up_to_week.groupby('ticket_id')['ticket_weight_score'].last().sum()

            # Calculate cumulative weekly actual mandays
            cumulative_actual_hours = timesheet_up_to_week['HOURS'].sum()
            cumulative_actual_mandays = cumulative_actual_hours / HOURS_PER_MANDAY

            # Calculate weekly project KPI ratio
            # Avoid division by zero
            kpis_ratio = 0
            if total_manday_allocation > 0 and cumulative_actual_mandays > 0:
                 # Sum of the total weight score from status divide by sum total ticket weight score
                sum_of_current_status_weight_score = tickets_up_to_week.groupby('ticket_id')['status_weight'].last().sum()
                total_possible_weight_score = tickets_up_to_week.groupby('ticket_id')['duration'].first().sum() * 1.0 # Assuming max status weight is 1.0
                if total_possible_weight_score > 0:
                     kpi_numerator = sum_of_current_status_weight_score / total_possible_weight_score
                else:
                     kpi_numerator = 0


                kpi_denominator = cumulative_actual_mandays / total_manday_allocation

                if kpi_denominator > 0:
                    kpis_ratio = kpi_numerator / kpi_denominator


            # Calculate weekly completion rate
            completion_rate = 0
            if total_project_ticket_duration > 0:
                 cumulative_ticket_duration_weighted = tickets_up_to_week.groupby('ticket_id').apply(
                    lambda x: x.sort_values('current_status_changed_date').iloc[-1]['status_weight'] * x.iloc[0]['duration']
                 ).sum()

                 completion_rate = (cumulative_ticket_duration_weighted / total_project_ticket_duration) * 100


            # Aggregate by department weekly
            department_mandays_weekly = timesheet_up_to_week.groupby('Department')['HOURS'].sum().reset_index()
            department_mandays_weekly['mandays'] = department_mandays_weekly['HOURS'] / HOURS_PER_MANDAY
            department_mandays_weekly = department_mandays_weekly[['Department', 'mandays']].to_dict('records')


            project_data['weekly_data'].append({
                'week_end_date': week_end_date.strftime('%Y-%m-%d'),
                'cumulative_total_ticket_weight_score': cumulative_total_ticket_weight_score,
                'cumulative_actual_mandays': cumulative_actual_mandays,
                'kpis_ratio': kpis_ratio,
                'completion_rate': completion_rate,
                'department_mandays': department_mandays_weekly
            })

        # Store the latest weekly summary
        if project_data['weekly_data']:
            project_data['latest_summary'] = project_data['weekly_data'][-1]

        processed_data['projects'].append(project_data)


    # --- Process User Data ---
    for username in all_users:
        user_data = {
            'username': username,
            'weekly_data': [],
            'annual_summary': {} # To store the final annual summary
        }
        user_tickets = ticket_df[ticket_df['assignee'] == username].copy()
        user_timesheet = timesheet_df[timesheet_df['USERNAME'] == username].copy()

        # Filter tickets assigned to the user with due dates within the current year for Contribution
        current_year = datetime.now().year
        user_tickets_this_year = user_tickets[(user_tickets['due_date'].dt.year == current_year) | (user_tickets['start_date'].dt.year == current_year)].copy()
        total_project_tickets_this_year = ticket_df[(ticket_df['due_date'].dt.year == current_year) | (ticket_df['start_date'].dt.year == current_year)].groupby('ticket_id').first().shape[0]
        user_assigned_tickets_this_year = user_tickets_this_year.groupby('ticket_id').first().shape[0]


        for week_end_date in weeks:
            week_start_date = week_end_date - timedelta(days=6)

            # Filter data up to the end of the current week
            user_tickets_up_to_week = user_tickets[user_tickets['current_status_changed_date'] <= week_end_date].copy()
            user_timesheet_up_to_week = user_timesheet[user_timesheet['DATE'] <= week_end_date].copy()

            # Calculate cumulative weekly user timeliness to complete score
            # Similar logic to project KPI numerator, but for user's tickets
            cumulative_user_ticket_weight_score = user_tickets_up_to_week.groupby('ticket_id')['ticket_weight_score'].last().sum()
            total_user_possible_weight_score = user_tickets_up_to_week.groupby('ticket_id')['duration'].first().sum() * 1.0 # Assuming max status weight is 1.0

            user_timeliness_score = 0
            if total_user_possible_weight_score > 0:
                 user_timeliness_score = cumulative_user_ticket_weight_score / total_user_possible_weight_score


            # Calculate cumulative weekly user actual mandays
            cumulative_user_actual_hours = user_timesheet_up_to_week['HOURS'].sum()
            cumulative_user_actual_mandays = cumulative_user_actual_hours / HOURS_PER_MANDAY

            # Calculate weekly user utilization
            current_total_working_days = calculate_working_days(start_week.date(), week_end_date.date(), working_day_dates) # Working days up to this week
            user_utilization = 0
            if current_total_working_days > 0:
                 user_utilization = (cumulative_user_actual_mandays / current_total_working_days) * HOURS_PER_MANDAY # Utilization in hours per working day



            user_data['weekly_data'].append({
                'week_end_date': week_end_date.strftime('%Y-%m-%d'),
                'cumulative_user_ticket_weight_score': cumulative_user_ticket_weight_score,
                'cumulative_user_actual_mandays': cumulative_user_actual_mandays,
                'user_timeliness_score': user_timeliness_score,
                'user_utilization': user_utilization
            })

        # Calculate annual user contribution
        user_contribution = 0
        if total_project_tickets_this_year > 0:
            user_contribution = (user_assigned_tickets_this_year / total_project_tickets_this_year) * 100

        user_data['annual_summary'] = {
            'contribution': user_contribution
        }
        # Add the latest weekly data to the annual summary for convenience if needed
        if user_data['weekly_data']:
             user_data['annual_summary']['latest_weekly_data'] = user_data['weekly_data'][-1]


        processed_data['users'].append(user_data)

    # Write output JSON file
    with open(PROCESSED_DATA_PATH, 'w') as f:
        json.dump(processed_data, f, indent=4)

    print(f"Data processing complete. Output saved to {PROCESSED_DATA_PATH}")

if __name__ == "__main__":
    process_data()