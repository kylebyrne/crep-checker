#!/usr/bin/env node --harmony

'use strict';
const request = require("tinyreq");
const fs = require('fs');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const async = require("async");

//My modules
const mailer = require('./mailer')
const obj = require("./stock.json");
let readList = fs.readFileSync('./readList.crep').toString().split('\n');

//Initial terminal clearing and title
clear();
console.log(
  chalk.red(
    figlet.textSync('...Crep Checker...', { horizontalLayout: 'full' ,
  font: '3-d'})
  )
);
console.log(
  chalk.blue((figlet.textSync('Adidas', {
    font: 'doom'
  }))
));

//alert user if bot restarted
mailer.sendStartedMail();

//Use async forever to initiate the check function every 6 minutes

async.forever(function(next){
  readList.forEach(styleCode => {
    checkAvailability(styleCode.trim())
  })
  setTimeout(function(){
    next()
  }, 60000)

},function(err){
  console.log(err)
})

function checkAvailability(code){

  console.log('Checking availability of ' + code)
  request("http://production.store.adidasgroup.demandware.net/s/adidas-GB/dw/shop/v15_6/products/"+code+"?client_id=2904a24b-e4b4-4ef7-89a4-2ebd2d175dde&expand=availability%2Cvariations%2Cprices", function (err, body) {
      if(err){
        console.error("Error: " + err)
      }


      const bodyJSON = JSON.parse(body)

      if(!obj.hasOwnProperty(code)){
            obj[code] = {}
      }

      if(bodyJSON.hasOwnProperty("variation_attributes")){
        const sizeVal = bodyJSON.variation_attributes[0].values
        const name =bodyJSON.name

        //check if stock level has increased from database and send alerts
        if(obj[code].stock < bodyJSON.inventory.stock_level && obj[code].hasOwnProperty("stock")){
          mailer.sendMail(name, sizeVal, bodyJSON.inventory.stock_level, code)
        }else{
          console.log("stock level of " + code + " not changed still " + obj[code].stock)
        }

        //create JSON database
        obj[code].name = name
        obj[code].stock = bodyJSON.inventory.stock_level
        obj[code].orderable = {};

        sizeVal.forEach(function(val){
          obj[code].orderable[val.name] = val.orderable
        })

      }
      else{
        console.log("Product with style code: " + code + " isnt available");
        obj[code].stock = 0
      }
      //save the modified JSON object
      fs.writeFile('./stock.json', JSON.stringify(obj, null, 2) , 'utf-8');
  });
}

