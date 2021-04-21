const { MongoClient } = require("mongodb");
const fs = require('fs');
const Papa = require('papaparse');

// Replace the uri string with your MongoDB deployment's connection string.

//const uri =
//  "mongodb://pairwise_node:bdc3bb50fe01b53693d26b9d0930f8a9@127.0.0.1:27017?retryWrites=true&w=majority";

const uri =
  "mongodb://localhost:27017/pairwise_comp";

const client = new MongoClient(uri, {useUnifiedTopology: true});

console.log('Hello! I\'m going to load a CSV file into the local mongo instance.');

// third argument is the csv file
let csv_file = process.argv[2];

// fourth argument is the name for the collection to create in the db
let collection_name = process.argv[3] ? process.argv[3] : 'movies';

console.log('Loading file ' + csv_file + ' into collection ' + collection_name);

async function store_records(records){
	try {
		await client.connect();

		const database = client.db('pairwise_comp');
		const collection = database.collection(collection_name);

		for (let i=0; i < records.length; i++){
            records[i].count = 0;
            records[i].short_id = i;
            records[i]["score" + i] = 0;
            collection.insertOne(records[i], function(err, res) {
                if (err) throw err;
                console.log("1 document inserted");
            });
		}

        // insert the total number
        await collection.insertOne({ total: records.length });

  	} finally {
    	// Ensures that the client will close when you finish/error
    	await client.close();
  	}
};

async function run() {
	
	const file = fs.createReadStream(csv_file);
	var count = 0; // cache the running count
	Papa.parse(file, {
        header: true,
		worker: true, // Don't bog down the main thread if its a big file
		complete: function(results, file) {
            console.log(results.data);
            store_records(results.data);
		}
	});

}
run().catch(console.dir);

