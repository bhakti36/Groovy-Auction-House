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

    const notBuyerAccount = {
        status: 403,
        message: "Account is not a Buyer"
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

    const getAccountDetails = async (accountID) => {
        const accountsQuery = "SELECT * FROM auction_house.BuyerAccount WHERE AccountID=?";
        const accounts = await executeQuery(accountsQuery, [accountID]);

        if (accounts.length === 1) {
            return accounts[0];
        } else {
            throw accountNotFound;
        }
    }

    const getBuyerAccountDetails = async (accountID) => {
        const accountsQuery = "SELECT * FROM auction_house.BuyerAccount WHERE AccountID=?";
        const buyerAccount = await executeQuery(accountsQuery, [accountID]);

        if (buyerAccount.length === 1) {
            return buyerAccount[0];
        } else {
            throw accountNotFound;
        }
    };
    
    const getItemDetails = async (itemID) => {
        const itemQuery = "SELECT * FROM auction_house.Item WHERE ItemID=?";
        const item = await executeQuery(itemQuery, [itemID]);

        if (item.length === 1) {
            return item[0];
        } else {
            throw accountNotFound;
        }
    };

    const getBidsOnItem = async (itemID) => {
        const bidsQuery = "SELECT * FROM auction_house.Bid WHERE ItemID=?";
        const bids = await executeQuery(bidsQuery, [itemID]);

        if (bids.length > 0) {
            return bids;
        } else {
            return [];
        }
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

        const accountDetails = await getAccountDetails(accountID);

        if (accountDetails.accountType !== 'Buyer') {
            throw notBuyerAccount
        }

        const buyerAccountDetails = await getBuyerAccountDetails(accountID);
        const itemDetails = await getItemDetails(itemID);
        const bidsOnItem = await getBidsOnItem(itemID);

        if (itemDetails.IsPublished == 0) {
            throw itemNotFound
        }


        await PlaceBid(accountID, itemID, bidAmount)
        return response
    } catch (error) {
        return response
    } finally {
        pool.end()
    }

};