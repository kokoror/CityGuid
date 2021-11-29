//this section generates 50 campsites from cities and 50 random descriptions and places from seedHelpers
//and save it in the mongoDB yelp-camp 
const mongoose = require('mongoose');
const Campground = require('../models/campground')

const cities = require('./cities')
const {discriptors, places, descriptors} = require('./seedHelpers') //******

mongoose.connect('mongodb://localhost:27017/yelp-camp', { 
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connnection error:"));
db.once("open",() => {
    console.log("Database connected");
})

// function to get random item from array. argument is an array, return a random element of this array
const sample = (array) => array[Math.floor(Math.random()*array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});   // make sure to clear out db first
    for (let i = 0; i<50; i++){
        const random1000 = Math.floor(Math.random() *1000);
        const price = Math.floor(Math.random() * 20)+10;
        const camp = new Campground({
            author: '61482c0302250447b888eae2',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            // randomly select 50 cities and save,use string literal !!!!
            title: `${sample(descriptors)}, ${sample(places)}`,
            //randomly select 50
            // image:'https://source.unsplash.com/collection/429524', (original)
            description:'this is descrption section. this part describes the campsite with general information.',
            price,
            geometry: {
                type:"Point",
                coordinates: [
                    cities[random1000].longitude, 
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dhqsmhiir/image/upload/v1634097695/YelpCamp/pnrff34jg8osoo3kiq4i.jpg',
                  filename: 'YelpCamp/pnrff34jg8osoo3kiq4i'
                },
                {
                  url: 'https://res.cloudinary.com/dhqsmhiir/image/upload/v1634097695/YelpCamp/pa9knwinomek1urvo9ji.jpg',
                  filename: 'YelpCamp/pa9knwinomek1urvo9ji'
                }
              ]
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close();     // close mongoose connection at the end after saving the 50 random campsites
});