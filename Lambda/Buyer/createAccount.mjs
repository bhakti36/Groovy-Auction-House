import mysql from 'mysql';

export const handler = async (event) => {
    const pool = mysql.createPool({
        host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "8NpElCb61lk8lqVRaYAu",
        database: "auction_house"
    });

    let response = {}

    const dbError = {
        status: 402,
        message: "DB Error"
    }

    const createAccount = (username, password) => {
        return new Promise((resolve, reject) => {
            // check if the username already exists
            // pool.query("SELECT * FROM Accounts WHERE Username=?", [username], (error, rows) => {
            //     if (error) {
            //         return reject("Database error: " + error);
            //     }

            //     if (rows.length > 0) {
            //         //name already exists
            //         response.error[1].message = "Username exists";
            //         return reject(response.error[1]);
            //     }

                // create account
                pool.query("INSERT INTO Accounts (Username, Password, AccountType) VALUES (?, ?, ?)", [username, password, "Buyer"], (insertError, result) => {
                    if (insertError) {
                        response = {
                            error: dbError
                        };
                        reject(insertError);
                    }

                    // success created account ,set buyerID
                    // response.success.buyerID = result.insertId; // ID of the created account
                    // return resolve(response.success);
                    let accountID = result.insertId;
                    console.log(accountID)
                    pool.query("INSERT INTO BuyerAccount (AccountID, AvailableFunds, TotalFunds) VALUES (?, ?, ?)", [accountID, 0, 0], (insertBuyerError, result) => {
                        if (insertBuyerError) {
                            response = {
                                error: dbError
                            };
                            reject(insertBuyerError);
                        }
                        if(result){
                            response = {
                                status:200,
                                success: {
                                    status: 200,
                                    message: "Buyer Account Created SuccessFully",
                                    buyerID: accountID
                                }
                            }
                            resolve(result)
                        }
                        // console.log(result)
                    })
                });
            });
        // });
    };

    try {
        const username = event.username;
        const password = event.password;

        // Create account
        await createAccount(username, password);
        return response;
    } catch (error) {
        return response;
    } finally {
        pool.end();
    }
};
