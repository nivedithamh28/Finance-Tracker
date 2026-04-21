# Finance Tracker 

A comprehensive full-stack application to track personal finances, manage budgets, and analyze spending patterns.

##  Features

- **Dashboard**: Real-time overview of your financial health with high-level summaries.
- **Transaction Management**: Record income and expenses with detailed descriptions and categories.
- **Budgeting**: Set monthly budgets for different categories and track your spending against them.
- **Analytics**: Visualize your spending habits through interactive charts and reports.
- **Category Management**: Organize your transactions with predefined and custom categories.
- **User Authentication**: Secure login and profile management.

##  Tech Stack

- **Frontend**: React 19, Vite, Lucide React, Recharts, Axios.
- **Backend**: Java 17, Spring Boot 3.5, Spring Security, JWT, Flyway.
- **Database**: PostgreSQL 15.
- **Deployment**: Docker, Docker Compose, Nginx.

##  Getting Started with Docker

The easiest way to get the application running is using Docker Compose.

### Prerequisites
- Docker and Docker Compose installed on your system.

### Running the App
1. Clone the repository.
2. Navigate to the project root.
3. Build and start the containers:
   ```bash
   docker-compose up -d --build
   ```
4. Access the application:
   - **Frontend**: [http://localhost:80](http://localhost:80)
   - **Backend API**: [http://localhost:8080](http://localhost:8080)
   - **Database**: Port `5433` (externally)

##  Local Development

If you wish to run the components individually for development:

### Backend
1. Ensure Java 17+ and Maven are installed.
2. Configure your local PostgreSQL database in `finance-backend/src/main/resources/application.properties`.
3. Run the application:
   ```bash
   cd finance-backend
   ./mvnw spring-boot:run
   ```

### Frontend
1. Ensure Node.js 20+ is installed.
2. Install dependencies:
   ```bash
   cd finance-frontend
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

##  Architecture

The project follows a standard client-server architecture:
- **Frontend**: Served via Nginx in production, proxying API requests to the backend.
- **Backend**: RESTful API providing business logic and data persistence.
- **Database**: Relational storage for transactions, budgets, and user data.


