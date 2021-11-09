//Andrew Wynne 
//Assignment 4
// July 28 2021


// import dependencies you will use
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//What is this programming construct or structure in js?
//Destructuring an object example in tests.js
const { check, validationResult, header } = require('express-validator');
const { parse } = require('path');
// set up variables to use packages
var myApp = express();
myApp.use(express.urlencoded({ extended: false }));
//parse application json
myApp.use(express.json());
// set path to public folders and view folders
myApp.set('views', path.join(__dirname, 'views'));
//use public folder for CSS etc.
myApp.use(express.static(__dirname + '/public'));
myApp.set('view engine', 'ejs');

//mongoDB
//mongoose.connect('mongodb://localhost:27017/Assignment4',
mongoose.connect('mongodb+srv://admin:admin@orders.5wsrb.mongodb.net/Orders',
{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//Order object that will send the info to the database
const Order = mongoose.model('Order',{
    name: String,
    address: String,
    pcode: String,
    province: String,
    country: String,
    waterQuantity: Number,
    waterTotal: Number,
    chipsQuantity: Number,
    chipsTotal: Number,
    taxPercent: String,
    subTotal: Number,
    salesTotal: Number
} );   

// set up different routes (pages) of the website
myApp.get('/', function (req, res) {
    res.render('form'); 
});

//variables
const waterPrice = 5;
const chipsPrice = 4;
const minPrice = 10;
var quantityCheck;
var itemQuantities = [];
var taxPercent;
const salesTax = [0.05, 0.11, 0.12, 0.13, 0.15];
var currentTax;
var waterTotal;
var chipsTotal;
var subTotal;
var salesTotal;
var errorMessage = '';
const provinces = {
    AB: 'Alberta',
    BC: 'British Columbia',
    MB: 'Manitoba',
    NB: 'New Brunswick',
    NL: 'Newfoundland and Labrador',
    NT: 'Northwest Territories',
    NS: 'Nova Scotia',
    NU: 'Nunavut',
    ON: 'Ontario',
    PE: 'Prince Edward Island',
    QC: 'Quebec',
    SK: 'Saskatchewan',
    YT: 'Yukon'
}

//Checks all the validation conditions before going to execute the function
myApp.post('/', [
    check('name', 'Name is required!').notEmpty(),
    check('province', 'Province is required!').notEmpty(),
    check('address', 'Address is required!').notEmpty(),
    check('water', '').custom(customItemQuantity),
    check('chips', '').custom(customItemQuantity)
], function (req, res) {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        res.render('form', {
            errors: errors.array()
        });
    }
    else {

        var name = req.body.name;
        var pcode = req.body.postalcode;
        var country = req.body.country;
        var province = req.body.province;
        var address = req.body.address;
        itemQuantities[0] = req.body.water;
        itemQuantities[1] = req.body.chips;
        errorMessage = '';
        //checks which province was selected and applies the appropriate sales tax
        switch (province) {
            case provinces.AB:
                currentTax = salesTax[0];
                taxPercent = '5%';
                break;
            case provinces.BC:
                currentTax = salesTax[2];
                taxPercent = '12%';
                break;
            case provinces.MB:
                currentTax = salesTax[2];
                taxPercent = '12%';
                break;
            case provinces.NB:
                currentTax = salesTax[4];
                taxPercent = '15%';
                break;
            case provinces.NL:
                currentTax = salesTax[4];
                taxPercent = '15%';
                break;
            case provinces.NT:
                currentTax = salesTax[0];
                taxPercent = '5%';
                break;
            case provinces.NS:
                currentTax = salesTax[4];
                taxPercent = '15%';
                break;
            case provinces.NU:
                currentTax = salesTax[0];
                taxPercent = '5%';
                break;
            case provinces.ON:
                currentTax = salesTax[3];
                taxPercent = '13%';
                break;
            case provinces.PE:
                currentTax = salesTax[4];
                taxPercent = '15%';
                break;
            case provinces.QC:
                currentTax = salesTax[4];
                taxPercent = '15%';
                break;
            case provinces.SK:
                currentTax = salesTax[1];
                taxPercent = '1%';
                break;
            case provinces.YT:
                currentTax = salesTax[0];
                taxPercent = '5%';
                break;
            default:
                currentTax = salesTax[3];
                taxPercent = '13%';
                break;
        }
        waterTotal = waterPrice * itemQuantities[0];
        chipsTotal = chipsPrice * itemQuantities[1];
        subTotal = ((waterTotal + chipsTotal) * currentTax.toFixed(2));
        salesTotal = ((waterTotal + chipsTotal) + subTotal);
        if ((waterTotal + chipsTotal) < minPrice) {
            res.render('form', { errorMessage: 'The minnimum purchase ammount is 10$. Please try again.' });
        }
        else {
            var pageData = {
                name: name,
                address: address,
                pcode: pcode,
                province: province,
                country: country,
                waterQuantity: itemQuantities[0],
                waterTotal: waterTotal,
                chipsQuantity: itemQuantities[1],
                chipsTotal: chipsTotal,
                taxPercent: taxPercent,
                subTotal: subTotal,
                salesTotal: salesTotal
            }
            //creates a new order using the info gathered from the form
            var newOrder = new Order(
                pageData
            );
            newOrder.save().then(() => console.log('New order saved'));
            res.render('form', pageData);
        }
    }
});
//views and displays all the orders from the database
myApp.get('/dbdata', function(req, res){
    Order.find({}).exec(function(err, orders){
        console.log(err);
        res.render('dbdata', {orders:orders});
    });
});

//this will check if there is atleast 1 valid number in either of the quantity fields and if not will throw an error
function customItemQuantity(value) {
    if (!isNaN(value)) {
        quantityCheck = 0;
        return true;
    }
    else {
        quantityCheck++;

    }
    if (quantityCheck == 2) {
        throw new Error('You must buy atleast 1 item');
    }
    return true;
}

myApp.listen(8080);
console.log('Everything executed fine.. website at port 8080....');


