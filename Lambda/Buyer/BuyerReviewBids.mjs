import mysql from 'mysql';

export const handler = async (event) => {
    const pool = mysql.createPool({
        host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "8NpElCb61lk8lqVRaYAu",
        database: "auction_house"
    });

    const successResponse = {
        code: 200,
        message: "Item details retrieved successfully"
    };

    const errorResponse = {
        code: 400,
        message: "Failed to retrieve item details"
    };
    const dbError = {
        status: 402,
        message: "DB Error"
    };
    const itemNotFound = {
        status: 404,
        message: "Item not found"
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
    const reviewActiveBids = async (buyerID) => {
        
        const itemQuery = `
            SELECT 
                i.*,
                COALESCE(MAX(b.BidAmount), NULL) AS MaxBidAmount
            FROM 
                auction_house.Item i
            JOIN 
                auction_house.Bid b ON i.ItemID = b.ItemID
            WHERE 
                b.BuyerID = ? 
                AND i.IsPublished = TRUE
            GROUP BY 
                i.ItemID;
        `;
        const items = await executeQuery(itemQuery, [buyerID]);

        if (items.length === 0) {
            throw itemNotFound;
        }
        const bidsQuery = `
            SELECT 
                b.*
            FROM 
                auction_house.Bid b
            JOIN 
                auction_house.Item i ON b.ItemID = i.ItemID
            WHERE 
                b.BuyerID = ?
                AND i.IsPublished = TRUE;
        `;
        const bids = await executeQuery(bidsQuery, [buyerID]);

        // Group bid history by ItemID
        const bidHistoryMap = {};
        bids.forEach(bid => {
            if (!bidHistoryMap[bid.ItemID]) {
                bidHistoryMap[bid.ItemID] = [];
            }
            bidHistoryMap[bid.ItemID].push({
                BidID: bid.BidID,
                BuyerID: bid.BuyerID,
                BidAmount: bid.BidAmount,
                BidTimeStamp: bid.BidTimeStamp
            });
        });

        
        return items.map(item => ({
            ...item,
            BidHistory: bidHistoryMap[item.ItemID] || []
        }));
    };

    try {
        const { buyerID } = event;
        const reviewBidsList = await reviewActiveBids(buyerID);
        response = {
            status: 200,
            message: "Retrieved bids successfully.",
            reviewBidsList
        };
        return response;

    } catch (error) {
        console.error("Error:", error);
        return {
            status: error.status || 500,
            message: error.message || "An unknown error occurred."
        };
    }
    finally {
        pool.end((err) => {
            if (err) {
                console.error('Error closing the pool', err);
            } else {
                console.log('Pool was closed.');
            }
        });
    }
};
