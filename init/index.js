const mongoose=require("mongoose");
const initdata=require("./data.js");
const Listing=require("../models/listing.js");
main().then(()=>{
    console.log("connect to db");
}).catch((err)=>{
    console.log(err);
})


async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}


const initDb = async () => {
    await Listing.deleteMany({});
    initdata.data=initdata.data.map((obj)=>({...obj,owner:"68f7410677d6affebe2d1445"}));
    await Listing.insertMany(initdata.data);
    console.log("data was initialize");
}
initDb();