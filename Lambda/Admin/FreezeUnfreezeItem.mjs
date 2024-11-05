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
    success: { status: 200, message: "Logged in successfully" },
    operationError: { status: 400, message: "Failed to freeze/unfreeze item" }
};

// Function to verify admin credentials
const verifyAdmin = (username, password) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "SELECT * FROM auction_house.Accounts WHERE Username = ? AND Password = ? AND accountType = 'Admin'",
            [username, password],
            (error, results) => {
                if (error) return reject(responses.dbError);
                if (results && results.length === 1) {
                    resolve(true);
                } else {
                    reject(responses.unauthorized);
                }
            }
        );
    });
};

// Function to freeze or unfreeze an item
const updateItemStatus = (itemID, freeze) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "UPDATE auction_house.Item SET status = ? WHERE ItemID = ?",
            [freeze ? 'frozen' : 'active', itemID],
            (error, results) => {
                if (error) return reject(responses.operationError);
                if (results.affectedRows === 1) {
                    resolve(freeze ? responses.successFreeze : responses.successUnfreeze);
                } else {
                    reject(responses.itemNotFound);
                }
            }
        );
    });
};

// Lambda handler
export const handler = async (event) => {
    const { admin_credential, freeze, itemID } = event;
    const { username, password } = admin_credential;
    let response = {};

    try {
        // Verify if the user is an admin
        await verifyAdmin(username, password);

        // Freeze or unfreeze the item
        response = await updateItemStatus(itemID, freeze === 'true');
    } catch (error) {
        response = error;
    } finally {
        pool.end(); // End the database connection
    }

    return {
        statusCode: response.status || 500,
        body: JSON.stringify({ message: response.message })
    };
};


