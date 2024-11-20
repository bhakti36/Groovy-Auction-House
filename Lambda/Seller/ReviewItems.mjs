import mysql from 'mysql';

export const handler = async (event) => {
    const pool = mysql.createPool({
        host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "8NpElCb61lk8lqVRaYAu",
        database: "auction_house"
    });

    const dbError = {
        status: 402,
        message: "DB Error"
    };

    const noItemsFound = (sellerID) => ({
        status: 404,
        message: `No items found for seller id ${sellerID}`
    });

    const success = {
        status: 200,
        message: "Items retrieved successfully"
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

    const getItemsAndBidsBySellerID = async (sellerID) => {
        const query = `
            SELECT 
                i.ItemID, i.Name, i.Description, i.Images, i.InitialPrice, i.StartDate, i.DurationDays, i.DurationHours, i.DurationMinutes, i.IsComplete, i.IsFrozen, i.IsPublished,
                b.BidID, b.BuyerID, b.BidAmount, b.BidTimeStamp
            FROM 
                auction_house.Item i
            LEFT JOIN 
                auction_house.Bid b ON i.ItemID = b.ItemID
            WHERE 
                i.SellerID = ?;
        `;
        const results = await executeQuery(query, [sellerID]);
        
        if (results.length === 0) {
            throw noItemsFound(sellerID);
        }

        // Group bids under their respective items
        const items = {};
        results.forEach(row => {
            if (!items[row.ItemID]) {
                items[row.ItemID] = {
                    ItemID: row.ItemID,
                    Name: row.Name,
                    Description: row.Description,
                    Images: row.Images,
                    InitialPrice: row.InitialPrice,
                    StartDate: row.StartDate,
                    DurationDays: row.DurationDays,
                    DurationHours: row.DurationHours,
                    DurationMinutes: row.DurationMinutes,
                    IsComplete: row.IsComplete,
                    IsFrozen: row.IsFrozen,
                    IsPublished: row.IsPublished,
                    bids: []
                };
            }

            if (row.BidID) {  // Check if there is a bid
                items[row.ItemID].bids.push({
                    BidID: row.BidID,
                    BuyerID: row.BuyerID,
                    BidAmount: row.BidAmount,
                    BidTimeStamp: row.BidTimeStamp
                });
            }
        });

        return Object.values(items); // Convert items object to an array
    };

    try {
        const items = await getItemsAndBidsBySellerID(event.sellerID);
        return { status: 200, items: items };
    } catch (error) {
        console.error("Handler error:", error);
        return { error: dbError };
    } finally {
        pool.end();
    }
};
