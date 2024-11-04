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
        pool.query(
            "SELECT * FROM auction_house.Accounts WHERE Username = ? AND Password = ?",
            [username, password],
            (error, rows) => {
                if (error) return reject ( {"response":(responses.dbError), "error": error});

                if (rows && rows.length === 1) {
                    const account = rows[0];

                  
                    if (account.accountType === 'Admin') {
                        pool.query(`
                            SELECT Accounts.AccountID, Accounts.Username, SellerAccount.Funds, Item.*
                            FROM auction_house.Accounts
                            JOIN auction_house.SellerAccount ON Accounts.AccountID = SellerAccount.AccountID
                            LEFT JOIN auction_house.Item ON SellerAccount.AccountID = Item.SellerID
                        `, (error, sellerItems) => {
                            if (error) return reject(responses.dbError);

                            resolve({
                                ...responses.success,
                                admin: true,
                                sellers: sellerItems // All sellers and their published items with statuses
                            });
                        });
                    } else {
                        reject(responses.usernameNotFound);
                    }
                } else {
                    reject(responses.usernameNotFound);
                }
            }
        );
    });
};
export const handler = async (event) => {
    let response = {};
    try {
        const { username, password } = event;
        const userDetails = await CheckPassword(username, password);
        response = userDetails;
    } catch (error) {
        response = error;
    } finally {
        pool.end();
    }
    return response;
};


