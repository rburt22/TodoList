# Todo List Application

A full-stack Todo List application with a C# ASP.NET Core backend, MySQL database, and HTML/CSS/JavaScript frontend.

## Features

- Create, read, update, and delete todo items
- Categorize todos with custom categories and colors
- Set priority levels (Low, Medium, High, Urgent)
- Set due dates for todos
- Mark todos as complete
- Filter todos by category, priority, and completion status

## Technologies Used

- Backend: C# with ASP.NET Core Web API
- Database: MySQL
- Frontend: HTML, CSS, and JavaScript
- ORM: Entity Framework Core
- API Documentation: Swagger

## Prerequisites

- .NET 6.0 SDK
- MySQL Server
- Visual Studio Code

## Setup Instructions

1. Update the connection string in `appsettings.json` with your MySQL credentials.
2. Run the `db-setup.sql` script to create the database and initial data.
3. Run the application using `dotnet run`.
4. Access the API at https://localhost:5001/swagger
5. Access the frontend at https://localhost:5001

## Project Structure

- `Models/`: Contains the data models
- `Controllers/`: Contains the API controllers
- `Data/`: Contains the database context
- `wwwroot/`: Contains the frontend files
