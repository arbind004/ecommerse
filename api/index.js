var express = require('express');
var app = express();
var bodyParser = require('body-parser');
//var parser = require('json-parser');
const { v4: uuidv4 } = require('uuid');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
app.use(bodyParser.json())
app.use('/static', express.static('public'));
var dbUrl =  "mongodb+srv://ak004:shTGSHJYS2544@cluster0.y3jbuqv.mongodb.net/";
var dbName= "ecommerse";

// Use connect method to connect to the server
MongoClient.connect(dbUrl, function(err, client) {
    async function run() {
  
      try {
  
          await client.connect();
  
          console.log("MongoDB Connected successfully to server");
  
      } catch (err) {
  
          console.log(err.stack);
  
      }
  
      finally {
  
          await client.close();
  
      }
  
  }
     //const assert = require('assert');
    // console.log('MongoDB Connected successfully to server');
    const db = client.db(dbName);
    app.locals.db = db;
  });
  
// app.use('/api', router);

// router.get('/demo', function(req, res){
//     res.json("DEMO API TEST");
//     console.log('/demo api hit');
// });
// router.get('/', function(req, res){
//     res.json("DEMO API TEST");
//     console.log('/demo api hit');
// });

app.get('/', (req, res) => {
    res.json({"msg":"Hello World!"});
})


app.get('/checkversion/:version', (req, res) => {
    var version=req.params.version;
    var currentversion="3";
    if(version >= currentversion)
    {
        res.json({"version":version, "newversionavaible":false});
    }
    else
    {
        res.json({"version":version, "newversionavaible":true});
    }
    
})

app.post('/register', (req, res) => {
    const db = req.app.locals.db;
    var email = req.body.email;
    var name = req.body.name;
    //var newotp="1234";
    var newotp = Math.floor(Math.random() * 9000) + 1000;

    const collectionA = db.collection('otp');
    collectionA.find({"email":email}).limit(1).sort({_id:-1}).toArray(function (err, result) {
      if (err) {
        console.log(err);
      } else if (result.length) {
        
         ////////update otp start//////////
         collectionA.updateOne(
          {"email":email}, // query
          {$set: {"otp": ""+newotp+""}}, // replacement, replaces only the field "hi"
          {}, // options
          function(err, object) {
          });
         ///////update otp close///////////
        console.log("Update work");
        res.json({"email":email,"name":name,"register":true,"msg":"Re-Register sucessfull"});
        
      }
      else
      {
        /////////insert new data start here////////
        var data2={'name': name, 'email': email, 'otp': ""+newotp+""};
    
        collectionA.insert(data2, {w:1}, function(err, result) {
          if (err) {
            res.end("Registration Error1");
            console.warn(err.message);  // returns error if no matching object found
          } else {
           
          }
        });
        ///////// insert new data close///////////
        console.log("insert new");
      }
      res.json({"email":email,"name":name,"register":true,"msg":"Register sucessfull"});
    });



    
})

app.post('/otpverify', (req, res) => {
    var email = req.body.email;
    var otp = req.body.otp;
    const db = req.app.locals.db;
    const collection = db.collection('otp');
    const collection2 = db.collection('user');
    var uid = uuidv4();
    collection.find({"email":email, "otp":otp}).limit(1).sort({_id:-1}).toArray(function (err, result) {
        if (err) {
          console.log(err);
        } else if (result.length) {
           var name = String(result[0]["name"]);

           collection2.find({"email":email}).limit(1).sort({_id:-1}).toArray(function (err, result2) {
            if (err) {
              console.log(err);
            } else if (result2.length) {
      ////////update otp start//////////
          collection2.updateOne(
          {"email":email}, // query
          {$set: {"akey": ""+uid+""}}, // replacement, replaces only the field "hi"
          {}, // options
          function(err, object) {
          });
         ///////update otp close///////////
        console.log("Update work");

            }
            else
            {
              var data2={'name': name, 'email': email, 'akey':uid};    
              collection2.insert(data2, {w:1}, function(err, result) {
                if (err) {
                  res.end("Registration Error1");
                  console.warn(err.message);  // returns error if no matching object found
                } else {
                 
                }
              });
            }
          });



            res.json({"email":email,"otpverify":true,"msg":"login sucessfull","akey":uid});
        } else {
            res.json({"email":email,"otpverify":false,"msg":"login failed"});
        }

         });

    
})

app.get('/productlist', (req, res) => {
    res.json({"result":true,"msg":"product list"});
})

app.get('/user/:key', (req, res) => {
  const db = req.app.locals.db;
  var key=req.params.key;

  const collection = db.collection('user');
  collection.find({"akey":key}).limit(1).sort({_id:-1}).toArray(function (err, result2) {
    if (err) {
      console.log(err);
    } else if (result2.length) {

  collection.find({}).sort({_id:-1}).toArray(function (err, result) {
    if (err) {
      console.log(err);
    } else if (result.length) {
      res.json({"result":true, "data":result});
    }
    else
    {
      res.json({"result":false, "data":[]});
    }
  });
}
else
{
  res.json({"result":false,"msg":"you are not authorized", "data":[]});
}
  });

})

app.get('/products/:key', (req, res) => {
  const db = req.app.locals.db;
  var key=req.params.key;

  const collection = db.collection('user');
  const collectionB = db.collection('products');
  collection.find({"akey":key}).limit(1).sort({_id:-1}).toArray(function (err, result2) {
    if (err) {
      console.log(err);
    } else if (result2.length) {
  collectionB.find({}).sort({_id:-1}).toArray(function (err, products) {
    if (err) {
      console.log(err);
    } else if (products.length) {
      res.json({"result":true, "totalresult": 0 ,"data":products});
    }
    else
    {
      res.json({"result":false, "data":[]});
    }
  });
}
else
{
  res.json({"result":false,"msg":"you are not authorized", "data":[]});
}
  });

})


app.post('/addproduct', (req, res) => {
  const db = req.app.locals.db;
  var name = req.body.name;
  var price = req.body.price;
  var img = req.body.img;
  var desc = req.body.desc;
  var discount = req.body.discount;
  var pid = Math.floor(Math.random() * 900000) + 1000;

  const collectionB = db.collection('products');

  var data2={'pid':""+pid+"",'name': name, 'price': price, 'img':img, 'desc':desc, 'discount':discount};    
  collectionB.insert(data2, {w:1}, function(err, result) {
    if (err) {
      res.end("Registration Error1");
      console.warn(err.message);  // returns error if no matching object found
    } else {
     
    }
  });
  res.json({"result":true,"msg":"PRODUCT ADD SUCCESSFULLY"});
});

app.get('/addcart/:pid/:key', (req, res) => {
  const db = req.app.locals.db;
  var key=req.params.key;
  var pid=req.params.pid;

  const collection = db.collection('user');
  const collectionB = db.collection('products');
  const collectionC = db.collection('cart');

  collection.find({"akey":key}).limit(1).sort({_id:-1}).toArray(function (err, result2) {
    if (err) {
      console.log(err);
    } else if (result2.length) {
      var email = String(result2[0]["email"]);
        collectionB.find({"pid":pid}).limit(1).sort({_id:-1}).toArray(function (err, result) {
        if (err) {
          console.log(err);
        } else if (result.length) {
          var name = String(result[0]["name"]);
          var price = String(result[0]["price"]);
          var desc = String(result[0]["desc"]);
          var img = String(result[0]["img"]);
          collectionC.find({"pid":pid,"email":email}).limit(1).sort({_id:-1}).toArray(function (err, result4) {
            if (err) {
              console.log(err);
            } else if (result4.length) {
              var quantity2 = parseInt(result4[0]["quantity"]);
              var quantityUP = (quantity2+1);
              var tpriceUpdate = (quantityUP*parseInt(price));
              collectionC.updateOne(
                {"pid":pid,"email":email}, // query
                {$set: {"quantity": ""+quantityUP+"","tprice": ""+tpriceUpdate+""}}, // replacement, replaces only the field "hi"
                {}, // options
                function(err, object) {
                });
            }
            else
            {
              var data2={'pid':""+pid+"",'name': name, 'price': price, 'img':img, 'desc':desc, 'quantity':"1",'tprice':price,'email':email};    
              collectionC.insert(data2, {w:1}, function(err, result3) {
                if (err) {
                  res.end("Registration Error1");
                  console.warn(err.message);  // returns error if no matching object found
                } else {             
                }
              });
            }
          });

          //here pid match 
          res.json({"result":true,"addcart":true,"name":name,"price":price, "msg":"product add to cart sucesssfully"});
        }
        else
        {
          res.json({"result":true,"addcart":false, "msg":"pid is invalid"});
          // pid not match    
        }
        });
      //res.json({"result":true,"addcart":true, "msg":"product add to cart sucesssfully"});
    }
    else{
      res.json({"result":false,"addcart":false, "msg":"you are not authorized"});
    }
  });
});

app.get('/removecart/:pid/:key', (req, res) => {
  const db = req.app.locals.db;
  var key=req.params.key;
  var pid=req.params.pid;

  const collection = db.collection('user');
  const collectionB = db.collection('products');
  const collectionC = db.collection('cart');

  collection.find({"akey":key}).limit(1).sort({_id:-1}).toArray(function (err, result2) {
    if (err) {
      console.log(err);
    } else if (result2.length) {
      var email = String(result2[0]["email"]);
          collectionC.find({"pid":pid,"email":email}).limit(1).sort({_id:-1}).toArray(function (err, result4) {
            if (err) {
              console.log(err);
            } else if (result4.length) {
              //here pid match 
             
              res.json({"result":true,"removecart":true, "msg":"product remove from cart sucesssfully"});
            }
            else
            {
              res.json({"result":true,"removecart":false, "msg":"product remove from cart failed"});
            }
          });

      //res.json({"result":true,"addcart":true, "msg":"product add to cart sucesssfully"});
    }
    else{
      res.json({"result":false,"addcart":false, "msg":"you are not authorized"});
    }
  });
});

app.get('/mycart/:key', (req, res) => {
  const db = req.app.locals.db;
  var key=req.params.key;

  const collection = db.collection('user');
  const collectionB = db.collection('cart');
  collection.find({"akey":key}).limit(1).sort({_id:-1}).toArray(function (err, result2) {
    if (err) {
      console.log(err);
    } else if (result2.length) {
      var email = String(result2[0]["email"]);
  collectionB.find({"email":email}).sort({_id:-1}).toArray(function (err, cart) {
    if (err) {
      console.log(err);
    } else if (cart.length) {
      res.json({"result":true, "totalresult": cart.length ,"data":cart});
    }
    else
    {
      res.json({"result":false, "data":[]});
    }
  });
}
else
{
  res.json({"result":false,"msg":"you are not authorized", "data":[]});
}
  });

})



app.listen(4044);
console.log('Running on port 4044');
      