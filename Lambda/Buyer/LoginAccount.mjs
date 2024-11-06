import mysql from 'mysql'


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

const success = {
    status: 200,
    message: "Logged in successfully"
};

export const handler = async (event) =>  {

    let response = {}

    let CheckPassword = (username, password) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM auction_house.Accounts WHERE Username=? AND Password=?", [username, password], (error, rows) => {
                if (error) { 
                    response = {
                        error: dbError,
                        message: "Account Table Problem"
                    }
                    reject(error) 
                }
                if ((rows) && (rows.length == 1)) {
                    pool.query("SELECT * FROM auction_house.BuyerAccount WHERE AccountID=?", [rows[0].AccountID], (error, accountDetails) => {
                        if (error) {
                            response = {
                                error: dbError,
                                message: "Buyer Table Problem"
                            }
                            reject(error)
                        }
                        console.log("account", accountDetails)
                        if ((accountDetails) && (accountDetails.length == 1)) {
                            console.log(accountDetails)
                            response = {
                                success: success,
                                accountID: rows[0].AccountID,
                                isFrozen: accountDetails[0].isFrozen,
                                isClosed: accountDetails[0].isClosed,
                                funds: accountDetails[0].funds
                                // items: []
                            }


                            pool.query("SELECT * FROM auction_house.Item", (error, items) => {
                                if (error) {
                                    response = {
                                        error: dbError,
                                        message: "items_missing"
                                    }
                                    reject(error)
                                }
                                if (items) {
                                    response.items = items
                                    resolve("Done")
                                }
                            });
                        }else{
                            response = {
                                error: usernameNotFound,
                                message: "accountDetails:" + accountDetails
                            }
                            reject("unable to locate username")
                        }
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