// src/routes/sightings.router.ts

import {Express, Router, Request, Response, NextFunction} from 'express'

let sightingsRouter = Router();
/**
 * Get Sighting
 * 
 * GET /sighting/:id
 */
function getById(req: Request, res: Response, next: NextFunction) {
    //let query = parseInt(req.params.id)
    res.json({
        id: 1,
        bear_type: 'grizzly',
        notes: 'It was a big one!', 
        zip_code: '90210', 
        num_bears: 3 
    })
    
}
sightingsRouter.get('/sighting/:id', (req,res) => {
    res.json({
        id: req.params.id,
        bear_type: 'grizzly',
        notes: 'It was a big one!', 
        zip_code: '90210', 
        num_bears: 3 
    })

})

export default sightingsRouter