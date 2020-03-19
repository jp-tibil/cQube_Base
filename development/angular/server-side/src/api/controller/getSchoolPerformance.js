const router = require('express').Router();
var log4js = require('log4js');
var logger = log4js.getLogger();
const csv = require('csvtojson')
var const_data = require('../config/aws-config');

router.get('/',   async(req, res)=> {
    // const_data['getParams']['Key'] = 'Output/KPI.json'
    // logger.debug("Some debug messages");
    // const_data['s3'].getObject(const_data['getParams'], function (err, data) {

    //     if (err) {
    //         console.log(err);
    //     } else {
    //         const JSONdata = JSON.parse(data.Body.toString())

    //         res.send(JSONdata);

    //         logger.debug("Some debug messages");

    //     }

    // })

    const csvFilePath = '/home/dheeraj/Desktop/NodeCode/scatter_plot_data.csv';
    const jsonArray = await csv().fromFile(csvFilePath);
    res.send(jsonArray);
});

module.exports = router;