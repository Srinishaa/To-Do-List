const express = require("express");
const app = express();
const bodyParser = require("body-parser")
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const md5=require("md5");
require("dotenv").config();
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
const password=process.env.password;
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://admin_nisha:"+password+"@cluster0.waeg9.mongodb.net/todolistDB", {
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
let userZ;
let x;


app.post("/register", function(req, res) {
  user.findOne({
    username: req.body.username
  }, function(err, foundUser) {
    if (foundUser == null) {
      const userX = new user({
        username: req.body.username,
        password: md5(req.body.password)
      })
      userX.save(function(err) {
        user.findOne({
          username: req.body.username
        }, function(err, results) {
          // console.log(results.list);
          user.update({
            username: req.body.username
          }, {
            $set: {
              list: defaultItems
            }
          }, function(err) {
            if (err)
              console.log(err);
            else {
              res.redirect("/#login")
              console.log("succesfully added!");
            }
          });
        })
      })
    } else {
      res.render("home", {
        error: "error"
      })
    }
  })
})

app.post("/login", function(req, res) {
  user.findOne({
    username: req.body.username
  }, function(err, results) {
    if (results == null) {
      res.render("home", {
        error: "notFound"
      })
    } else if (!err) {
      userZ = results;
      if (results.password == md5(req.body.password)) {
        if (results.list.length == 0) {
          user.update({
            username: req.body.username
          }, {
            $set: {
              list: defaultItems
            }
          }, function(err) {
            if (err)
              console.log(err);
            else {
              res.render("main", {
                listName: date.getDate(),
                newItemList: results.list
              })
            }
          });
        } else {
          res.render("main", {
            listName: date.getDate(),
            newItemList: results.list
          })
        }
      }
    }
  })
})
app.get("/", function(req, res) {
  res.render("home", {
    error: "success"
  })
});

app.post("/login0.1", function(req, res) {
  const item = req.body.newItem;
  const button = req.body.button;
  const itemName = new Item({
    name: item
  });
  if (button === date.getDay() + ",") {
    userZ.list.push(itemName);
    userZ.save(function(err) {
      if (!err) {
        res.render("main", {
          listName: date.getDate(),
          newItemList: userZ.list
        })
      }
    });
  } else {
    (userZ.newList).forEach(function(item) {
      if (item.name == button) {
        item.list.push(itemName);
        userZ.save(function(err) {
          if (!err) {
            res.render("list", {
              listName: item.name,
              newItemList: item.list
            })
          }
        });
      }
    })
  }
})

app.get("/about", function(req, res) {
  res.render("about")
});

app.post("/delete", function(req, res) {
  const listName = req.body.listName;
  const checkBoxId = req.body.checkBox;
  if (listName == date.getDate()) {
    user.findOneAndUpdate({
      username: userZ.username
    }, {
      $pull: {
        list: {
          _id: checkBoxId
        }
      }
    }, function(err, found) {
      if (!err) {
        user.findOne({
          username: userZ.username
        }, function(err, result) {
          if (!err) {
            userZ = result;
            res.render("main", {
              listName: date.getDate(),
              newItemList: userZ.list
            })
          }
        })
      }
    })
  } else {
    (userZ.newList).forEach(function(item) {
      (item.list).forEach(function(subitem) {
        if (subitem._id == checkBoxId) {
          item.list.remove(subitem);
          userZ.save(function(err) {
            if (!err) {
              (userZ.newList).forEach(function(item) {
                if (item.name == listName) {
                  res.render("list", {
                    listName: item.name,
                    newItemList: item.list
                  })
                }
              })
            }
          });
        }
      })
    });
  }
});

app.get("/login", function(req, res) {
  res.render("main", {
    listName: date.getDate(),
    newItemList: userZ.list
  })
});


app.post("/addList", function(req, res) {
  const btn2 = _.capitalize(req.body.listName);
  if (userZ.newList.length == 0) {
    user.updateOne({
      username: userZ.username
    }, {
      $push: {
        newList: {
          list: defaultItems,
          name: btn2
        }
      }
    }, function(err) {
      if (err)
        console.log(err);
      else {
        user.findOne({
          username: userZ.username
        }, function(err, result) {
          if (!err) {
            userZ = result;
            (userZ.newList).forEach(function(items) {
              if (items.name == btn2) {
                console.log(items.list);
                res.render("list", {
                  listName: items.name,
                  newItemList: items.list
                })
              }
            })
          }
        })
      }
    });
  } else {
    (userZ.newList).forEach(function(item) {
      if (item.name == btn2) {
        x = true;
        res.render("list", {
          listName: item.name,
          newItemList: item.list
        });
      }
    });
    if (x != true) {
      user.updateOne({
        username: userZ.username
      }, {
        $push: {
          newList: {
            list: defaultItems,
            name: btn2
          }
        }
      }, function(err) {
        if (err)
          console.log(err);
        else {
          user.findOne({
            username: userZ.username
          }, function(err, result) {
            if (!err) {
              userZ = result;
              (userZ.newList).forEach(function(item) {
                if (item.name == btn2) {
                  console.log(item.list);
                  res.render("list", {
                    listName: item.name,
                    newItemList: item.list
                  })
                }
              })
            }
          })
        }
      });
    };
  }

});
app.listen(process.env.PORT || 3000, function() {
  console.log("Server running on port 3000");
})


// https://agile-sands-40636.herokuapp.com/
// "mongodb+srv://admin_nisha:+"password"+@cluster0.waeg9.mongodb.net/todolistDB"
// "mongodb://localhost:27017/todolistDB"
