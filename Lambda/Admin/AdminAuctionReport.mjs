import mysql from 'mysql';

export const handler = async (event) => {
    const pool = mysql.createPool({
        host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "8NpElCb61lk8lqVRaYAu",
        database: "auction_house"
    });

    const accountNotFound = {
        status: 400,
        message: "Account not found"
    };

    const dbError = {
        status: 402,
        message: "DB Error"
    };

    const notAdminAccount = {
        status: 403,
        message: "Account is not a Admin"
    };

    const itemNotFound = {
        status: 404,
        message: "Item not found"
    };

    const itemComplete = {
        status: 406,
        message: "Item is complete"
    };
    
    let response = {}

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

    //get item details on profit on that item
    const getCompletedItemReport = async () => {
        const itemQuery = `
        SELECT 
            p.*,
           
            a.Username AS BuyerName,
            a.AccountID as BuyerID,
            b.BidTimeStamp AS BidTime,
            (
                SELECT MAX(b2.BidAmount) 
                FROM Bid b2 
                WHERE b2.ItemID = i.ItemID
            ) AS HighestBidAmount
        FROM Purchase p
        INNER JOIN Item i ON p.ItemID = i.ItemID
        INNER JOIN Bid b ON b.ItemID = i.ItemID AND b.BidAmount = p.PurchasePrice
        INNER JOIN BuyerAccount ba ON b.BuyerID = ba.AccountID
        INNER JOIN Accounts a ON ba.AccountID = a.AccountID
        WHERE i.IsComplete = TRUE;
        `;
        
        const item = await executeQuery(itemQuery);
       
        if (item.length > 0) {
            return item;
        } else {
            throw itemNotFound;
        }
    };

    //get participants list on each item
    const getparticipantsDetails = async (itemIDs) => {
        const query = `
        SELECT 
            b.BidID,
            b.ItemID,
            b.BuyerID,
            a.Username AS BuyerName,
            b.BidAmount,
            MAX(b.BidAmount) OVER (PARTITION BY b.BuyerID, b.ItemID) AS MaxBidAmount
           
        FROM Bid b
        INNER JOIN BuyerAccount ba ON b.BuyerID = ba.AccountID
        INNER JOIN Accounts a ON ba.AccountID = a.AccountID
        WHERE b.ItemID IN (?);
    `;
    
    return await executeQuery(query, [itemIDs]);
    }

    try {
        const { username, password } = event;
        const item = await getCompletedItemReport();

        const itemIDs = item.map((item) => item.ItemID);
        
        let participantsDetails = [];
        if (itemIDs.length > 0) {
            // Call getparticipantsDetails with the extracted ItemIDs
            participantsDetails = await getparticipantsDetails(itemIDs);
        }

// Step 1: Group participantsDetails by ItemID
const participantsGroupedByItemID = participantsDetails.reduce((acc, detail) => {
    if (!acc[detail.ItemID]) {
        acc[detail.ItemID] = [];
    }
    acc[detail.ItemID].push({
        ItemID: detail.ItemID,
        BuyerID: detail.BuyerID,
        BuyerName: detail.BuyerName,
        BidAmount: detail.BidAmount,
        MaxBidAmount: detail.MaxBidAmount,
    });
    return acc;
}, {});

// Step 2: Map ParticipantsList to each item
const enrichedItems = item.map((itemDetail) => ({
    ...itemDetail,
    ParticipantsList: participantsGroupedByItemID[itemDetail.ItemID] || [], // Add participants or an empty list
}));



    //console.log("bhakss",participantsDetails);
    response = enrichedItems;
    return response;
        // response = {
        //     success: {
        //       code: 200,
        //       message: "report data successfully",
        //       itemreportDetails: {
        //         PurchaseID: item.PurchaseID,
        //         ItemID: item.ItemID,
        //         Name: item.Name,
        //         Description: item.Description,
        //         Images: item.Images,
        //         PurchasePrice: item.PurchasePrice,
        //         AuctionHouseProfit: item.AuctionHouseProfit,
        //         BuyerName: item.BuyerName,
        //         BuyerID: item.BuyerID,
        //         BidTime: item.BidTime,
        //         HighestBidAmount: item.HighestBidAmount,
        //         ParticipantsDetails:participantsDetails
                

        //         // itemName: item.Name,
        //         // itemDescription: item.Description,
        //         // initialPrice: item.InitialPrice,
        //         // images: item.Images,
        //         // DurationDays: item.DurationDays,
        //         // DurationHours: item.DurationHours,
        //         // DurationMinutes: item.DurationMinutes
        //       }
        //     }
        // };  
        // return response;
    } catch (error) {
        console.error(error);
        return error;
    } finally {
        pool.end((err) => {
            if (err) {
                console.error('Error closing the pool', err);
            } else {
                console.log('Pool was closed.');
            }
        });
    }
};
