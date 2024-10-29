import mysql from 'mysql';

export const handler = async (event) => {
    const pool = mysql.createPool({
        host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "8NpElCb61lk8lqVRaYAu",
        database: "auction_house"
    });

    const response = {
        success: {
            code: 200,
            message: "Buyer account created successfully",
            buyerID: null
        },
        error: [
            {

                code: 400,
                message: "Buyer Account cannot be created"
            },
            {
                
                code: 401,
                message: "Username exists"
            }
        ]
    };

    const createAccount = (username, password) => {
        return new Promise((resolve, reject) => {
            // check if the username already exists
            pool.query("SELECT * FROM Accounts WHERE Username=?", [username], (error, rows) => {
                if (error) {
                    return reject("Database error: " + error);
                }

                if (rows.length > 0) {
                    //name already exists
                    response.error[1].message = "Username exists";
                    return reject(response.error[1]);
                }

                // create account
                pool.query("INSERT INTO Accounts (Username, Password) VALUES (?, ?)", [username, password], (insertError, result) => {
                    if (insertError) {
                        response.error[0].message = "Buyer Account cannot be created";
                        return reject(response.error[0]);
                    }

                    // success created account ,set buyerID
                    response.success.buyerID = result.insertId; // ID of the created account
                    return resolve(response.success);
                });
            });
        });
    };

    try {
        const username = event.request.username;
        const password = event.request.password;

        // Create account
        const result = await createAccount(username, password);
        return { success: result };
    } catch (error) {
        return { error: error };
    } finally {
        pool.end();
    }
};
