#!/usr/bin/env node --harmony

'use strict';
const request = require("tinyreq");
const fs = require('fs');

const obj = require("./stock.json");


var chalk = require('chalk');
var clear = require('clear');
var figlet      = require('figlet');

var async = require("async")

//My modules
var mailer = require('./mailer')
// var styleCode = process.argv[2];

clear();
console.log(
  chalk.yellow(
    figlet.textSync('...Crep Checker...', { horizontalLayout: 'full' })
  )
);

let readList = fs.readFileSync('./readList.crep').toString().split('\n');
// console.log(readList)
mailer.sendStartedMail();

async.forever(function(next){
  readList.forEach(styleCode => {
    checkAvailability(styleCode.trim())
  })
  setTimeout(function(){
    next()
  }, 6000)

},function(err){
  console.log(err)
})

function checkAvailability(code){
  console.log('Checking availability of ' + code)
  request("http://production.store.adidasgroup.demandware.net/s/adidas-GB/dw/shop/v15_6/products/"+code+"?client_id=2904a24b-e4b4-4ef7-89a4-2ebd2d175dde&expand=availability%2Cvariations%2Cprices", function (err, body) {
      // console.log("http://production.store.adidasgroup.demandware.net/s/adidas-GB/dw/shop/v15_6/products/"+styleCode+"?client_id=2904a24b-e4b4-4ef7-89a4-2ebd2d175dde&expand=availability%2Cvariations%2Cprices")
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

        if(obj[code].stock != bodyJSON.inventory.stock_level && obj[code].hasOwnProperty("stock")){
          mailer.sendMail(name, sizeVal, bodyJSON.inventory.stock_level, code)
        }else{
          console.log("stock level of " + code + " not changed still " + obj[code].stock)
        }


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
      fs.writeFile('./stock.json', JSON.stringify(obj, null, 2) , 'utf-8');

  });
}





// program
// .arguments('')
// .option('-c, --styleCode <styleCode>', 'Style code of shoe to track')
// .action(function() {
//     co(function *() {
//       styleCode = yield prompt('styleCode: ');
//       console.log(chalk.bold.cyan('Watching style code: %s'),
//       styleCode);
//     });
//   })
// .parse(process.argv);

// console.log(styleCode)

// request("http://production.store.adidasgroup.demandware.net/s/adidas-GB/dw/shop/v15_6/products/BA8842?client_id=2904a24b-e4b4-4ef7-89a4-2ebd2d175dde&expand=availability%2Cvariations%2Cprices", function (err, body) {
//     //console.log(err || JSON.parse(body).inventory.stock_level); // Print out the HTML
//     if(JSON.parse(body).inventory.stock_level != obj.ultra_boost.stock){
//       //console.log('Sending Email...')
//       obj.ultra_boost.stock = JSON.parse(body).inventory.stock_level
//       fs.writeFile('./stock.json', JSON.stringify(obj, null, 2) , 'utf-8');
//     }
// });
