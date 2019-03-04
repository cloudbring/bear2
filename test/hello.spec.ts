// test/hello.spec.ts
import * as mocha from 'mocha'
import * as chai from 'chai'
import { expect } from 'chai'
import chaiHttp = require('chai-http')
import app from "../src/app"
chai.use(chaiHttp)

describe('POST /sighting', () => {
    it('Returns the sighting posted', () => {
        return chai.request(app)
        .post('/sighting')
        .type('application/json')
        .send({
            bear_type: 'grizzly',
            notes: 'It was a big one!', 
            zip_code: 90404, 
            num_bears: 3 
        })
        .then(res => {
            expect(res.status).to.eql(200, `[${res.status}] ${res.text}`)
            expect(res.type).to.eql('application/json')
            const stg = res.body
            expect(stg).to.deep.include({
                bear_type: 'grizzly',
                notes: 'It was a big one!', 
                zip_code: 90404, 
                num_bears: 3 
            })
        })
    })

})
describe('GET /sighting/:id', () => {
    // This test could fail without proper test isolation
    // (ie: Reset the database on every test, create id=1 and then test it)
    it('Returns a sighting for id=1', () => {
        return chai.request(app)
        .get('/sighting/1') 
        .type('application/json')
        .then(res => {
            expect(res.status).to.eql(200, `[${res.status}] ${res.text}`)
            expect(res.type).to.eql('application/json')
            const stg = res.body
            expect(stg).to.deep.include({ id: 1 })

            // Properties and existance are two different concerns
            // Should seperate out into seperate tests
            expect(stg).to.have.property('id').that.is.a('number')
            expect(stg).to.have.property('bear_type').that.is.a('string')
            expect(stg).to.have.property('notes').that.is.a('string')
            expect(stg).to.have.property('zip_code').that.is.a('number')
            expect(stg).to.have.property('num_bears').that.is.a('number')
            // Should test that the strings are actually dates
            expect(stg).to.have.property('createdat').that.is.a('string')
            expect(stg).to.have.property('updatedat').that.is.a('string')
        })
    })
})
/**
 * GET /sighting/search with query params
 */
describe('POST /sightings/search', () => {
    // This test could fail without proper test isolation
    // (ie: Reset the database on every test, create id=1 and then test it)
    it('Returns sightings on a valid search', () => {
        return chai.request(app)
        .get('/sightings/search?bear_type=grizzly') 
        .type('application/json')
        .then(res => {
            expect(res.status).to.eql(200, `[${res.status}] ${res.text}`)
            expect(res.type).to.eql('application/json')
            const stg = res.body
            expect(stg[0]).to.deep.include({ id: 1 })
            // Properties and existance are two different concerns
            // Should seperate out into seperate tests
            expect(stg[0]).to.have.property('id').that.is.a('number')
            expect(stg[0]).to.have.property('bear_type').that.is.a('string')
            expect(stg[0]).to.have.property('notes').that.is.a('string')
            expect(stg[0]).to.have.property('zip_code').that.is.a('number')
            expect(stg[0]).to.have.property('num_bears').that.is.a('number')
            // Should test that the strings are actually dates
            expect(stg[0]).to.have.property('createdat').that.is.a('string')
            expect(stg[0]).to.have.property('updatedat').that.is.a('string')
        })
    })
    it('Rejects invalid query params', () => {
        return chai.request(app)
        .get('/sightings/search?bear_type=orange') // No Orange Bear exists
        .type('application/json')
        .then(res => {
            expect(res.status).to.eql(422, `[${res.status}] ${res.text}`)
        })
    })
    it('Ignores unimportant query params', () => {
        return chai.request(app)
        .get('/sightings/search?foo=bar') // No Orange Bear exists
        .type('application/json')
        .then(res => {
            expect(res.status).to.eql(200, `[${res.status}] ${res.text}`)
        })
    })

})