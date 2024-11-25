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
        message: "Account not found"
    };

    const bidFailed = {
        status: 401,
        message: "Failed to bid on the Item"
    };

    const dbError = {
        status: 402,
        message: "DB Error"
    };

    const insufficientFunds = {
        status: 403,
        message: "Insufficient funds"
    };

    const notBuyerAccount = {
        status: 403,
        message: "Account is not a Buyer"
    };

    const itemNotFound = {
        status: 404,
        message: "Item not found"
    };

    const itemFrozen = {
        status: 405,
        message: "Item is frozen"
    };

    const itemComplete = {
        status: 406,
        message: "Item is complete"
    };

    const itemArchived = {
        status: 407,
        message: "Item is archived"
    };

    
    let response = {}

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

    const getActiveBids = async (accountID) => {
       
    };

    try {
        const { accountID, itemID, bidAmount } = event;

        const accountDetails = await getActiveBids(accountID);
        

        return response;
    } catch (error) {
        console.error(error);
        return error;
    } finally {
        pool.end((err) => {
            if (err) {
                console.error('Error closing the pool', err);
            } else {
                console.log('Pool was closed.');
            }
        });
    }
};
