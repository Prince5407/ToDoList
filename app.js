//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _ =require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});
main().catch(err => console.log(err));
 
async function main() {
  await mongoose.connect('mongodb+srv://nikunjmahajan54:3sKQSvdPYUdGkn9Q@cluster0.xwudmca.mongodb.net/todolistDB');
}
const itemsSchema=new mongoose.Schema({

name:String


});

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({

name:"Welcome to you TodoList"

});

const item2=new Item({

  name:"Hit the + button to add a new item"
  
  });

  const item3=new Item({

    name:"<-- hit this to delete an item"
    
    });

    const defaultItems=[item1,item2,item3];

//     Item.insertMany(defaultItems).then (function () {
//   console.log("Successfully saved all the Items.");
// }) .catch(function (err) {
//   console.log(err);
// });


// Item.deleteOne({ _id: "646b252edc183921d5627672" })
// .then(function(){
// mongoose.connection.close();
// console.log("deleted");

// })
// .catch(err=>{
// console.log(err);

// })
   

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];


app.get("/", function(req, res) {

// const day = date.getDate();
 Item.find()
 .then(function(items){
if(items.length==0){
    Item.insertMany(defaultItems).then (function () {
  console.log("Successfully saved all the Items.");
}) .catch(function (err) {
  console.log(err);
});
res.redirect("/");
}
else{
  res.render("list", {listTitle: "Today", newListItems: items});
}
  
 })
.catch(function(err){

  console.log(err);
});



});

const listScheme={

name:String,
items:[itemsSchema]

};
const List=mongoose.model("List",listScheme);


app.get("/:customListName",function(req,res){

const customListName=_.capitalize( req.params.customListName);
const list=new List({
name:customListName,
items:defaultItems

});
List.findOne({name:customListName})
.then(function(foundList){
if(!foundList){

  console.log("not exist");
  list.save();
  res.redirect("/",customListName);
}

else{

 
  res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
}

})
.catch(function(err){


console.log(err);
});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
   
   const item =new Item({

 name:itemName

   });

   if(listName=="Today"){
    item.save();
    res.redirect("/");

   }
else{
List.findOne({name:listName})
.then(function(foundList){


foundList.items.push(item);
foundList.save();
res.redirect("/"+listName);

})

}
 
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});
app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox.trim();
  const listName=req.body.listName;

  if(listName=="Today"){
    Item.findByIdAndRemove(checkedItemId)
    .then(() => {
        console.log("Succesfully deleted checked item from the database");
        res.redirect("/");
    })
    .catch((err) => {
        console.log(err);
    })
  }

  else{
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    )
      .then(function (foundList) {
        res.redirect("/" + listName);
      })
      .catch(function (err) {
        console.log("err in delete item from custom list");
      });

  }
     
  


});
app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
