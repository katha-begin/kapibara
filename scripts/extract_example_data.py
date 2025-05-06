import json
import os
import random

# Define file paths - adjust to use absolute paths or correct relative paths
SOURCE_FILE = 'src/data/processed_data.json'  # Remove the leading './'
OUTPUT_FILE = 'src/data/processed_data_example.json'

def extract_example_data():
    """
    Extracts a subset of data from the existing processed_data.json file
    to create a smaller example file with 1 project and 10 users.
    """
    # Declare global variables at the beginning of the function
    global SOURCE_FILE
    
    try:
        # Check if the file exists and print the current working directory for debugging
        print(f"Current working directory: {os.getcwd()}")
        print(f"Checking if source file exists at: {os.path.abspath(SOURCE_FILE)}")
        
        if not os.path.exists(SOURCE_FILE):
            print(f"File not found at {SOURCE_FILE}")
            # Try to find the file in parent directory
            parent_source = os.path.join('..', SOURCE_FILE)
            if os.path.exists(parent_source):
                print(f"File found at {parent_source}")
                SOURCE_FILE = parent_source
            else:
                print(f"File not found at {parent_source} either")
                # List files in the data directory to help locate the file
                data_dir = 'src/data'
                if os.path.exists(data_dir):
                    print(f"Files in {data_dir}:")
                    for file in os.listdir(data_dir):
                        print(f"  - {file}")
                else:
                    print(f"Directory {data_dir} does not exist")
                    # Try parent data directory
                    parent_data_dir = '../src/data'
                    if os.path.exists(parent_data_dir):
                        print(f"Files in {parent_data_dir}:")
                        for file in os.listdir(parent_data_dir):
                            print(f"  - {file}")
        
        # Read the source data
        with open(SOURCE_FILE, 'r') as f:
            source_data = json.load(f)
        
        print(f"Successfully loaded source data from {SOURCE_FILE}")
        
        # Create the example data structure
        example_data = {
            "projects": [],
            "users": []
        }
        
        # Extract one project (preferably one with good data)
        if source_data.get("projects"):
            # Find projects with non-empty weekly_data
            valid_projects = [p for p in source_data["projects"] 
                             if p.get("weekly_data") and len(p.get("weekly_data", [])) > 0]
            
            if valid_projects:
                # Sort by amount of data (number of weekly_data entries with non-empty department_mandays)
                valid_projects.sort(
                    key=lambda p: sum(1 for w in p.get("weekly_data", []) 
                                     if w.get("department_mandays") and len(w.get("department_mandays", [])) > 0),
                    reverse=True
                )
                # Take the project with the most data
                selected_project = valid_projects[0]
                example_data["projects"].append(selected_project)
                print(f"Selected project: {selected_project.get('project_name')}")
            else:
                print("No valid projects found with weekly data. Using the first project.")
                example_data["projects"].append(source_data["projects"][0])
        else:
            print("No projects found in source data.")
        
        # Extract 10 users (or all if less than 10)
        if source_data.get("users"):
            # Find users with non-empty weekly_data
            valid_users = [u for u in source_data["users"] 
                          if u.get("weekly_data") and len(u.get("weekly_data", [])) > 0]
            
            if valid_users:
                # Sort by amount of data (number of weekly_data entries)
                valid_users.sort(
                    key=lambda u: len(u.get("weekly_data", [])),
                    reverse=True
                )
                # Take up to 10 users with the most data
                selected_users = valid_users[:min(10, len(valid_users))]
                example_data["users"] = selected_users
                print(f"Selected {len(selected_users)} users")
            else:
                print("No valid users found with weekly data. Using the first 10 users.")
                example_data["users"] = source_data["users"][:min(10, len(source_data["users"]))]
        else:
            print("No users found in source data.")
        
        # Make sure the output directory exists
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        
        # Write to the output file
        with open(OUTPUT_FILE, 'w') as f:
            json.dump(example_data, f, indent=4)
        
        print(f"Example data extracted and saved to {OUTPUT_FILE}")
        print(f"Contains {len(example_data['projects'])} project and {len(example_data['users'])} users")
        
    except FileNotFoundError:
        print(f"Error: Source file not found at {SOURCE_FILE}")
    except json.JSONDecodeError:
        print(f"Error: Source file is not valid JSON")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    extract_example_data()

