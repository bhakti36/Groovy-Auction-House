import mysql from 'mysql';

export const handler = async (event) => {
    const pool = mysql.createPool({
        host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "8NpElCb61lk8lqVRaYAu",
        database: "auction_house"
    });

    const successResponse = {
        status: 200,
        message: "Items retrieved successfully"
    };

    const errorResponse = {
        status: 400,
        message: "Failed to search items"
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

    const getItems = async () => {
        const itemsQuery = "SELECT * FROM auction_house.Item WHERE IsComplete=false AND IsPublished=true AND IsFrozen=false AND IsArchived=false";
        return await executeQuery(itemsQuery);
    };

    const getBidsForItems = async (itemIDs) => {
        const bidsQuery = "SELECT * FROM auction_house.Bid WHERE ItemID IN (?)";
        return await executeQuery(bidsQuery, [itemIDs]);
    };


    try {
        const items = await getItems();
        const itemIDs = items.map(item => item.ItemID);
        const bids = await getBidsForItems(itemIDs);

        const itemsWithBids = items.map(item => {
            const itemBids = bids.filter(bid => bid.ItemID === item.ItemID);
            return {
                ItemID: item.ItemID,
                Name: item.Name,
                Description: item.Description,
                Images: item.Images,
                InitialPrice: item.InitialPrice,
                StartDate: item.StartDate,
                DurationDays: item.DurationDays,
                DurationHours: item.DurationHours,
                DurationMinutes: item.DurationMinutes,
                IsPublished: item.IsPublished,
                IsFrozen: item.IsFrozen,
                IsArchived: item.IsArchived,
                IsComplete: item.IsComplete,
                IsFailed: item.IsFailed,
                biddingHistory: itemBids.map(bid => ({
                    BidID: bid.BidID,
                    BuyerID: bid.BuyerID,
                    ItemID: bid.ItemID,
                    BidAmount: bid.BidAmount
                }))
            };
        });

        return {
            ...successResponse,
            items: itemsWithBids,
        };
    } catch (error) {
        console.error("Error in handler:", error);
        return errorResponse; 
    } finally {
        pool.end(); 
    }
};
