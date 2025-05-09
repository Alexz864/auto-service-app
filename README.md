# Auto Service Management System

## Overview

Auto Service Management - a full-stack web application designed to manage an auto service workshop, including client management, car records, service appointments, inventory management, and complete service history tracking. The application aims to streamline operations for auto repair shops and service centers.

## Features

- **Client Management**: Add, edit, view, and manage client information
- **Vehicle Management**: Keep track of vehicles, their specifications, and service history
- **Appointment System**: Schedule and manage service appointments
- **Parts Inventory**: Manage parts stock and pricing
- **Service History**: Complete tracking of service operations for each vehicle
- **Dashboard**: Overview of key metrics and pending activities

## Technology Stack

### Backend

- Node.js with Express.js
- TypeScript for type safety
- PostgreSQL database
- Sequelize ORM
- RESTful API architecture

### Frontend

- Angular 15
- TypeScript
- Bootstrap 5 for responsive design
- SCSS for styling
- Bootstrap Icons

## Project Structure

The project is organized into two main parts:

### Backend

- `src/config`: Database configuration
- `src/controllers`: API controllers for handling request/response
- `src/models`: Database models defined with Sequelize
- `src/routes`: API route definitions
- `src/scripts`: Utility scripts for database operations

### Frontend

- `src/app/core`: Core services, models, and interceptors
- `src/app/shared`: Shared components, directives, and modules
- `src/app/features`: Feature modules for each functional area
  - `client-administration`: Client management
  - `car-administration`: Vehicle management
  - `appointment-administration`: Appointment scheduling
  - `part-administration`: Parts inventory management
  - `istoric-service`: Service history tracking
  - `dashboard`: Main dashboard

## Installation

### Option 1: Docker Setup (Recommended)

The easiest way to run the application is using Docker:

1. Clone the repository:

```bash
git clone https://github.com/Alexz864/auto-service-app
```

2. Make sure Docker is installed

3. Run the application stack:

```bash
docker-compose up
```

This will automatically:

- Start PostgreSQL database on port 5433
- Build and run the backend server on port 3000
- Build and serve the frontend on port 4200 (or 80 if using production configuration)
- Initialize the database with sample data

4. Open your browser and navigate to `http://localhost:4200`

To shut down the application:

```bash
docker-compose down
```

### Option 2: Manual Setup

If you prefer to run the application without Docker:

#### Prerequisites

- Node.js (v14+)
- PostgreSQL (v13+)
- Angular CLI

#### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend root with the following content:

```
DB_HOST=localhost
DB_PORT=5433
DB_NAME=auto_service
DB_USER=postgres
DB_PASSWORD=postgres
NODE_ENV=development
PORT=3000
```

4. Initialize the database:

```bash
npm run reset-db
```

5. Start the backend server:

```bash
npm run dev
```

#### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd ../frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
ng serve
```

4. Open your browser and navigate to `http://localhost:4200`

## API Documentation

The backend provides a RESTful API with the following main endpoints:

- `/api/clients`: Client management
- `/api/cars`: Vehicle management
- `/api/parts`: Parts inventory
- `/api/appointments`: Appointment scheduling
- `/api/istoric-service`: Service history

## Usage Guide

1. **Dashboard**: Start at the dashboard to see an overview of activities
2. **Client Management**: Add and manage clients
3. **Vehicle Registry**: Add vehicles and associate them with clients
4. **Parts Inventory**: Manage parts stock
5. **Appointment Scheduling**: Create appointments for clients' vehicles
6. **Service Processing**: Record vehicle reception and repair details
7. **Service History**: Access complete service history for any vehicle

## Development

### Backend

- Build: `npm run build`
- Start production: `npm start`
- Reset database: `npm run reset-db`

### Frontend

- Build: `ng build`
- Run tests: `ng test`
- Production build: `ng build --prod`

## License

This project is licensed under the MIT License - see the LICENSE file for details.
