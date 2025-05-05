# Technical Design Document: BizFlow Dashboard

## 1. Introduction

This document outlines the technical design for the BizFlow Dashboard project. The project aims to provide a local, lightweight dashboard for visualizing project progress and user key performance indicators (KPIs) based on weekly data processing from external CSV files. The dashboard will display metrics such as project KPI scores, completion rates, and cumulative mandays.

## 2. Architecture

The BizFlow Dashboard will utilize a simple client-server architecture. The client-side (frontend) will be a web application running in the user's browser, and it will communicate with a local backend server running on the user's machine. There is no requirement for internet exposure.
```
mermaid
graph LR
    A[User Browser] --> B(Frontend: React)
    B --> C(Local Backend: Node.js/Express.js)
    C --> D[Data Storage: JSON Files]
    E[Raw CSV Data] --> F(Data Processing Script)
    G[Admin Control Data] --> F
    F --> D
```
## 3. Technology Stack

*   **Frontend:** React - Used for building the user interface and interactive components of the dashboard.
*   **Backend:** Node.js with Express.js - Provides a lightweight local server to serve the frontend assets and expose APIs for accessing the processed data.
*   **Data Storage:** JSON Files - Processed project and user KPI data will be stored in JSON files for easy access by the backend.
*   **Data Processing:** Node.js Script - A dedicated script written in Node.js will handle the weekly processing of raw CSV data and integration with admin control data.

## 4. Data Model

The primary data store will be a JSON file containing an array of project objects. Each project object will include:

*   `project_name`: The name of the project.
*   `start_date`: Project start date (from admin control).
*   `end_date`: Project end date (from admin control).
*   `total_manday_allocation`: Total allocated mandays for the project (from admin control).
*   `weekly_data`: An array of objects, each representing a weekly snapshot:
    *   `week_end_date`: The end date of the week for this snapshot.
    *   `cumulative_ticket_weight_score`: Cumulative sum of ticket weight scores up to this week.
    *   `cumulative_actual_mandays`: Cumulative sum of actual mandays up to this week.
    *   `project_kpi_score`: Calculated project KPI score for this week.
    *   `completion_rate`: Calculated completion rate for this week.
    *   `departments`: An array of department objects with cumulative mandays for the week:
        *   `department_name`: Name of the department.
        *   `cumulative_mandays`: Cumulative mandays for this department up to this week.
*   `users`: An array of user objects, each containing user-specific weekly data:
    *   `username`: The username.
    *   `weekly_data`: An array of objects, each representing a weekly snapshot:
        *   `week_end_date`: The end date of the week.
        *   `cumulative_actual_mandays`: Cumulative actual mandays for the user up to this week.
        *   `cumulative_assigned_ticket_weight_score`: Cumulative ticket weight score for tickets assigned to this user up to this week.
        *   `timeliness_to_complete_score`: Calculated timeliness score for this user for this week.
        *   `utilization`: Calculated utilization for this user for this week.
    *   `annual_contribution`: Calculated annual contribution for the user (updated weekly).

## 5. Data Processing Pipeline

A Node.js script will serve as the data processing pipeline, designed to be run weekly. The pipeline will perform the following steps:

1.  Read data from the two raw CSV files (ticket data and timesheet data).
2.  Read project-specific configuration and studio annual config (working days) from the admin control data provided by the frontend.
3.  Process ticket data to calculate ticket weight scores based on duration and status weights from `static_data.json`.
4.  Process timesheet data to calculate actual mandays by summing hours and dividing by 8, aggregating by project, user, and department.
5.  Calculate cumulative weekly ticket weight scores and actual mandays for each project and user.
6.  Calculate weekly project KPI scores, completion rates, user timeliness scores, and user utilization scores based on the cumulative data and admin control information.
7.  Calculate annual user contribution based on ticket assignments within the year.
8.  Store the processed data, including the weekly snapshots, into the designated JSON file, overwriting the previous week's full dataset or appending the new weekly data as required for historical tracking.

## 6. APIs

The Node.js/Express.js backend will expose simple REST APIs to allow the frontend to retrieve the processed data. Key endpoints will include:

*   `GET /api/projects`: Returns the array of project objects with all their weekly data.
*   `GET /api/users`: Returns the array of user objects with all their weekly data.
*   Potentially other endpoints for filtering or retrieving specific data subsets if needed by the frontend components.

## 7. Deployment

The entire application will be packaged into a single Docker container. This container will include:

*   The Node.js backend with Express.js.
*   The built React frontend application (static files served by the backend).
*   The data processing script.
*   The `static_data.json` file.
*   A designated volume or bind mount for the input CSV files and the output JSON data file, allowing persistence and easy updates of the raw data.

This approach ensures lightweight, easy, and consistent local deployment.

## 8. Testing Strategy

*   **Unit Tests:** Implement unit tests for the data processing script to verify the correctness of the data transformation and calculation logic (e.g., ticket weight score calculation, manday conversion, KPI formula application).
*   **Frontend Tests:** Utilize a testing library like Jest and React Testing Library to test the functionality and rendering of frontend components, ensuring they correctly display the data fetched from the backend and respond to user interactions.