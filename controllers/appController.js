// TODO - connect to Mongoose
// import people model
const measuredValue = require('../models/measuredValue')

// handle request to get all people data instances
const getAllData = async (req, res, next) => {
    try {
        const values = await measuredValue.find().lean()
        return res.render('test_data', {data: values})
    } catch (err) {
        return next(err)
    }
}

// handle request to get one data instance
// NOT USED YET
const getDataById = async (req, res, next) => {
    // search the database by ID
    try {
        const value = await measuredValue.findById(req.params.measuredValue_id).lean() 
        if (!value) {
        // no value found in database return res.sendStatus(404)
            return res.sendStatus(404)
        }
        // found person
        return res.render('oneData', {oneItem: value})
    } catch (err) { 
        return next(err)
    }        
}

// exports an object, which contain functions imported by router
module.exports = {
    getAllData,
    //getDataById,
}

