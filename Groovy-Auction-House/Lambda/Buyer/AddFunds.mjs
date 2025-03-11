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

    const checkBuyerAccount = async (accountID) => {
        const query = "SELECT * FROM BuyerAccount WHERE AccountID=?";
        const rows = await executeQuery(query, [accountID]);
        if (rows.length === 1) {
            return rows[0];
        }else{
            throw accountNotFound;
        }
        
    };

    const updateAccountFunds = async (accountID, addedFunds) => {
        const query = "UPDATE auction_house.BuyerAccount SET TotalFunds=TotalFunds + ?, AvailableFunds=AvailableFunds + ? WHERE accountID=?";
        const results = await executeQuery(query, [addedFunds, addedFunds, accountID]);
        return results;
    };

    const addFunds = async (accountID, funds) => {
        try {
            let buyerAccountDetails = await checkBuyerAccount(accountID);
            const addedFunds = parseInt(funds);
            await updateAccountFunds(accountID, addedFunds);
            return {
                status: 200,
                success: {
                    message: "Funds added successfully",
                    data: {
                        accountID: accountID,
                        totalFunds: buyerAccountDetails.TotalFunds + addedFunds,
                        availableFunds: buyerAccountDetails.AvailableFunds + addedFunds
                    }
                }
            };
        } catch (error) {
            if (error === accountNotFound) {
                return { error: accountNotFound };
            }
            return { error: dbError };
        }
    };

    let response = {};

    try {
        response = await addFunds(event.accountID, event.funds);
    } catch (error) {
        console.log(error);
        response = { error: dbError };
    } finally {
        pool.end();
    }

    return response;
};
