// create
// read
// update
// delete

const { Users, Products, Cart } = require('../Models/Model');
/**
 * @params {Model}  - mongoose Model - COMPULSORY
 * @params {filter} - Object - parameter of the find function for mongodb; assigned {} if this argument not passed
 * @params {population} - Object - population - {populate : Boolean , field : String} - DEFAULT => {populate : false, field: ''}
 * @params {findOne} - Boolean - if true - findOne if false find - one document or multiple document
 * @params {skip} - Boolean 
 * @params {limit} - Object - {limit : Boolean, limitField: the parameter for limit as limit(limitField)}
 */
const readData = async (params) => {
    const { Model } = params;
    let population = params.hasOwnProperty("population") ? params.population : { populate: false, field: '' };
    let filter = params.hasOwnProperty("filter") ? params.filter : {};
    let findOne = params.hasOwnProperty("findOne") ? params.findOne : false;
    let skip = params.hasOwnProperty("skip") ? params.skip : { skip: false, skipField: null };
    let limit = params.hasOwnProperty("limit") ? params.limit : { limit: false, limitField: null };
    let data;
    if (findOne) {
        if (population.populate) {
            data = await Model.findOne(filter).populate(population.field);
        } else {
            data = await Model.findOne(filter);
        }
    } else {
        if (population.populate) {
            data = await Model.find(filter).populate(population.field);
        } else {
            data = await Model.find(filter);
        }
        if (limit.limit) {
            data = await Model.find({}).limit(limit.limitField);
        }
        if (limit.limit && skip.skip) {
            data = await Model.find({}).skip(skip.skipField).limit(limit.limitField);
        }
    }
    return data;
}

/**
 * @params {Model} - mongoose Model - COMPULSORY
 * @params {filter} - filter to search out for- COMPULSORY 
 * @params {data} - data to be updated- COMPULSORY
 */
const updateData = async (params) => {
    const { Model, filter, data } = params
    await Model.updateOne(filter, data);
}

/**
 * @params {Model} - mongoose Model - COMPULSORY
 * @params {filter} - filter to search out for- COMPULSORY 
 */
const deleteData = async (params) => {
    const { Model, filter } = params;
    await Model.deleteOne(filter);
}

module.exports = {
    readData,
    updateData,
    deleteData
}
