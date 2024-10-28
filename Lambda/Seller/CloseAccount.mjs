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

    let response = {}

    //close function
    let CloseAccount = (username, password) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE SellerAccount SET IsClosed = TRUE WHERE AccountID = ?`, 
            [sellerID],
            (error, result) => {
                if (error) {
                    response = {
                        error: "Database Error"
                    };
                    reject(response);
                } else {
                    if (result.affectedRows == 1) {
                        response = {
                            success: "Account closed successfully"
                        };
                        resolve(response); 
                    } else {
                        response = {
                            error: "Account not found or already closed"
                        };
                        reject(response);
                    }
                }
            }
            );
        });
    };

    try {
        await CloseAccount(event.username, event.password)
        console.log("CloseAccount in lambda");
        return response;
    } catch (error) {
        console.log(error)
        return response;
    } finally {
        pool.end()
    }



};
