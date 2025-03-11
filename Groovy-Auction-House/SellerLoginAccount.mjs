import mysql from 'mysql';

export const handler = async (event) => {

    const pool = mysql.createPool({
        host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "8NpElCb61lk8lqVRaYAu",
        database: "auction_house"
    });

    const usernameNotFound = { status: 400, message: "username not found" };
    const dbError = { status: 402, message: "DB Error" };
    const wrongPassword = { status: 401, message: "wrong password" };

    const CheckPassword = async (username, password) => {
        return new Promise((resolve, reject) => {
            pool.query(
                "SELECT * FROM auction_house.Accounts WHERE Username=? AND Password=?", 
                [username, password], 
                (error, rows) => {
                    if (error) {
                        console.error("Accounts query error:", error);
                        return reject(dbError);
                    } else if (rows && rows.length === 1) {
                        const accountID = rows[0].AccountID;
                        console.log("Account found, AccountID:", accountID);

                        pool.query(
                            "SELECT * FROM auction_house.SellerAccount WHERE AccountID=?", 
                            [accountID], 
                            async (error, accountDetails) => {
                                if (error) {
                                    console.error("SellerAccount query error:", error);
                                    return reject(dbError);
                                } else if (accountDetails && accountDetails.length === 1) {

                                    const itemsResponse = await new Promise((resolve, reject) => {
                                        pool.query("SELECT * FROM auction_house.Item WHERE SellerID=?", [accountID], (error, items) => {
                                            if (error) {
                                                console.error("Items query error:", error);
                                                return reject(dbError);
                                            } else {
                                                resolve(items);
                                            }
                                        });
                                    });

                                    const itemsWithBids = await Promise.all(itemsResponse.map(async (item) => {
                                        const bidsResponse = await new Promise((resolve, reject) => {
                                            pool.query("SELECT * FROM auction_house.Bid WHERE ItemID=?", [item.ItemID], (error, bids) => {
                                                if (error) {
                                                    console.error("Bids query error:", error);
                                                    return reject(dbError);
                                                } else {
                                                    resolve(bids);
                                                }
                                            });
                                        });
                                        return {
                                            ItemID: item.ItemID,
                                            Name: item.Name,
                                            Description: item.Description,
                                            Images: item.Images,
                                            InitialPrice: item.InitialPrice,
                                            StartDate: item.StartDate,
                                            Duration: item.Duration,
                                            IsPublished: item.IsPublished,
                                            IsFrozen: item.IsFrozen,
                                            IsArchived: item.IsArchived,
                                            IsComplete: item.IsComplete,
                                            IsFailed: item.IsFailed,
                                            biddingHistory: bidsResponse.map(bid => ({
                                                BidID: bid.BidID,
                                                BuyerID: bid.BuyerID,
                                                ItemID: bid.ItemID,
                                                BidAmount: bid.BidAmount
                                            }))
                                        };
                                    }));

                                    return resolve({
                                        success: {
                                            code: 200,
                                            message: "logged in successfully!",
                                            accountID: accountID,
                                            isFrozen: accountDetails[0].isFrozen,
                                            isClosed: accountDetails[0].isClosed,
                                            items: itemsWithBids,
                                            funds: accountDetails[0].funds
                                        }
                                    });
                                } else {
                                    return reject(usernameNotFound);
                                }
                            }
                        );
                    } else {
                        return reject(usernameNotFound);
                    }
                }
            );
        });
    };

    try {
        const username = event.username || "";
        const password = event.password || "";

        if (!username || !password) {
            return { status: 400, message: "Username and password required." };
        }

        const response = await CheckPassword(username, password);
        return response;
    } catch (error) {
        console.error("Handler error:", error);
        return error;
    }
};
