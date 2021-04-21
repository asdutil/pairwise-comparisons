const { MongoClient } = require("mongodb");

async function get_choice(collection_name){

    const uri =
        "mongodb://localhost:27017/pairwise_comp";

    const client = new MongoClient(uri, {useUnifiedTopology: true});

	try {
		await client.connect();

		const database = client.db('pairwise_comp');
		const collection = database.collection(collection_name);

        let total = await collection.findOne({ total: { $gt: 0 } });

        let choices = await collection.aggregate([
            { $match: { count: { $lt: total.total - 1 } } },
            { $sample: { size: 1 } }
        ]).toArray();

        if (choices.length <= 0){
            return "Done! No more pairs!";
        }

        let short_id = choices[0].short_id;

        let match = {
            count: {
                $lt: total.total - 1
            },
            short_id: {
                $ne: short_id
            }
        };

        match["score" + short_id] =  null;

        Array.prototype.push.apply(choices, await collection.aggregate([
            { $match: match },
            { $sample: { size: 1 } }
        ]).toArray());

        choices.push(total);

        return choices;

  	} finally {
    	// Ensures that the client will close when you finish/error
    	await client.close();
  	}
};

module.exports = {
    get : function(req, res){
        // find a pair of choices to respond with

        // grab the collection name
        let collection = req.query && req.query.prj;

        if (collection){
    
            get_choice(collection).then((data) => {
                res.send(data);
            });
        } else {
            res.send();
        }
    }
}
