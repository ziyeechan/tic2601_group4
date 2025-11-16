# TIC2601 Group 4 Project

TIC2601 Group 4 Project -- **MakanTime**

# About this project -- MakanTime:

**MakanTime** aims to streamline the restaurant reservation process by providing customers with a seamless online booking experience while enabling restaurant staff to manage reservations, tables, and schedules. By replacing manual processes with a digital platform, the system seeks to reduce booking errors, improve customer satisfaction, and optimize table turnover and operational efficiency.

# Contributing Members:

Ginna Tai
<br/>
Zheng Shao Bin
<br/>
Cheng Wei Xian
<br/>
Chan Zi Yee
<br/>
Jerin Paul

# Getting Started

To run this project, ensure that:
<br/>

- All the necessary dependencies has been installed
- SQLite has been set up
  <br/>
  - This can be done so by installing sqlite and using the "makan_time.db" file as the database.
  - Alternatively, run the "database_dump" file to create all the necessary tables

## Navigating the Project:

### In the backend folder:

1. server.js: main file where connection is established for the project and all the generic configurations are done here
2. database folder: contains seeder file where it populates the database with the necessary data for the project
3. src folder:

- routes.js: centralized folder for all API endpoint routes to allow frontend to call the respective endpoints
- schemas folder: contains the initialization script for different tables used for the project
- models folder: contains the sequelize queries for sqlite (SQL query equivalent)
- controllers folder: contains individual endpoint

<br/>
<br/>

**Folder Structure Flow**:

- schemas folder would create the different tables -> seeder file in database folder would populate the tables with dummy data
- server.js would start up the project
- When endpoints are called,
  - First goes through routes.js to find respective endpoint called -> controllers folder to execute said endpoint -> models folder to run the respective SQL query

### In the frontend folder:

## Starting the servers:

This project consists of a backend server and a frontend server.

1. To start backend server:

```
$ cd backend
$ npm i
$ npm start
```

In server.js file, there is a variable called onFirstLoad. This is set to false on default. It is recommended to change the value to true when first
starting the project, as this variable helps run the loadData.js file, where it seeds the database with dummy data for usage. Once seeded, please set the value back to
false, else it will reset the data everytime the codebase is updated.

2. To start frontend server:

```
$ cd frontend
$ npm i
$ npm run dev
```

## Technologies

- React
- Express
- Sequelize
