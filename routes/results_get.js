const { MongoClient } = require("mongodb");

async function get_results(collection_name){

    const uri =
        "mongodb://localhost:27017/pairwise_comp";

    const client = new MongoClient(uri, {useUnifiedTopology: true});

	try {
		await client.connect();

		const database = client.db('pairwise_comp');
		const collection = database.collection(collection_name);

        let total = await collection.findOne({ total: { $gt: 0 } });

        let $add = [];

        for (let i = 0; i < total.total; i++){
            $add.push("$score" + i);
        }

        let results = await collection.aggregate(
            [
                {
                    $match: {
                        total: null
                    }
                },
                {
                    $project: {
                        year: 1,
                        title: 1,
                        _id: 0,
                        score: {
                            $add: $add
                        }
                    }
                },
                {
                    $sort : {
                        score : -1
                    } 
                }
            ]
        ).toArray();

        return results;

  	} finally {
    	// Ensures that the client will close when you finish/error
    	await client.close();
  	}
};

module.exports = {
    get : function(req, res){
        // find the results to respond with
    
        // grab the collection name
        let collection = req.query && req.query.prj;

        if (collection){
            get_results(collection).then((data) => {
                res.send(data);
            });
        } else {
            res.send();
        }
    }
}
