import json
import os
from datetime import datetime, timedelta

# Define the output file path - fix the path to be relative to the current directory
OUTPUT_FILE = 'src/data/processed_data_example.json'

def create_example_data():
    """Creates an example processed_data.json file with 1 project and 10 users."""
    
    # Generate dates for weekly data (past 10 weeks)
    current_date = datetime.now()
    week_end_dates = []
    for i in range(10):
        # Go back i weeks from current date, then find the Monday of that week
        date = current_date - timedelta(weeks=i)
        # Adjust to the previous Monday (weekday 0 is Monday in Python's datetime)
        monday = date - timedelta(days=date.weekday())
        week_end_dates.append(monday.strftime('%Y-%m-%d'))
    
    # Sort dates in ascending order
    week_end_dates.sort()
    
    # Create example project data
    project_data = {
        "project_name": "example_project",
        "weekly_data": [],
        "latest_summary": {}
    }
    
    # Generate weekly data for the project with increasing values
    for i, week_date in enumerate(week_end_dates):
        # Create weekly data with progressively increasing values
        weekly_data = {
            "week_end_date": week_date,
            "cumulative_total_ticket_weight_score": 100 * (i + 1),
            "cumulative_actual_mandays": 10 * (i + 1),
            "kpis_ratio": min(100, 10 * (i + 1)),
            "completion_rate": min(100, 10 * (i + 1)),
            "department_mandays": [
                {
                    "Department": "Engineering",
                    "mandays": 5 * (i + 1)
                },
                {
                    "Department": "Design",
                    "mandays": 3 * (i + 1)
                },
                {
                    "Department": "Marketing",
                    "mandays": 2 * (i + 1)
                }
            ]
        }
        project_data["weekly_data"].append(weekly_data)
    
    # Set the latest summary to the last weekly data
    project_data["latest_summary"] = project_data["weekly_data"][-1]
    
    # Create example user data
    users_data = []
    departments = ["Engineering", "Design", "Marketing", "Product", "QA"]
    
    for i in range(10):
        user_data = {
            "username": f"user_{i+1}",
            "weekly_data": [],
            "annual_summary": {}
        }
        
        # Generate weekly data for each user
        for j, week_date in enumerate(week_end_dates):
            # Create weekly data with some variation between users
            user_weekly_data = {
                "week_end_date": week_date,
                "cumulative_user_ticket_weight_score": 50 * (j + 1) * (0.8 + (i % 5) * 0.1),
                "cumulative_user_actual_mandays": 5 * (j + 1) * (0.8 + (i % 3) * 0.1),
                "user_timeliness_score": min(100, 10 * (j + 1) * (0.7 + (i % 4) * 0.1)),
                "user_utilization": min(100, 10 * (j + 1) * (0.9 + (i % 5) * 0.05))
            }
            user_data["weekly_data"].append(user_weekly_data)
        
        # Set the annual summary with contribution and latest weekly data
        user_data["annual_summary"] = {
            "contribution": min(100, 60 + i * 4),
            "latest_weekly_data": user_data["weekly_data"][-1]
        }
        
        users_data.append(user_data)
    
    # Combine project and user data
    example_data = {
        "projects": [project_data],
        "users": users_data
    }
    
    # Make sure the directory exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    # Write to file
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(example_data, f, indent=4)
    
    print(f"Example data created and saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    create_example_data()
