# Contractors View
Contractors Management System built with React and next.js on the frontend and .NET WebApi on the backend.

## Build
To build the application the .env file in src folder has to be filled with:

### Database
POSTGRES_DB=contractors_db
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
PG_PORT=5432

These values should stay the same to stay compliant with the development, but can be changed if needed.

### API
ASPNETCORE_ENVIRONMENT=Production
API_PORT=7140

### Frontend
FE_PORT=5000

Database is seeded by the WebAPI for simplicity.
To build the frontend with the intended configuration env.production in src/frontend has to be filled with:

NEXT_PUBLIC_API_URL=http://localhost:7140/api - if it was supposed to be ran locally, or any other host if not.

## Run
After the data is filled the docker-compose can be run.
In src folder startup docker-compose with docker-compose --build up.