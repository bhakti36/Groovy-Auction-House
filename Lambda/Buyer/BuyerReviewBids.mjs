import mysql from 'mysql';

let pool;

const initPool = () => {
    if (!pool) {
        pool = mysql.createPool({
            host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
            user: "admin",
            password: "8NpElCb61lk8lqVRaYAu",
            database: "auction_house",
            connectionLimit: 10
        });
    }
};

export const handler = async (event) => {
    initPool();

    const dbError = {
        status: 500,
        message: "Database Error"
    };

    const itemNotFound = {
        status: 404,
        message: "No active bids found for this buyer."
    };

    const executeQuery = (query, params) => {
        return new Promise((resolve, reject) => {
            pool.query(query, params, (error, results) => {
                if (error) {
                    console.error("Query execution error:", error);
                    reject(dbError);
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
            LEFT JOIN 
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

        // Merge items with their respective bid histories
        return items.map(item => ({
            ...item,
            BidHistory: bidHistoryMap[item.ItemID] || []
        }));
    };

    try {
        const { buyerID } = event;

        if (!buyerID) {
            throw {
                status: 400,
                message: "Buyer ID is required."
            };
        }

        const reviewBidsList = await reviewActiveBids(buyerID);

        return {
            status: 200,
            message: "Retrieved bids successfully.",
            reviewBidsList
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            status: error.status || 500,
            message: error.message || "An unknown error occurred."
        };
    }
};
