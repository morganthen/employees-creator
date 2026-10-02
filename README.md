# Employees Creator

<!-- Test badges (nology requirement). Uncomment and point at the real workflows once CI lands.
[![Java CI with Maven](https://github.com/morganthen/employees-creator/actions/workflows/maven.yml/badge.svg)](https://github.com/morganthen/employees-creator/actions/workflows/maven.yml)
[![Node.js CI](https://github.com/morganthen/employees-creator/actions/workflows/node.js.yml/badge.svg)](https://github.com/morganthen/employees-creator/actions/workflows/node.js.yml)
-->

## Demo & Snippets

- **Hosted Link:** TBD (deployment target: AWS, RDS + Elastic Beanstalk/EC2)
- **App Preview:** TBD once the client app exists. Add screenshots to `./docs/images/`.

---

## Requirements / Purpose

### MVP & Purpose

Employees Creator is a full-stack employee records system. Users can create and manage employee records covering personal details, role, employment status, contract dates and working hours. The project is built as a portfolio-grade full-stack app that goes deep on the patterns interviews probe: layered backend architecture, relational schema design, validation and testing.

### Tech Stack

- **Backend:** Java 17, Spring Boot 4.1.1, Spring Data JPA, MySQL, Bean Validation, Maven.
- **Frontend (planned):** React, TypeScript, Vite, React Query, React Router, Tailwind CSS.
- **Testing & Tools:** JUnit, Mockito, REST Assured, Vitest, React Testing Library, Git, GitHub Actions, OpenAPI/Swagger.

**Why this stack?**

- **Java & Spring Boot:** the mainstream stack for Australian backend roles, and a framework that makes layered architecture (controller, service, repository) explicit.
- **MySQL & Spring Data JPA:** real relational modelling with foreign keys, constraints and referential integrity.
- **Bean Validation:** structural validation at the DTO boundary, kept in one place.
- **React & TypeScript:** a type-safe client that consumes the REST API (planned).

### Database Schema

<p align="center">
<img src="./docs/images/ERD.png" alt="Database Entity Relationship Diagram" width="100%" />
</p>

Two tables: `employee` and `role`, joined N:1 (`employee.role_id` to `role.id`).

---

## Build Steps

### Prerequisites

- Java JDK 17+ (developed on JDK 25)
- Maven, or the bundled `./mvnw` wrapper
- MySQL 8+ running locally

### Backend Setup

1. Create the database:

   ```bash
   mysql -u root -p -e "CREATE DATABASE employees_creator;"
   ```

2. Configure `src/main/resources/application.properties` (see Environment Variables below).

3. Build and run the Spring Boot application:

   ```bash
   ./mvnw spring-boot:run
   ```

4. Run the tests:

   ```bash
   ./mvnw test
   ```

5. Once running, the API is available at `http://localhost:8080`, and Swagger UI at `http://localhost:8080/swagger-ui/index.html` (once springdoc-openapi is added).

---

### Environment Variables

| Variable         | Description                  | Example / Default      |
| :--------------- | :--------------------------- | :--------------------- |
| `DB_HOST`        | Database host address        | `localhost`            |
| `DB_PORT`        | Database port number         | `3306` (MySQL)         |
| `DB_NAME`        | Name of the database         | `employees_creator`    |
| `DB_USERNAME`    | Database connection username | `root`                 |
| `DB_PASSWORD`    | Database connection password | `your_secure_password` |
| `SPRING_PROFILE` | Active Spring profile        | `dev` / `prod` / `test`|

### Example `.env` file

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=employees_creator
DB_USERNAME=root
DB_PASSWORD=secret
SPRING_PROFILE=dev
```

Mapped in `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
```

---

## Design Goals / Approach

- **Diagram-first schema design.** Entities, relations and constraints are scoped on a database diagram before any Java is written.
- **Layered backend architecture.** Controllers to services to repositories, with request and response DTOs at the boundary. Business rules live in the service layer.
- **DTO boundary.** Entities are never serialized directly. Requests carry Bean Validation; responses are shaped for the client.
- **Archive over delete.** Records carry an `archived_at` timestamp so employment history is preserved. Email uniqueness applies to active rows only.
- **Roles as a lookup table.** Roles change without a code deploy and feed the form dropdown through `GET /api/roles`.
- **AU-only address handling.** Australian mobile format, AU states and 4-digit postcodes. No country column.
- **Hand-rolled over generated.** No Lombok. Explicit getters, setters and mappers so every pattern can be explained.

---

## Features

- [x] Spring Boot scaffold boots (Maven, Spring Boot 4.1.1, Java 17 target)
- [ ] `role` lookup entity, repository and `GET /api/roles`
- [ ] `employee` entity and repository
- [ ] Employee create, read, update and archive endpoints
- [ ] Bean Validation (AU mobile, email, contract dates, hours, state)
- [ ] Role dropdown fed from the API (client)
- [ ] React + TypeScript client

---

## Known Issues

- No CI workflow yet, so the test badges above are placeholders until GitHub Actions is added.
- Local MySQL credentials are not configured. Two Homebrew services exist (`mysql` 9.x running, `mysql@8.4` in an error state).
- No global exception handling or standard API error shape yet.

---

## Future Goals

- Debounced Australian address autocomplete (Mapbox or Geoapify free tier)
- Pagination, search, filter and sort on the employee list
- Roles N:M upgrade (`employee_role` join table) if an employee needs multiple roles
- CSV export and audit log
- Sentry + PostHog, Playwright end-to-end tests
- AWS deployment (RDS + Elastic Beanstalk/EC2)

---

## Change Logs

**02/10/2026 - Project Scaffold & Schema Design**

- Generated the Spring Boot project (Maven, Spring Boot 4.1.1, Java 17 target) with dependencies: Spring Data JPA, Spring Web MVC, Validation, MySQL Driver, DevTools.
- Designed the initial database schema (`employee` + `role`, N:1) and recorded the deferred decisions with explicit triggers.
- Added the database ERD to `docs/images/` and embedded it in the README.
- Added the MIT `LICENSE` file.
- Added this README following the nology README standard.

---

## What did you struggle with?

- **Scope creep vs YAGNI on the schema:** judging which future needs to design for now (a separate addresses table, multi-role employees, public IDs) against keeping the MVP small. Resolved by limiting the MVP to two tables and writing down an explicit trigger for each deferred decision.

---

## Licensing Details

This project is licensed under the [MIT License](LICENSE).

---

## Further details, related projects, reimplementations

- **Backend API:** Spring Boot REST API serving employee and role endpoints (in progress).
- **Frontend Application:** React + TypeScript single-page app consuming the REST endpoints (planned).
- **Related project:** extends the patterns from an earlier Spring Boot build, the Java + React To Do API (https://github.com/morganthen/todo-api): layered controllers, services, repositories, DTOs, soft delete, OpenAPI.
