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

    let response = {};

    const viewItems = (buyerID, isComplete, isActive, isFrozen) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    i.ItemID AS ItemId,
                    i.Name,
                    i.Description,
                    i.InitialPrice AS initial_price,
                    i.Images,
                    i.StartDate,
                    i.Duration AS endDate,
                    i.IsPublished,
                    i.IsFrozen,
                    i.IsArchived,
                    i.IsComplete,
                    i.IsFailed,
                    b.BidID AS BidId,
                    b.BuyerID,
                    b.BidAmount
                FROM 
                    Item i
                LEFT JOIN 
                    Bid b ON i.ItemID = b.ItemID
                WHERE 
                    i.IsComplete = ? 
                    AND i.IsFrozen = ? 
                    AND i.IsPublished = ?
            `;

            // Determine the active status based on isActive (in this case, you might want to adjust as needed)
            const isPublished = isActive === "true";

            pool.query(query, [isComplete === "true", isFrozen === "false", isPublished], (error, rows) => {
                if (error) {
                    response = { error: errorResponse };
                    return reject(error);
                }

                // Format the items and bidding history
                const items = rows.reduce((acc, row) => {
                    const { ItemId, Name, Description, initial_price, Images, StartDate, endDate, IsPublished, IsFrozen, IsArchived, IsComplete, IsFailed, BidId, BuyerID, BidAmount } = row;

                    // Check if item already exists in the accumulator
                    let item = acc.find(i => i.ItemId === ItemId);

                    if (!item) {
                        item = {
                            ItemId,
                            Name,
                            Description,
                            initial_price,
                            Images,
                            StartDate,
                            endDate,
                            IsPublished,
                            IsFrozen,
                            IsArchived,
                            IsComplete,
                            IsFailed,
                            biddingHistory: []
                        };
                        acc.push(item);
                    }

                    // Add bid details if available
                    if (BidId) {
                        item.biddingHistory.push({ BidId, BuyerId: BuyerID, ItemID: ItemId, BidAmount });
                    }

                    return acc;
                }, []);

                response = {
                    success: {
                        ...successResponse,
                        Items: items
                    }
                };

                resolve();
            });
        });
    };

    try {
        const { buyerID, isComplete, isActive, isFrozen } = event.request;
        await viewItems(buyerID, isComplete, isActive, isFrozen);
        return response;
    } catch (error) {
        return response;
    } finally {
        pool.end(); // Optionally close the pool here; can also be handled at application exit
    }
};
