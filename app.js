const express = require("express");
const app = express();
const bodyParser = require("body-parser")
const date=require(__dirname+"/date.js");
const _=require("lodash")
app.use( function(req, res, next) {

  if (req.originalUrl && req.originalUrl.split("/").pop() === 'favicon.ico') {
    return res.sendStatus(204);
  }

  return next();

});
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");
app.use(express.static("public"));
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://admin_nisha:Star123@cluster0.waeg9.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
const todoSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", todoSchema);
const item1 = new Item({
  name: "Hit + to add new list items"
});
const item2 = new Item({
  name: "create own custom list by adding custom name after localhost:3000/"
});
const item3 = new Item({
  name: "<-- check box to delete"
});
const listSchema = new mongoose.Schema({
  name: String,
  list: [todoSchema]
});
const newList = mongoose.model("newList", listSchema);
const defaultItems = [item1, item2, item3];

// const items = ["eat", "bath"];

app.get("/", function(req, res) {

  Item.find({}, function(err, results) {
    if (results.length == 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err)
          console.log(err);
        else
          console.log("succesfully added!");
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listName: date.getDate(),
        newItemList: results
      })
    }
  });
});

app.post("/", function(req, res) {
  const item = req.body.newItem;
  console.log(req.body.button);
  const abc=req.body.button;
  const itemName=new Item({
    name:item
  });

  if (abc === date.getDay()+",") {
    itemName.save();
    res.redirect("/");
  } else {
    newList.findOne({name:abc},function(err,foundList){
      foundList.list.push(itemName);
      foundList.save();
    res.redirect("/"+abc)

    })
}
})
app.get("/about", function(req, res) {
  res.render("about")
});

app.post("/delete",function(req,res)
{
  const listName=req.body.listName;
  const checkBoxId=req.body.checkBox;
  if(listName==date.getDate()){
    Item.findByIdAndRemove(checkBoxId,function(err){
      if(err)
      console.log((err));
      else
      console.log("succesfully deleted!");
      res.redirect("/");
    });
  }
  else{
    newList.findOneAndUpdate({name:listName},{$pull: {list :{_id :checkBoxId}}},function(err,foundList){
      if(!err)
      res.redirect("/"+listName);
    });
  }


});


app.get("/:category",function(req,res){
const category=_.capitalize(req.params.category);
newList.findOne({name:category},function(err,result){
  if(err)
  console.log(err);
  else{

    if(!result)
  {
    console.log("does not exist");
    const list = new newList({
      name: category,
      list:defaultItems
    });
    list.save();
    res.redirect("/"+category)
  }
    else
    {
      console.log("exists");
    res.render("list", {
      listName: result.name,
      newItemList: result.list
    })
  }
  }
})

})
app.listen(process.env.PORT||3000, function() {
  console.log("Server running on port 3000");
})
