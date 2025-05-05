import pandas as pd
import json
from datetime import datetime, timedelta

# Define file paths
TICKET_DATA_PATH = 'src/data/kracker_data_2024_2025.csv'
TIMESHEET_DATA_PATH = 'src/data/time_record_2024_2025.csv'
STATIC_DATA_PATH = 'src/data/static_data.json'
PROJECTS_ADMIN_PATH = 'src/data/projects_admin.json'
STUDIO_CONFIG_PATH = 'src/data/studio_config.json'
PROCESSED_DATA_PATH = 'src/data/processed_data.json'

# Manday definition (hours per manday)
DEFAULT_HOURS_PER_MANDAY = 8

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
        # Try different delimiters and encoding options
        try:
            # First try with default settings
            ticket_df = pd.read_csv(TICKET_DATA_PATH, low_memory=False)
            if len(ticket_df.columns) <= 1:
                # If only one column is detected, try with explicit delimiter
                ticket_df = pd.read_csv(TICKET_DATA_PATH, delimiter=',', encoding='utf-8', low_memory=False)
                
            # If still only one column, check the content of the first row
            if len(ticket_df.columns) <= 1:
                with open(TICKET_DATA_PATH, 'r', encoding='utf-8') as f:
                    first_line = f.readline().strip()
                    print(f"First line of ticket data: {first_line}")
                    # Try to determine the delimiter
                    if ';' in first_line:
                        ticket_df = pd.read_csv(TICKET_DATA_PATH, delimiter=';', encoding='utf-8')
                    elif '\t' in first_line:
                        ticket_df = pd.read_csv(TICKET_DATA_PATH, delimiter='\t', encoding='utf-8')
        
        except Exception as e:
            print(f"Error reading ticket data with standard methods: {e}")
            # Last resort: read as text and parse manually
            with open(TICKET_DATA_PATH, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                header = lines[0].strip().split(',')
                data = []
                for line in lines[1:]:
                    data.append(line.strip().split(','))
                ticket_df = pd.DataFrame(data, columns=header)
        
        print("Ticket DataFrame columns:", ticket_df.columns.tolist())
        
        # Similar approach for timesheet data
        try:
            timesheet_df = pd.read_csv(TIMESHEET_DATA_PATH, low_memory=False)
            if len(timesheet_df.columns) <= 1:
                timesheet_df = pd.read_csv(TIMESHEET_DATA_PATH, delimiter=',', encoding='utf-8', low_memory=False)
                
            if len(timesheet_df.columns) <= 1:
                with open(TIMESHEET_DATA_PATH, 'r', encoding='utf-8') as f:
                    first_line = f.readline().strip()
                    print(f"First line of timesheet data: {first_line}")
                    if ';' in first_line:
                        timesheet_df = pd.read_csv(TIMESHEET_DATA_PATH, delimiter=';', encoding='utf-8')
                    elif '\t' in first_line:
                        timesheet_df = pd.read_csv(TIMESHEET_DATA_PATH, delimiter='\t', encoding='utf-8')
        
        except Exception as e:
            print(f"Error reading timesheet data with standard methods: {e}")
            with open(TIMESHEET_DATA_PATH, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                header = lines[0].strip().split(',')
                data = []
                for line in lines[1:]:
                    data.append(line.strip().split(','))
                timesheet_df = pd.DataFrame(data, columns=header)
        
        print("Timesheet DataFrame columns:", timesheet_df.columns.tolist())
        
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
    except Exception as e:
        print(f"Unexpected error: {e}")
        return

    # Extract configuration from static data
    default_status_weights = static_data.get('default', {})
    config = static_data.get('config', {})

    # Set default values if not in config
    HOURS_PER_MANDAY = config.get('hours_per_manday', DEFAULT_HOURS_PER_MANDAY)
    DEFAULT_PROJECT = config.get('default_project', 'default')
    WORKING_DAYS = config.get('working_days', 195)

    # Function to get status weight for a specific project
    def get_status_weight(project_name, status):
        """Get the status weight for a specific project and status."""
        # Try to get project-specific weights first
        if project_name in static_data:
            return static_data[project_name].get(status, 0.0)
        # Fall back to default weights
        return default_status_weights.get(status, 0.0)

    # Assume studio_config has a list of working dates in 'working_days'
    working_day_dates = [datetime.strptime(d, '%Y-%m-%d').date() for d in studio_config.get('working_days', [])]

    # --- Data Cleaning and Preparation ---
    # Convert string columns to appropriate types
    # Convert date columns to datetime
    for col in ['create_date', 'start_date', 'due_date', 'current_status_changed_date']:
        if col in ticket_df.columns:
            ticket_df[col] = pd.to_datetime(ticket_df[col], errors='coerce')
        else:
            print(f"Warning: '{col}' column not found in ticket data")
            # Create a default column if missing
            ticket_df[col] = pd.to_datetime('today')

    if 'DATE' in timesheet_df.columns:
        timesheet_df['DATE'] = pd.to_datetime(timesheet_df['DATE'], errors='coerce')
    else:
        print("Warning: 'DATE' column not found in timesheet data")
        timesheet_df['DATE'] = pd.to_datetime('today')

    # Convert HOURS to numeric
    if 'HOURS' in timesheet_df.columns:
        timesheet_df['HOURS'] = pd.to_numeric(timesheet_df['HOURS'], errors='coerce').fillna(0)

    # Calculate ticket duration (in days for simplicity)
    ticket_df['duration'] = (ticket_df['due_date'] - ticket_df['start_date']).dt.days.fillna(0)

    # Calculate ticket weight score using project-specific weights
    ticket_df['status_weight'] = ticket_df.apply(
        lambda row: get_status_weight(row['project_name'], row['current_status']), 
        axis=1
    )
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
                # Fix the calculation to avoid summing datetime values
                cumulative_ticket_duration_weighted = 0
                for ticket_id, group in tickets_up_to_week.groupby('ticket_id'):
                    # Sort by current_status_changed_date to get the latest status
                    latest_status = group.sort_values('current_status_changed_date').iloc[-1]
                    # Get the duration from the first row (should be the same for all rows with this ticket_id)
                    duration = group.iloc[0]['duration']
                    # Calculate weighted duration
                    status_weight = latest_status['status_weight']
                    weighted_duration = status_weight * duration
                    cumulative_ticket_duration_weighted += weighted_duration

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
                # Use the actual working days up to this week
                user_utilization = (cumulative_user_actual_mandays / current_total_working_days) * 100  # As percentage

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

    # Before writing the JSON file, add this function to clean NaN values
    def clean_nan_values(obj):
        """Replace NaN values with 0 in a nested dictionary/list structure."""
        import math
        
        if isinstance(obj, dict):
            return {k: clean_nan_values(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [clean_nan_values(item) for item in obj]
        elif isinstance(obj, float) and math.isnan(obj):
            return 0  # Replace NaN with 0
        else:
            return obj

    # Then use it before writing the JSON file
    processed_data_cleaned = clean_nan_values(processed_data)

    # Write output JSON file
    with open(PROCESSED_DATA_PATH, 'w') as f:
        json.dump(processed_data_cleaned, f, indent=4)

    print(f"Data processing complete. Output saved to {PROCESSED_DATA_PATH}")

if __name__ == "__main__":
    process_data()
