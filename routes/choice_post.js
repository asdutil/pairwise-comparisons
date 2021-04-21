const { MongoClient } = require("mongodb");

async function save_choice(collection_name, winning_id, losing_id){

    const uri =
        "mongodb://localhost:27017/pairwise_comp";

    const client = new MongoClient(uri, {useUnifiedTopology: true});

	try {
		await client.connect();

		const database = client.db('pairwise_comp');
		const collection = database.collection(collection_name);

        let winner = await collection.findOne({ "short_id": parseInt(winning_id) });
        let loser = await collection.findOne({ "short_id": parseInt(losing_id) });

        let w_short_id = parseInt(winner.short_id);
        let l_short_id = parseInt(loser.short_id);

        let winning_values = {
            count: winner.count + 1
        };

        winning_values["score" + l_short_id] = 1

        let result = await collection.updateOne(
            {
                short_id: w_short_id
            }, {
                $set: winning_values
            }
        );

        let losing_values = {
            count: loser.count + 1
        };

        losing_values["score" + w_short_id] = -1

        result = await collection.updateOne(
            {
                short_id: l_short_id
            }, {
                $set: losing_values
            }
        );
        
  	} finally {
    	// Ensures that the client will close when you finish/error
    	await client.close();
  	}
};

module.exports = {
    post : function(req, res){
        
        // grab the collection name
        let collection = req.query && req.query.prj;

        if (collection){
            save_choice(collection, req.query.winner, req.query.loser).then(() => {
                res.send(true);
            });
        } else {
            res.send(false);
        }
    }
}
