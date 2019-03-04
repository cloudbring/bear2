import * as express from 'express'
import { Response } from 'express'
import * as bodyParser from 'body-parser'
import * as sightingsRouter from './routes/sightings.router'
import * as pgPromise from 'pg-promise'
import { check, validationResult, Validator, checkSchema, ValidationChain } from 'express-validator/check'
import { ClientConfig } from 'pg';
import { isNull, isNumber } from 'util';

const app = express();
app.set("name", "Bear Sightr")
app.set("port", process.env.BEAR_APP_PORT || 3000)
app.set("env", process.env.BEAR_APP_ENV || "dev")
app.set("db_port", process.env.BEAR_APP_DB_PORT || "5432")
app.set("db_name", process.env.BEAR_APP_DB_NAME || `bearsightr_${app.get('env')}`)
app.set("db_host", process.env.BEAR_APP_DB_HOST || "localhost")
app.set("db_user", process.env.BEAR_APP_DB_USER || "root")
app.set("db_pass", process.env.BEAR_APP_DB_PASS || "root")

// Middleware
app.use(express.json())

/**
 * Bear Sighting Tracker
 * Bear sightings are on the rise nationwide. Unfortunately, there's no 
 * centralized website to upload and access bear sightings. 
 * This is a big problem!
 * 
 * Using the framework of your choice, create an API that allows 
 * users to submit bear sightings as they happen and query the database 
 * for recent sightings with certain filters.
 * 
 * Your API should conform to the following spec:
 */

// DATABASE
const db_config:ClientConfig = {
    host: app.get('db_host'),
    port: parseInt(app.get('db_port')),
    database: app.get('db_name'),
    user: app.get('db_user'),
    password: app.get('db_pass'),
}
const pgp = pgPromise()
const db = pgp(db_config)

const bear_types = [
    'Asiatic',
    'Black',
    'Brown',
    'Giant Panda',
    'Polar',
    'Sloth',
    'Spectacled',
    'Sun',
    'Grizzly'
].map(b => b.toLowerCase()) // Make everything lowercase for ease of use

// Valdiations
const postValidations = checkSchema({
    bear_type: {
        in: ['body'],
        isLowercase: true,
        isIn: {
            options: [bear_types],
            errorMessage: `Invalid bear type. Must be one of these: ${bear_types.join(', ')}`
        },
        exists: true,
        isString: true,
    },
    notes: {
        in: ['body'],
        isString: true,
        exists: true,
    },
    zip_code: {
        in: ['body'],
        // DO NOT USE isPostalCode: DOES NOT WORK HERE
        // isPostalCode: {
        //     options: { locale: 'US' },
        //     errorMessage: 'Not a valid US postal code'
        // },
        exists: true,
        isInt: {
            options: { 
                min: 10000, 
                max: 99999, 
                allow_leading_zeros: false
            }
        }
    },
    num_bears: {
        in: ['body'],
        isInt: true,
    }
})
const getByIDValidations = checkSchema({
    id: {
        in: ['params'],
        isInt: true,
        exists: true,
    }
})
const searchSortBys = ['num_bears']
const searchValidations = checkSchema({
    start_date: {
        in: ['query'],
        toDate: true,
        isISO8601: true,
        optional: true,
    },
    end_date: {
        in: ['query'],
        toDate: true,
        isISO8601: true,
        optional: true,
    },
    bear_type: {
        in: ['query'],
        isLowercase: true,
        isIn: {
            options: [bear_types],
            errorMessage: `Invalid bear type. Must be one of these: ${bear_types.join(', ')}`
        },
        isString: true,
        optional: true,
    },
    zip_code: {
        in: ['query'],
        isInt: true,
        optional: true,
    },
    sort: {
        in: ['query'],
        isIn: {
            options: [searchSortBys],
            errorMessage: `Invalid sort type. Must be one of these: ${searchSortBys.join(', ')}`
        },
        optional: true,
    }


})
// API ENDPOINTS
/**
 * POST /sighting
 * Example POST body: 
 * { bear_type: 'grizzly', 
 *   notes: 'It was a big one!', 
 *   zip_code: '90210', 
 *   num_bears: 3 
 * }
 */
app.post('/sighting', postValidations, async (req,res) => {
    const err = validationResult(req)
    if(!err.isEmpty()){
        return res.status(422).json({ errors: err.array() })
    }

    const sighting = req.body
    const query = `
        INSERT INTO sightings (
            bear_type, 
            notes, 
            zip_code, 
            num_bears, 
            createdAt, 
            updatedAt
        )
        VALUES (
            '${sighting.bear_type}', 
            '${sighting.notes}', 
            ${sighting.zip_code}, 
            ${sighting.num_bears}, 
            current_timestamp, 
            current_timestamp
        )
        RETURNING *
        ;
    `
    db.one(query)
    .then(data => {
        return res.json(data)
    })
    .catch(err => {
        return res.status(502)
        .json({ type: 'DBError', errors: err })
    })
})

/**
 * GET /sighting/:id
 * Return a single sighting object queried by its ID
 */
app.get('/sighting/:id', getByIDValidations, async (req,res) => {
    const err = validationResult(req)
    if(!err.isEmpty()){
        return res.status(422).json({ errors: err.array() })
    }

    const query = `
        SELECT * FROM sightings
        WHERE id = ${req.params.id};
    `
    db.one(query)
    .then(data => {
        return res.json(data)
    })
    .catch(err => {
        return res.status(502)
        .json({ type: 'DBError', errors: err })
    })
})

/**  
 * GET /sighting/search
 * Return an array of sightings, include a unique ID with each. 
 * Supported query params: all optional 
 *   start_date (inclusive) (default: all time) 
 *   end_date (inclusive) (default: all time) 
 *   bear_type (default: all types) 
 *   zip_code (default: all zip codes) 
 *   sort (default: created timestamp, ascending. 
 *                  only supported value is num_bears)
 * 
 */
app.get('/sightings/search', searchValidations, (req:any,res: Response) => {
    const err = validationResult(req)
    if(!err.isEmpty()){
        return res.status(422).json({ errors: err.array() })
    }

    // Query Params
    const p = req.query
    // Make Date SQL
    let ops  = []
    let sort;
    if(p.start_date && p.end_date) {
        ops.push(`createdat BETWEEN ${p.start_date} AND ${p.end_date}`)
    } else if(p.start_date) {
        ops.push(`createdat > ${p.start_date}`)
    } else if(p.end_date) {
        ops.push(`createdat < ${p.end_date}`)
    }

    if(p.bear_type) {
        ops.push(`bear_type = '${p.bear_type}'`)
    }

    if(p.zip_code) {
        ops.push(`zip_code = ${p.zip_code}`)
    }
    
    if(p.sort) {
        sort = `ORDER BY ${p.sort} ASC`
    } else {
        sort = 'ORDER BY createdat ASC'
    }

    let query;

    if(ops.length > 0) {
        query = `
            SELECT * FROM sightings
            WHERE ${ops.join(' AND ')}
            ${sort}
            ;
        `
    } else {
        query = `
            SELECT * FROM sightings
            ${sort}
            ;
        `
    }

    //return res.json(req.query)

    db.many(query)
    .then(data => {
        return res.json(data)
    })
    .catch(err => {
        return res.status(502)
        .json({ type: 'DBError', message: err.message })
    })
})

// Export the app
export default app
export { db_config }