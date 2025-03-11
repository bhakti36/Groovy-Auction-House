import mysql from 'mysql'

export const handler = async (event) =>  {

  const pool = mysql.createPool({
    host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "8NpElCb61lk8lqVRaYAu",
    database: "auction_house"
    });

    const usernameNotFound = {
        status: 400,
        message: "username not found"
    };

    const dbError = {
        status: 402,
        message: "DB Error"
    }

    const wrongPassword = {
        status: 401,
        message: "wrong password"
    };

    let response = {}

    let CheckPassword = (username, password) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM auction_house.Accounts WHERE Username=? AND Password=?", [username, password], (error, rows) => {
                if (error) { 
                    response = {
                        error: dbError
                    }
                    reject(error) 
                }
                if ((rows) && (rows.length == 1)) {
                    console.log(rows[0]);
                    pool.query("SELECT * FROM auction_house.item WHERE SellerID=?", [rows[0].AccountID], (items) => {
                        if (items) {
                            console.log(items);
                        }
                    });
                    pool.query("SELECT * FROM auction_house.selleraccount WHERE SellerID=?", [rows[0].AccountID], (items) => {
                        if (items) {
                            console.log(statu[0]);
                        }
                    });
                    response = {
                        success: {
                            code: 200,
                            message: "loggin successfully!",
                            accountID: rows[0].AccountID,
                            isFrozen: statu[0].isFrozen,
                            isClosed: statu[0].isClosed,
                            items: [],
                            funds: statu[0].funds
                        }
                    }
                    for (let i = 0; i < items.length; i++) {
                        response.success.items.push({
                            ItemID: items[i].ItemID,
                            Name: items[i].Name,
                            Description: items[i].Description,
                            Images: items[i].Images,
                            InitialPrice: items[i].InitialPrice,
                            StartDate: items[i].StartDate,
                            Duration: items[i].Duration,
                            IsPublished: items[i].IsPublished,
                            IsFrozen: items[i].IsFrozen,
                            IsArchived: items[i].IsArchived,
                            IsComplete: items[i].IsComplete,
                            IsFailed: items[i].IsFailed,
                            biddingHistory: []
                        });
                        pool.query("SELECT * FROM auction_house.bid WHERE ItemID=?", [items[i].ItemID], (bids) => {
                            if (items) {
                                console.log(bids);
                            }
                        });
                        for (let j = 0; j < bids.length; j++) {
                            response.success.items.biddingHistory.push({
                                BidID: bids[j].BidID,
                                BuyerID: bids[j].BuyerID,
                                ItemID: bids[j].ItemID,
                                BidAmount: bids[j].BidAmount
                            });
                        }
                    }
                    
                    resolve(rows[0].value)
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
        let username = event.username
        let password = event.password
        await CheckPassword(username, password)
        return response
    } catch (error) {
        return response
    } finally {
        pool.end()
    }

};