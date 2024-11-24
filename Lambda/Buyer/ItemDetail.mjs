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

    let response = {};

    // Function to fetch item details and bidding history
    const getItemDetails = (itemId, buyerId) => {
        return new Promise((resolve, reject) => {
            const query = `
            SELECT 
                i.ItemId,
                i.Name,
                i.Description,
                i.Images,
                i.InitialPrice,
                i.StartDate,
                i.DurationDays,
                i.DurationHours,
                i.DurationMinutes,
                i.IsPublished,
                i.IsFrozen,
                i.IsArchived,
                i.IsComplete,
                i.IsFailed,
                b.BidID,
                b.BuyerID,
                b.BidAmount
            FROM 
                Item i
            LEFT JOIN 
                Bid b ON i.ItemID = b.ItemID
            WHERE 
                i.ItemID = ? AND 
                (b.BuyerID = ?)
        `;
            pool.query(query, [itemId, buyerId], (error, rows) => {
                
                if (error) {
                    console.error("Database error:", error);
                    return reject(errorResponse);
                }

                // Format the item details and bidding history
                let itemDetails = null;

                if (rows.length > 0) {
                   //console.log("bhaks-->",rows)
                    const { ItemId, Name, Description, initial_price, Images, StartDate, DurationDays,DurationHours,DurationMinutes, IsPublished, IsFrozen, IsArchived, IsComplete, IsFailed } = rows[0];

                    itemDetails = {
                        ItemId,
                        Name,
                        Description,
                        initial_price,
                        Images,
                        StartDate,
                        DurationDays,
                        DurationHours,
                        DurationMinutes,
                        IsPublished,
                        IsFrozen,
                        IsArchived,
                        IsComplete,
                        IsFailed,
                        biddingHistory: []
                    };


                    rows.forEach(row => {
                        const { BidID, BuyerID, BidAmount } = row;
                        // console.log("BidId",BidID);
                        // console.log("BuyerID",BuyerID);
                        // console.log("BidAmount",BidAmount);
                       // console.log("row bhakti-->",row);
                        if (BidID) {
                           // console.log("yee");
                          
                            itemDetails.biddingHistory.push({ BidID, BuyerID, BidAmount });
                            //console.log("itemDetails",itemDetails);
                        }
                    });
                }
                
                resolve({
                    success: {
                        ...successResponse,
                        ItemDetails: itemDetails || {}
                    }
                });
            });
        });
        
    };
    let item;
    try {
        const { itemId, buyerId } = event; // Extract itemId and buyerId from event request
       
        try {
            response = await getItemDetails(itemId, buyerId);
            //console.log("item-->",item);
            return response;
          } catch (fetchError) {
            console.error("Error fetching item:", fetchError);
            return { error: fetchError };
          }
        //   response = {
        //     success: {
        //         code: 200,
        //         message: "Item Detail view successfully",
        //         itemDetails: {
        //             ItemId: item.ItemId,
        //             Name: item.Name,
        //             Description: item.Description,
        //             initial_price: item.initial_price,
        //             Images: item.Images,
        //             StartDate: item.StartDate,
        //             DurationDays: item.DurationDays,
        //             DurationHours: item.DurationHours,
        //             DurationMinutes: item.DurationMinutes,
        //             IsFrozen: item.IsFrozen,
        //             IsArchived: item.IsArchived,
        //             IsComplete: item.IsComplete,
        //             IsFailed: item.IsFailed,
        //             biddingHistory:item.biddingHistory
        //         }
        //       }
        //   };
        
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "An error occurred.", error })
        };
    } finally {
        pool.end(); // Optionally close the pool here
    }
};
