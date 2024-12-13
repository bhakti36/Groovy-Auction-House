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
    successFreeze: { status: 200, message: "Item frozen successfully" },
    successUnfreeze: { status: 200, message: "Item unfrozen successfully" },
    operationError: { status: 400, message: "Failed to freeze/unfreeze item" },
    itemNotFound: { status: 404, message: "Item not found" },
    unauthorized: { status: 401, message: "Unauthorized access" },
    allItemsFetched: { status: 200, message: "All items fetched successfully" }
};

// Function to verify admin credentials
const verifyAdmin = (username, password) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "SELECT * FROM auction_house.Accounts WHERE Username = ? AND Password = ? AND accountType = 'Admin'",
            [username, password],
            (error, results) => {
                if (error) return reject({ response: responses.dbError, error });
                if (results && results.length === 1) {
                    resolve(true);
                } else {
                    reject(responses.unauthorized);
                }
            }
        );
    });
};

// Function to fetch all items
const fetchAllItems = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM auction_house.Item", (error, results) => {
            if (error) {
                return reject({ response: responses.dbError, error });
            }
            resolve({
                ...responses.allItemsFetched,
                items: results.map(item => ({
                    ItemID: item.ItemID,
                    Name: item.Name,
                    IsFrozen: item.IsFrozen,
                    UnFreezeRequested: item.UnFreezeRequested
                }))
            });
        });
    });
};

// Function to freeze or unfreeze an item
const updateItemStatus = (itemID, freeze) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "UPDATE auction_house.Item SET IsFrozen = ?, UnFreezeRequested = False WHERE ItemID = ?",
            [freeze, itemID],
            (error, results) => {
                if (error) {
                    return reject({ response: responses.operationError, error });
                }
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
    const { accountID, freeze, itemID } = event;
    let response = {};

    try {
        // Verify if the user is an admin
        await verifyAdmin(accountID);

        if (!itemID) {
            // If no itemID is provided, return all items
            response = await fetchAllItems();
        } else {
            // Freeze or unfreeze the item
            response = await updateItemStatus(itemID, freeze);
        }
    } catch (error) {
        response = error;
    }

    return response;
};
