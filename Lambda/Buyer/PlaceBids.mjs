import mysql from 'mysql'

export const handler = async (event) =>  {

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
    }

    const insufficientFunds = {
        status: 403,
        message: "Insufficient funds"
    }; 
    


    let response = {}
    let availableFunds = 0
    let totalFunds = 0

    let PlaceBid = (accountID, itemID, bidAmount) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM auction_house.BuyerAccount WHERE AccountID=?", [accountID], (error, rows) => {
                if (error) { 
                    response = {
                        error: dbError
                    }
                    reject(error) 
                }
                if ((rows) && (rows.length == 1)) {
                    console.log(rows[0])
                    availableFunds = rows[0].AvailableFunds;
                    totalFunds = rows[0].TotalFunds;

                    if(availableFunds < bidAmount){
                        response = {
                            error: insufficientFunds
                        }
                        reject("Insufficient funds to place bid on the Item");
                    }
                    pool.query("UPDATE auction_house.BuyerAccount SET AvailableFunds=? WHERE AccountID=?", [availableFunds - bidAmount, accountID], (error, updatedFunds) => {
                        if (error) {
                            response = {
                                error: dbError
                            }
                            reject(error)
                        }
                        pool.query("SELECT * FROM auction_house.Item WHERE ItemID=?", [itemID], (error, itemRow) => {
                            if (error) {
                                response = {
                                    error: dbError
                                }
                                reject(error)
                            }
                            if((itemRow) && (itemRow.length == 1)){
                                pool.query("INSERT INTO auction_house.Bid (BuyerID, ItemID, BidAmount) VALUES (?, ?, ?)", [accountID, itemID, bidAmount], (error, insertedBid) => {
                                    if (error) {
                                        response = {
                                            error: dbError
                                        }
                                        reject(error)
                                    }
                                    if(insertedBid.affectedRows == 1){
                                        response = {
                                            success: {
                                                status: 200,
                                                message: "Bid placed successfully",
                                                bidID: insertedBid.insertId,
                                                availableFunds: availableFunds - bidAmount
                                            }
                                        }
                                        resolve(insertedBid.insertId);
                                    }else{
                                        response = {
                                            error: bidFailed
                                        }
                                        reject("Failed to place bid on the Item");
                                    }
                                });
                            }else{
                                response = {
                                    error: bidFailed
                                }
                                reject("Failed to place bid on the Item");
                            }
                        });
                    });
                } else {
                    response = {
                        error: usernameNotFound
                    }
                    reject("unable to locate username '" + username + "'")
                }
            });
        });
    }

    try {
        let accountID = event.accountID
        let itemID = event.itemID
        let bidAmount = event.bidAmount
        await PlaceBid(accountID, itemID, bidAmount)
        return response
    } catch (error) {
        return response
    } finally {
        pool.end()
    }

};