import mysql from 'mysql';

export const handler = async (event) => {
    const pool = mysql.createPool({
        host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "8NpElCb61lk8lqVRaYAu",
        database: "auction_house"
    });

    const successResponse = {
        code: 200,
        message: "Buyer account closed successfully"
    };

    const accountClosureError = {
        code: 400,
        message: "Buyer account cannot be closed"
    };

    let response = {};

    const closeBuyerAccount = (buyerID) => {
        return new Promise((resolve, reject) => {
            // Update BuyerAccount to mark it as frozen or closed
            pool.query("UPDATE BuyerAccount SET IsFrozen = ?, IsClosed = ? WHERE AccountID = ?", [true, true, buyerID], (error, result) => {
                if (error) {
                    response = { error: accountClosureError };
                    return reject(error);
                }

                if (result.affectedRows === 0) {
                    response = { error: accountClosureError };
                    return reject("No account found with this ID");
                }

                response = { success: successResponse };
                resolve();
            });
        });
    };

    try {
        const { buyerID } = event.request;
        await closeBuyerAccount(buyerID);
        return response;
    } catch (error) {
        return response;
    } finally {
        pool.end(); // Optionally close the pool here; can also be handled at application exit
    }
};
