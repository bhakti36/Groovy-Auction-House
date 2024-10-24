import mysql from 'mysql'

export const handler = async (event) => {

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

    const success = {
        status: 200,
        message: "Logged in successfully"
    };

    //let response = {}

    //create function
    let CreateAccount = (username, password) => {
        return new Promise((resolve, reject) => {
            pool.query(
                "INSERT INTO Accounts (Username, Password) VALUES (?, ?)",
                [username, password],
                (error, result) => {
                    if (error) {
                        let response = {
                            error: "Database Error"
                        };
                        reject(error);
                    } else {
                        if (result.affectedRows == 1) {
                            let response = {
                                success: "Account created successfully",
                                SellerID: result.insertId 
                            };
                            resolve(result.insertId); 
                        } else {
                            let response = {
                                error: "Seller Account creation failed"
                            };
                            reject("Unable to create account for username '" + username + "'");
                        }
                    }
                }
            );
        });
    };


};
