# Dave.com Coding Challenge
## Bear Sighting Tracker ##

Bear sightings are on the rise nationwide. Unfortunately, there's no centralized website to upload and access bear sightings. This is a big problem!

Using the framework of your choice, create an API that allows users to submit bear sightings as they happen and query the database for recent sightings with certain filters.

Your API should conform to the following spec:

### POST /sighting ###
Example POST body:
`{ bear_type: 'grizzly', notes: 'It was a big one!', zip_code: '90210', num_bears: 3 }`

### GET /sightings/search ###
Return an array of sightings, include a unique ID with each.
Supported query params, all optional
`start_date` (inclusive) (default: all time)
`end_date` (inclusive) (default: all time)
`bear_type` (default: all types)
`zip_code` (default: all zip codes)
`sort` (default: created timestamp, ascending. only supported value is `num_bears`)

### GET /sighting/:id ###
Return a single sighting object queried by its ID

# How to Run
git clone http://git.github.com/cloudbring/bear2
cd bear2
`npm i`

## DB Setup
By default it looks to connect to a postgres

`localhost:5432`

Run Docker Compose up to start postgres and adminer in docker:

`npm run docker-debug`

This should look something like:

```
> docker-compose up

Creating network "simple-bear_default" with the default driver
Creating simple-bear_db_1 ... done
Creating simple-bear_adminer_1 ... done
Attaching to simple-bear_db_1, simple-bear_adminer_1
```

### Initialze DB

`npm run db-init`

### Create DB Tables

Connect to Adminer at http://localhost:8080

System: PostgreSQL

Server: db

Username: root

Password: root

1. Click Login
2. Select `bearsightr_dev` from DB menu
3. Click `SQL command` link right below DB menu
4. Use the following SQL to initalize the DB

```sql
-- Drops previous sightings table
DROP TABLE IF EXISTS sightings;

-- Create app table
CREATE TABLE IF NOT EXISTS sightings (
    id INT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    bear_type VARCHAR(20) NOT NULL,
    notes TEXT NOT NULL,
    zip_code INT NOT NULL,
    num_bears SMALLINT NOT NULL,
    createdat TIMESTAMP NOT NULL,
    updatedat TIMESTAMP NOT NULL
);

```

5. Click Execute
6. Run tests to prime the system

## Run Tests
Running tests is simplest with the watcher. 

Run:

`npm run watch`

Should look something like:

```
$ npm run watch
12:41:55 PM - Starting compilation in watch mode...
[TypeScript]
[TypeScript]
[TypeScript] 12:42:01 PM - Found 0 errors. Watching for file changes.
[ Jest] No tests found related to files changed since last commit.
[ Jest]
[ Node] [nodemon] 1.18.10
[ Node] [nodemon] to restart at any time, enter `rs`
[ Node] [nodemon] watching: *.*
[ Node] [nodemon] starting `node ./dist/server.js`
[ Node] Bear Sightr is running on http://localhost:3000 in dev mode
```

### Re-Running the Tests
Simply change any file in the directory and the file watcher will rerun all the tests or simply

`npm run test`

Should look something like:

```
npm run test

> npx jest

ts-jest[backports] (WARN) "[jest-config].globals.ts-jest.tsConfigFile" is deprecated, use "[jest-config].globals.ts-jest.tsConfig" instead.
ts-jest[backports] (WARN) Your Jest configuration is outdated. Use the CLI to help migrating it: ts-jest config:migrate <config-file>.
 PASS  test/hello.spec.ts
  POST /sighting
    √ Returns the sighting posted (189ms)
  GET /sighting/:id
    √ Returns a sighting for id=1 (10ms)
  POST /sightings/search
    √ Returns sightings on a valid search (10ms)
    √ Rejects invalid query params (6ms)
    √ Ignores unimportant query params (6ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        6.263s, estimated 7s
Ran all test suites.
Jest did not exit one second after the test run has completed.

This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with
`--detectOpenHandles` to troubleshoot this issue.
```

## Running the App
The app is a JSON API on `localhost:3000`

All three endpoints work. Note that search is at
`GET /sightings/search` (plural sightings)

This was a compromise because the handler for `GET /sighting/:id` was catching `search` 
as an invalid `:id`.

There are ways around this but, they require complexity so this solution seemed 
quickest at the time.


### POST /sighting ###
Example POST body:
`{ bear_type: 'grizzly', notes: 'It was a big one!', zip_code: '90210', num_bears: 3 }`

### GET /sightings/search ###
Return an array of sightings, include a unique ID with each.
Supported query params, all optional
`start_date` (inclusive) (default: all time)
`end_date` (inclusive) (default: all time)
`bear_type` (default: all types)
`zip_code` (default: all zip codes)
`sort` (default: created timestamp, ascending. only supported value is `num_bears`)

### GET /sighting/:id ###
Return a single sighting object queried by its ID


## Submission ##
Submit the final project via zip folder at https://goo.gl/forms/qzQCMMoiHn3bc0Pu1
Please include a package.json or equivalent, but omit the node_modules directory. The form sometimes rejects zip files when node_modules is included.

## Extra credit ##
If you have time, write tests! If you still have time, create a simple UI for submitting and querying bear sightings.

Please spend no more than 4 hours on this project, and feel free to get in touch with me or Dick Fickling (dick@dave.com) if you have any questions.