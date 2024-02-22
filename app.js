const express = require("express");
const bodyparser = require("body-parser");
const app = express();
const mongoose = require("mongoose"); 
const _ = require("lodash")
// mongoose.connect("mongodb+srv://ritikjaiswal17904:ritikjaiswal17904@cluster0.0gvplhb.mongodb.net/todolistDB", { useNewUrlParser: true })
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", { useNewUrlParser: true })

const todolistSchema = mongoose.Schema({
    name: "String"
})
const Item = mongoose.model("Item", todolistSchema)
const item1 = new Item({
    name: "Welcome to your todolist."
})
const item2 = new Item({
    name: "Hit the + button to add a new item."
})
const item3 = new Item({
    name: "<-- Hit this checkboc to delete."
})
const defaultItem = [item1, item2, item3]



const listSchema = {
    name: "String",
    items: [todolistSchema]
}
const List = mongoose.model("List", listSchema)


app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));

const items = [];
const workItems = [];


app.get("/", (req, res) => {
    Item.find().then((item) => {
        if (item.length === 0) {
            Item.insertMany(defaultItem).then(() => {
                console.log("Add success")
            }).catch((err) => {
                console.log(err);
            })
            res.redirect("/");
        } else {
            res.render("list", { kindOfDay: "Today", newItem: item });
        }

    }).catch((err) => { 
        console.log(err);
    })
});

app.post("/", (req, res) => {
    let itemName = req.body.Newitem;
    const listName = req.body.btn;
    const item = new Item({
        name: itemName,
    })

    if(listName==="Today"){
        item.save()
        res.redirect("/")
    }else{
        List.findOne({name:listName}).then((list)=>{
            list.items.push(item)
            list.save();
            res.redirect("/"+listName)
        })
    }
    
});

app.get("/work", (req, res) => {
    res.render("list", {
        kindOfDay: "Work List", newItem: workItems
    });
});

app.post("/delete", function (req, res) {
    const checkedItem = req.body.checkbox
    const listName = req.body.listName
    if(listName=== "Today"){
        Item.findOneAndRemove({ name: checkedItem }).then(() => {
            console.log("Remove success")
        }).catch((err) => {
            console.log(err);
        })
        
    res.redirect("/")
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{name:checkedItem}}}).then(() => {
            console.log("Remove success")
        }).catch((err) => {
            console.log(err);
        })
        res.redirect("/"+listName);
    }
    // console.log(checkedItem)

    

})
app.get("/:user", (req, res) => {
    // console.log(userSite)
    const userSite = _.capitalize(req.params.user);
    List.findOne({name:userSite}).then(function (list) {
        if(!list){
            const list = new List({
                name: userSite,
                items: defaultItem
            });
            list.save();
            res.redirect("/"+userSite)
        }else{
            res.render("list", { 
                kindOfDay: userSite, newItem: list.items });
        }
    }).catch(function(err){
        console.log(err);
    })
    

    
})
app.listen(3000, () => {
    console.log("Server started at port 3000");
});
