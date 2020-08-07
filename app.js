const express = require("express");
const app = express();
const bodyParser = require("body-parser")
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const md5=require("md5");
app.use(function(req, res, next) {
if (req.originalUrl && req.originalUrl.split("/").pop() === 'favicon.ico') {
  return res.sendStatus(204);
}
return next();
});
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set("view engine", "ejs");

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
//--------

const todoSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", todoSchema);
const item1 = new Item({
  name: "Hit + to add new list items"
});

const item2 = new Item({
  name: "<-- check box to delete"
});
//--------

const listSchema = new mongoose.Schema({
  name: String,
  list: [todoSchema]
});
const newList = mongoose.model("newList", listSchema);
const defaultItems = [item1, item2];
//--------

const userSchema = new mongoose.Schema({
  username: String,
  password:String,
  list: [todoSchema],
  newList:[listSchema]
});
const user = mongoose.model("user", userSchema);
let userZ=[];
let charles;

//--------


app.post("/register", function(req, res) {
console.log(req.body.username);
  const userX = new user({
    username:req.body.username,
    password:md5(req.body.password)
  })
  userX.save(function(err) {
    user.findOne({username:req.body.username}, function(err, results) {
    // console.log(results.list);
    user.update({username:req.body.username},{$set:{list:defaultItems}}, function(err) {
          if (err)
            console.log(err);
          else{
          res.redirect("/#login")
          console.log("succesfully added!");
          }
            });
    })
    })
  })

app.post("/login", function(req, res) {
  user.findOne({
    username: req.body.username
  }, function(err,abc) {
         userZ=abc;
    if (!err) {
      if (abc.password ==md5(req.body.password)) {
        user.findOne({username:req.body.username}, function(err, results) {
        // console.log(results.list);
          if (results.list.length == 0) {
          user.update({username:req.body.username},{$set:{list:defaultItems}}, function(err) {
              if (err)
                console.log(err);
              else{
                user.findOne({username:userZ.username},function(err,response){
                  if(!err)
                  {
                    res.render("main",{
                      listName: date.getDate(),
                      newItemList: response.list
                        })
                  }
                })
                }
            });
          }
           else {
            // console.log(results);
            res.render("main", {
              listName: date.getDate(),
              newItemList: results.list
            })
          }
          })
          }
          }
          })
          })
app.get("/", function(req, res) {
res.render("home")
});

app.post("/login0.1", function(req, res) {
  const item = req.body.newItem;
  // console.log(req.body.button);
  const abc = req.body.button;
  const itemName = new Item({
    name: item
  });
  if (abc === date.getDay() + ",") {
    userZ.list.push(itemName);
    userZ.save(function(err){
      if(!err){
        user.findOne({username:userZ.username},function(err,response){
          if(!err)
          {
            res.render("main",{
              listName: date.getDate(),
              newItemList: response.list
                })
          }
        })
        }
    });

  } else  {
    user.findOne({username:userZ.username},function(err,response){
        if(!err)
        {

            // console.log(response.newList);
            (response.newList).forEach(function(item){
              if(item.name==abc){
                item.list.push(itemName);
                response.save(function(err){if(!err){
                  // console.log(item.list);
                  res.render("list",{
                  listName:item.name,
                  newItemList:item.list
                    })
                }});
              }
                })
              }
});
                }
                })

app.get("/about", function(req, res) {
  res.render("about")
});

app.post("/delete", function(req, res)
{
  const listName = req.body.listName;
  const checkBoxId = req.body.checkBox;
  if (listName == date.getDate()) {
    user.findOneAndUpdate({
      username:userZ.username
    }, {
      $pull: {
        list: {
          _id: checkBoxId
        }
      }
    }, function(err,found) {
      if (!err){
        user.findOne({username:userZ.username},function(err,response){
          if(!err)
          {
            userZ=response;
            res.render("main",{
              listName: date.getDate(),
              newItemList: response.list
                })
          }
        })
        }
      })
    }
else  {
  user.findOne({username:userZ.username},function(err,response){
      if(!err)
      {
          // console.log(response.newList);
          (response.newList).forEach(function(item){
            (item.list).forEach(function(y){

              if(y._id==checkBoxId){
                console.log(y);
                 item.list.remove(y);
                response.save();
                          // console.log(response.newList);
                          (response.newList).forEach(function(item){
                            if(item.name==listName){
                              // console.log(item.list);
                              res.render("list",{
                              listName:item.name,
                              newItemList:item.list
                                })
                }
                })

                }


                }
            )
          });
              }
              })
              }
});

app.get("/login",function(req,res){
  res.render("main",{
    listName: date.getDate(),
    newItemList: userZ.list
  })
});
// app.get("/login/:category"||"/delete/:category"||"/login0.1/:category", function(req, res) {
//   const category = _.capitalize(req.params.category);
//   user.findOne({
//     {username:userZ.username}
//   }, function(err, result) {
//     // console.log(result);
//     if (err)
//       console.log(err);
//     else {
//       if (!result) {
//
//
//           user.updateOne({username:userZ.username},{$push:{newList:{list:defaultItems,name:category}}}, function(err) {
//               if (err)
//                 console.log(err);
//               else{
//                 user.findOne({username:userZ.username},function(err,response){
//                   if(!err)
//                   {
//                       // console.log(response.newList);
//                       (response.newList).forEach(function(item){
//                         if(item.name==category){
//                           console.log(item.list);
//                           res.render("list",{
//                           listName:item.name,
//                           newItemList:item.list
//                             })
//                         }
//                       })
//
//                   }
//                 })
//                 }
//                 });
//
//       } else {
//         user.findOne({username:userZ.username},function(err,response){
//           if(!err)
//           {
//
//               (response.newList).forEach(function(item){
//                 if(item.name==category){
//                   res.render("list",{
//                   listName:item.name,
//                   newItemList:item.list
//                     })
//                 }
//               })
//
//           }
//         })
//         }
//     }
//   })
// })

app.post("/addList", function(req, res) {
  const btn2 = _.capitalize(req.body.listName);
  user.findOne({username:userZ.username},function(error,response){
    if(!error)
    {
      // console.log(response.newList);
if(response.newList.length==0)
{
  console.log("hi bye");
  user.updateOne({username:userZ.username},{$push:{newList:{list:defaultItems,name:btn2}}}, function(err) {
  if (err)
    console.log(err);
  else{
    user.findOne({username:userZ.username},function(err,respons){
      if(!err)
      {
          // console.log(respons.newList);
          (respons.newList).forEach(function(items){
            if(items.name==btn2){
              console.log(items.list);
              res.render("list",{
              listName:items.name,
              newItemList:items.list
                })
}
})
}
})
}
});
}
else {
  (response.newList).forEach(function(it){
    if(it.name==btn2){
      charles=true;
      // console.log(it.name);
          res.render("list",{
          listName:it.name,
          newItemList:it.list
        });
      }
    });
    if(charles!=true)
      {
      // user.findOne({username:userZ.username}, function(err,test) {
      //   console.log(test);
      //   if(!err){
          user.updateOne({username:userZ.username},{$push:{newList:{list:defaultItems,name:btn2}}}, function(err) {
          if (err)
            console.log(err);
          else{
            console.log("error");
            user.findOne({username:userZ.username},function(err,respons){
              if(!err)
              {
                  console.log(respons.newList);
                  (respons.newList).forEach(function(item){
                    if(item.name==btn2){
                      console.log(item.list);
                      res.render("list",{
                      listName:item.name,
                      newItemList:item.list
                        })
        }
        })
        }
        })
        }
      });
        };
        }
        }

        //   }
        // )};

        });
        });
app.listen(process.env.PORT || 3000, function() {
  console.log("Server running on port 3000");
})


// https://agile-sands-40636.herokuapp.com/
// "mongodb+srv://admin_nisha:Star123@cluster0.waeg9.mongodb.net/todolistDB"
