const mongoose = require('mongoose')
const connectDB = async ()=>{
    try{
        console.log(process.env.MONGO_URI);
        const connect = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDb connected : ${connect.connection.host}`);
    }catch(err){
        console.log(err);
        process.exit(1);
    }
}

module.exports = {
    connectDB,
}
