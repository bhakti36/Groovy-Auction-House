import mysql from 'mysql';

export const handler = async (event) => {
    const pool = mysql.createPool({
        host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "8NpElCb61lk8lqVRaYAu",
        database: "auction_house",
    });

    const itemNotFound = {
        status: 405,
        message: "Item not found",
    };

    const itemAlreadyRequested = {
        status: 406,
        message: "Unfreeze already requested for this item",
    };

    const itemNotFrozen = {
        status: 407,
        message: "Item is not frozen; unfreeze request is not applicable",
    };

    let response = {};

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

    // Check if the seller and item exist and validate freeze state
    const CheckItemAndSeller = async (sellerID, itemID) => {
        const query = "SELECT * FROM auction_house.Item WHERE ItemID = ? AND SellerID = ?";
        const results = await executeQuery(query, [itemID, sellerID]);

        if (results.length === 0) {
            throw itemNotFound;
        }

        if (results[0].UnfreezeRequested === 1) {
            throw itemAlreadyRequested;
        }

        if (results[0].IsFrozen === 0) {
            throw itemNotFrozen;
        }
    };

    // Update the item to request unfreeze
    const RequestUnfreeze = async (itemID) => {
        const query = "UPDATE auction_house.Item SET UnfreezeRequested = true WHERE ItemID = ?";
        await executeQuery(query, [itemID]);

        const itemDetailsQuery = "SELECT * FROM auction_house.Item WHERE ItemID = ?";
        const itemDetails = await executeQuery(itemDetailsQuery, [itemID]);

        response = {
            status: 200,
            success: {
                message: "Unfreeze request for item is pending review",
                data: {
                    itemID: itemDetails[0].ItemID,
                    requestDate: new Date().toISOString().split('T')[0], // Current date
                },
            },
        };
    };

    // Lambda handler
    const { sellerID, itemID } = event;

    try {
        await CheckItemAndSeller(sellerID, itemID);
        await RequestUnfreeze(itemID);
        return response;
    } catch (error) {
        console.error("Error:", error);
        return error;
    } finally {
        pool.end();
    }
};
