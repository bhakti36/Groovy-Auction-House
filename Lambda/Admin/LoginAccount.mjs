import mysql from 'mysql';

export const handler = async (event) => {
    const pool = mysql.createPool({
        host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "8NpElCb61lk8lqVRaYAu",
        database: "auction_house"
    });

    const responses = {
        usernameNotFound: { status: 400, message: "username not found" },
        dbError: { status: 402, message: "DB Error" },
        success: { status: 200, message: "Logged in successfully" },
        notAdmin: { status: 401, message: "Not an admin account" }
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

    const checkPassword = async (username, password) => {
        const accountQuery = "SELECT * FROM auction_house.Accounts WHERE Username = ? AND Password = ?";
        const accounts = await executeQuery(accountQuery, [username, password]);

        if (!accounts || accounts.length !== 1) {
            throw responses.usernameNotFound;
        }
        
        if (accounts[0].AccountID === null) {
            throw responses.dbError;
        }

        if (accounts[0].AccountType !== "Admin") {
            throw responses.notAdmin;
        }

        return {
            ...responses.success,
            accountId: accounts[0].AccountID
        };
    };

    let response = {};

    try {
        const { username, password } = event;
        response = await checkPassword(username, password);
    } catch (error) {
        response = error;
    } finally {
        pool.end();
    }

    return response;
};
