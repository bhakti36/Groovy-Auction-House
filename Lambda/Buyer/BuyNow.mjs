import mysql from 'mysql';

export const handler = async (event) => {
    const pool = mysql.createPool({
        host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "8NpElCb61lk8lqVRaYAu",
        database: "auction_house"
    });

    const accountNotFound = {
        status: 400,
        message: "username not found"
    };

    const dbError = {
        status: 402,
        message: "DB Error"
    };

    const executeQuery = (query, params) => {
        return new Promise((resolve, reject) => {
            pool.query(query, params, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    };


    const buyNow = async (accountID, itemID) => {
        const query = "INSERT INTO auction_house.Bid (AccountID, ItemID) VALUES (?, ?)";
        await executeQuery(query, [accountID, itemID]);
        
    };

    let response = {};

    try {
        let 
    } catch (error) {
        console.log(error);
        response = { error: dbError };
    } finally {
        pool.end();
    }

    return response;
};
