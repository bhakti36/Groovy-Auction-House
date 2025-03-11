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

    const itemFrozen = {
        status: 405,
        message: "Item is frozen"
    };

    const itemComplete = {
        status: 406,
        message: "Item is complete"
    };

    const itemArchived = {
        status: 407,
        message: "Item is archived"
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

    // Function to fetch item details
    const getItemDetails = async (itemId) => { 
        const query = `
            SELECT ItemId, Name, Description, Images, InitialPrice, StartDate, DurationDays, DurationHours, DurationMinutes, IsPublished, IsFrozen, IsArchived, IsComplete, IsFailed
            FROM Item WHERE ItemID = ?
        `;
        const items = await executeQuery(query, [itemId]);
        if (items && items.length > 0) {
            return items[0]; 
        } else {
            throw itemNotFound;
        }
    };

    const getBidDetails = async (itemId, buyerId) => {
        const bidsQuery = `
        WITH RankedBids AS (
            SELECT
                b.BidID,
                CASE
                    WHEN b.BuyerID = ? THEN b.BuyerID
                    ELSE -1
                END AS BuyerID,
                b.ItemID,
                b.BidAmount,
                b.BidTimeStamp,
                ROW_NUMBER() OVER (
                    PARTITION BY b.BuyerID 
                    ORDER BY b.BidAmount DESC, b.BidTimeStamp DESC
                ) AS RowNum
            FROM Bid b
            WHERE b.ItemID = ?
        )
        SELECT
            BidID,
            BuyerID,
            BidAmount,
            BidTimeStamp
        FROM RankedBids
        WHERE RowNum = 1
        ORDER BY BuyerID;
        
        `;
       
    
        try {
            const bids = await executeQuery(bidsQuery, [buyerId, itemId]);
            
            return bids && bids.length > 0 ? bids : [];
        } catch (error) {
            console.error("Error fetching bids:", error);
           
            return [];
        }
    };

    const getMaxBid = async (itemId) => {
        const maxBidQuery = `
            SELECT MAX(BidAmount) AS MaxBidAmount
            FROM Bid
            WHERE ItemID = ?
        `;
        const maxBidResult = await executeQuery(maxBidQuery, [itemId]);
        return maxBidResult[0]?.MaxBidAmount || 0; 
    };

    try {
        const { itemId,buyerId } = event; // Extract itemId from event request
        const item = await getItemDetails(itemId);
        const bids = await getBidDetails(itemId);
        const maxBid = await getMaxBid(itemId);

        // Checks for flags
        if (item.IsPublished === 0) {
            throw itemNotFound;
        } else if (item.IsFrozen === 1) {
            throw itemFrozen;
        } else if (item.IsComplete === 1) {
            throw itemComplete;
        } else if (item.IsArchived === 1) {
            throw itemArchived;
        }

        response = {
            success: {
                code: 200,
                message: "Item Detail view successfully",
                itemDetails: {
                    ItemId: item.ItemId,
                    Name: item.Name,
                    Description: item.Description,
                    InitialPrice: item.InitialPrice,
                    Images: item.Images,
                    StartDate: item.StartDate,
                    DurationDays: item.DurationDays,
                    DurationHours: item.DurationHours,
                    DurationMinutes: item.DurationMinutes,
                    IsFrozen: item.IsFrozen,
                    IsArchived: item.IsArchived,
                    IsComplete: item.IsComplete,
                    IsFailed: item.IsFailed,
                    MaxBidAmount: maxBid,
                    biddingHistory: bids 
                }
            }
        };
        return response;

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "An error occurred.", error })
        };
    } finally {
        pool.end(); // Optionally close the pool here
    }
};
