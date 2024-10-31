import mysql from 'mysql';

const pool = mysql.createPool({
    host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "8NpElCb61lk8lqVRaYAu",
    database: "auction_house"
});

const responses = {
    usernameNotFound: { status: 400, message: "username not found" },
    dbError: { status: 402, message: "DB Error" },
    wrongPassword: { status: 401, message: "wrong password" },
    success: { status: 200, message: "Logged in successfully" }
};

const CheckPassword = (username, password) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM auction_house.Accounts WHERE Username=? AND Password=?", [username, password], (error, rows) => {
            if (error) return reject(responses.dbError);
            if (rows && rows.length === 1) {
                pool.query("SELECT * FROM auction_house.BuyerAccount WHERE AccountID=?", [rows[0].AccountID], (error, accountDetails) => {
                    if (error) return reject(responses.dbError);
                    if (accountDetails && accountDetails.length === 1) {
                        resolve({
                            accountID: rows[0].AccountID,
                            isFrozen: accountDetails[0].isFrozen,
                            isClosed: accountDetails[0].isClosed,
                            funds: accountDetails[0].funds
                        });
                    } else {
                        reject(responses.usernameNotFound);
                    }
                });
            } else {
                reject(responses.usernameNotFound);
            }
        });
    });
};

const fetchItems = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM auction_house.Item", (error, items) => {
            if (error) return reject(responses.dbError);
            resolve(items);
        });
    });
};

export const handler = async (event) => {
    let response = {};
    try {
        const { username, password } = event;
        const userDetails = await CheckPassword(username, password);
        const items = await fetchItems();
        response = { ...responses.success, ...userDetails, items };
    } catch (error) {
        response = error;
    } finally {
        pool.end();
    }
    return response;
};