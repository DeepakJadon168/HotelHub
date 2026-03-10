//iske andar ham initixation ka pura logic likhege
const mongoose= require("mongoose");
const initData= require("./data.js");
const Listing= require("../models/listing.js");

main()
    .then(()=>{
        console.log("connected to db");
    })
    .catch((err) =>{
        console.log(err);
    });

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/tourism");
}

const initDB = async()=>{
    await Listing.deleteMany({});
    initData.data= initData.data.map((obj)=>({ ...obj, owner:'687b452ba0705612b1071708'}))
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}
initDB();