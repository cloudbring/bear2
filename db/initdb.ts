import fs from 'fs-extra'
import { Client, ClientConfig } from 'pg'
import * as app from '../src/app'
import { db_config } from '../src/app'

const init = async() => {
    const dropDb : string = `
        -- Destory DB
        DROP DATABASE IF EXISTS ${db_config.database};
    `
    const createDb : string = `
        -- Create Clean Database
        CREATE DATABASE ${db_config.database}
            WITH OWNER = ${db_config.user}
        ;
    `
    const createTable : string = `
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
    `
    // Don't specify a db on connection so we can delete it
    let configWithoutDB = db_config
    configWithoutDB.database = 'postgres'

    console.log('DB Connection: ', db_config)
    //console.log('Running SQL:', dropDb, createDb, createTable)
    console.log('Running SQL:', dropDb, createDb)
    // Postgres Client
    const client = new Client(configWithoutDB)
    try {
        // Connect to local PG DB
        await client.connect()
        await client.query(dropDb)
        await client.query(createDb)
        //await client.query(createTable)
    } catch (err) {
        console.log( err )  
        throw err;
    } finally {
        await client.end()
    }
}

init().then( () => {
    console.log( "finished" )
}).catch((err) => {
    console.log( `finished with errors: ${err}`)
})