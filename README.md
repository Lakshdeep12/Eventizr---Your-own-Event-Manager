# Eventizr – Event Management Platform

Eventizr is a full-stack event management application built with the MERN stack. It allows users to browse events, register and log in, book tickets, and manage their event-related activity through a clean dashboard experience.

## Features

- User registration and login
- Event discovery and details page
- Booking flow with ticket management
- Dashboard for users and admins
- Payment success and failure handling
- Email-based notifications
- Admin event management workflows

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication: JWT
- Email: Nodemailer

## Project Structure

- client: frontend application
- server: backend API and database logic
- Eventizr_Postman_Collection.json: Postman collection for API testing

## Getting Started

### 1. Install dependencies

- Frontend
  - cd client
  - npm install

- Backend
  - cd server
  - npm install

### 2. Configure environment variables

Copy the example environment files and update the values:

- server/.env.example -> server/.env
- client/.env.example -> client/.env

### 3. Start the app

- Frontend
  - cd client
  - npm run dev

- Backend
  - cd server
  - npm run dev

### 4. Seed the database (optional)

- cd server
- npm run seed

## Important Notes

- Do not commit real environment files.
- Keep sensitive values such as JWT secrets, database URIs, and email credentials in local .env files only.
- The repository is configured to ignore .env and generated folders such as node_modules and build output.

## License

This project is licensed under ISC.
