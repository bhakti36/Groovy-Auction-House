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
        message: "Items retrieved successfully"
    };

    const errorResponse = {
        code: 400,
        message: "Failed to search items"
    };

    const viewItems = async (isComplete, isActive, isFrozen) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM auction_house.Item WHERE IsComplete=? AND IsPublished=? AND IsFrozen=?", [isComplete, isActive, isFrozen], async (error, items) => {
                if (error) {
                    console.error("Items error:", error);
                    return reject(errorResponse);
                }

                const itemsWithBids = await Promise.all(items.map(async (item) => {
                   
                    const bidsResponse = await new Promise((resolve, reject) => {
                        pool.query("SELECT * FROM auction_house.Bid WHERE ItemID=?", [item.ItemID], (error, bids) => {
                            if (error) {
                                console.error("Bids query error:", error);
                                return reject(errorResponse);
                            }
                           
                            resolve(bids);
                        });
                    });

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
                        biddingHistory: bidsResponse.map(bid => ({
                            BidID: bid.BidID,
                            BuyerID: bid.BuyerID,
                            ItemID: bid.ItemID,
                            BidAmount: bid.BidAmount
                        }))
                    };
                }));

                resolve({
                    success: {
                        code: 200,
                        message: "View items successfully!",
                        items: itemsWithBids,
                    }
                });
            });
        });
    };

    try {
        // const buyerID = event.BuyerID;
        const isActive = event.IsPublished;
        const isComplete = event.IsComplete;
        const isFrozen = event.IsFrozen;

        const response = await viewItems(isComplete, isActive, isFrozen);
        return response;
    } catch (error) {
        console.error("Error in handler:", error);
        return errorResponse; // Return error response here
    } finally {
        pool.end(); 
    }
    //buyer id itemid 
    //bid and buyer join
};
3
