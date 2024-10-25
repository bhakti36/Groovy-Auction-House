import mysql from "mysql";

export const handler = async (event) => {
    const pool = mysql.createPool({
        host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "8NpElCb61lk8lqVRaYAu",
        database: "auction_house",
    });

    const accountNotFound = {
        status: 400,
        message: "username not found",
    };

    const dbError = {
        status: 402,
        message: "DB Error",
    };


    let response = {};

    let addFunds = (accountID, funds) => {
        return new Promise((resolve, reject) => {
            pool.query(
                "SELECT * FROM auction_house.BuyerAccount WHERE accountID=?",
                [accountID],
                (error, rows) => {
                    if (error) {
                        response = {
                            error: dbError,
                        };
                        reject(error);
                    }
                    if (rows && rows.length == 1) {
                        let initialFunds = parseInt(rows[0].TotalFunds);
                        let addedFunds = parseInt(funds);
                        let totalFunds = initialFunds + addedFunds;
                        pool.query(
                            "UPDATE auction_house.BuyerAccount SET TotalFunds=? WHERE accountID=?",
                            [totalFunds, accountID],
                            (error, rows) => {
                                if (error) {
                                    response = {
                                        error: dbError,
                                    };
                                    reject(error);
                                }
                                response = {
                                    success: {
                                        status: 200,
                                        message: "Funds added successfully",
                                        data: {
                                            accountID: accountID,
                                            funds: totalFunds,
                                        },
                                    },
                                };

                                resolve(rows);
                            }
                        );
                    } else {
                        response = {
                            error: accountNotFound,
                        };
                        reject("unable to locate accountID '" + accountID + "'");
                    }
                }
            );
        });
    };

    try {
        await addFunds(event.accountID, event.funds);
        return response;
    } catch (error) {
        console.log(error);
        return response;
    } finally {
        pool.end();
    }
};
