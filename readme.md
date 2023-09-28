

# KU_OJ_API: An Online Judge Platform Backend for Khulna University

KU_OJ is an online judge platform for Khulna University students and faculty, where they can create and participate in programming contests and submit code using C/C++, Java and Python. KU_OJ is inspired by Codeforces, a popular online judge for competitive programming.

## Features

- **Contest creation and management**: Users can create contests with custom problems, time limits, scoring systems, and access levels. Users can also edit, delete, or clone existing contests.
- **Contest participation and submission**: Users can join contests and submit code for the problems. Users can view the status, verdict, and score of their submissions, as well as the leaderboard and the submissions of other participants.
- **Problem creation and management**: Users can create problems with custom test cases, input/output formats, constraints, and tags. Users can also edit, delete, or clone existing problems.
- **Problem solving and submission**: Users can solve problems outside of contests and submit code for them. Users can view the status, verdict, and score of their submissions, as well as the problem statistics and the submissions of other users.
- **Real-time communication**: Users can chat with other users during contests using WebSocket. Users can also send and receive private messages to and from other users.


## Technologies

- **Backend**: KU_OJ uses Express.js, a fast and minimalist web framework for Node.js, to handle the server-side logic and routing.
- **Caching**: KU_OJ also uses Redis, an in-memory data structure store, to cache frequently accessed data and improve performance. 
- **Database**: KU_OJ uses MySQL, a relational database management system, to store the persistent data, such as users, contests, problems, and submissions. 
- **Migrations**: KU_OJ uses Migratify, an NPM package developed by the author, to manage the database migrations and schema changes (https://www.npmjs.com/package/migratify).
- **Performance optimization**: KU_OJ uses Node.js multicoring for load balancing and concurrency.
 

## Installation

To install KU_OJ, you need to have Node.js, Redis, and MySQL installed on your system. You also need to clone this repository and install the dependencies using the following commands:

```bash
git clone https://github.com/shahriarKabir44/ku_oj_API.git
cd ku_oj_API
npm install

```

You also need to create a `.env.dev` file in the root directory and provide the following environment variables:

```bash
jwtSecret=""<a random string>
dbPassword=""<database password>
dbPort=<database port>
dbName="ku_oj"
dbUser=""<database user>
dbHost=""<database host>
```

You also need to run the database migrations. You need the Migratify CLI to do so.

```bash
npm install -g migratify 
migratify migrate
```

To start the main server, use the following command:

```bash
npm start
```
 