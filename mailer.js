module.exports = {
  sendMail :  sendMail,
  sendStartedMail : sendStartedMail
}

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'kyletbyrne96@gmail.com',
        pass: 'ybbazzsumaxmeglx'
    }
});

function sendMail(name, sizeVal, stock, styleCode){
  var mailOptions = {
      from: '"Our Code World " <myemail@gmail.com>', // sender address (who sends)
      to: 'ktbyrne@live.co.uk', // list of receivers (who receives)
      subject: 'Stock Alert On ' + name, // Subject line
      html: createHtml(name, sizeVal, stock ,styleCode)// html body
  };

  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          return console.log(error);
      }
      console.log('Message sent: ' + info.response);
  });
}

var options = {
    weekday: "long", year: "numeric", month: "short",
    day: "numeric", hour: "2-digit", minute: "2-digit"
};

function sendStartedMail(name, sizeVal, stock, styleCode){
  var mailOptions = {
      from: '"Our Code World " <myemail@gmail.com>', // sender address (who sends)
      to: 'ktbyrne@live.co.uk', // list of receivers (who receives)
      subject: 'Crep checker started', // Subject line
      html: 'Crep checker app has restarted at ' + (new Date()).toLocaleTimeString("en-us", options)// html body
  };

  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          return console.log(error);
      }

      console.log('Start Message sent: ' + info.response);
  });
}


function createHtml(name, sizeVal, stock, styleCode){
  msg = '<b>Stock Level on '+ name +' is now ' + stock + '</b><br> Sizes available : <br>'
  sizeVal.forEach(function(val){
      if(val.orderable){
        msg += val.name + '<br>'
      }
    }
  )
  msg += '<br> http://production.store.adidasgroup.demandware.net/s/adidas-GB/dw/shop/v15_6/products/'+code+'?client_id=2904a24b-e4b4-4ef7-89a4-2ebd2d175dde&expand=availability%2Cvariations%2Cprices'
  return msg
}
