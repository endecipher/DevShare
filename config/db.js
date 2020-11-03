const mongoose = require('mongoose');
const config = require('config');

const db = config.get('mongouri');

const connectDB = async () => {
    //If any error, catch
    try {
        await mongoose.connect(db,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
                useFindAndModify: false
            }); //async await
        console.log('MongoDB Connected');
    }
    catch (err) {
        console.log(err.message);
        process.exit(1); //Exit Process if failed
    }
}

module.exports = connectDB;