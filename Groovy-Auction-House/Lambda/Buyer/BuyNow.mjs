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

    const notBuyNow = {
        status: 401,
        message: "Item is not Buy Now"
    };

    const dbError = {
        status: 402,
        message: "DB Error"
    };

    const insufficientFunds = {
        status: 403,
        message: "Insufficient funds"
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


    const buyNow = async (accountID, itemID, bidAmount) => {
        const query = "INSERT INTO auction_house.Bid (AccountID, ItemID, BidAmount) VALUES (?, ?, ?)";
        await executeQuery(query, [accountID, itemID, bidAmount]);

        const query2 = "UPDATE auction_house.Item SET DurationDays=0, DurationHours=0, DurationMinutes=0 WHERE ItemID=?";
        await executeQuery(query2, [itemID]);

        const query3 = "UPDATE auction_house.BuyerAccount SET AvailableFunds=AvailableFunds-? WHERE AccountID=?";
        await executeQuery(query3, [bidAmount, accountID]);
        
        return { status: 200, message: "Buy Request Successfully Placed On Item" };

    };

    const getItemDetails = async (itemID) => {
        const query = "SELECT * FROM auction_house.Item WHERE ItemID=?";
        const results = await executeQuery(query, [itemID]);
        return results[0];
    }

    const getAccountDetails = async (accountID) => {
        const query = "SELECT * FROM auction_house.BuyerAccount WHERE AccountID=?";
        const results = await executeQuery(query, [accountID]);
        return results[0];
    }

    let response = {};

    try {
        const item = await getItemDetails(event.itemID);
        if(item.IsBuyNow === 0){
            throw notBuyNow;
        }
        const account = await getAccountDetails(event.accountID);
        if (account.AvailableFunds < item.InitialPrice){
            throw insufficientFunds;
        }
        response = await buyNow(event.accountID, event.itemID);
    } catch (error) {
        console.log(error);
        response = { error: error };
    } finally {
        pool.end();
    }

    return response;
};
