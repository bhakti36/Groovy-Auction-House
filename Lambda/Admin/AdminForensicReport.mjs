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
    const getForensicItemReport = async () => {
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

    //get list of top 10 profit item
    const getTopTenProfitItemsDetails = async () => {
        const itemQuery = `
        SELECT 
    i.ItemID,i.Name,i.Description,i.Images,i.InitialPrice,i.StartDate,i.DurationDays,i.DurationHours,i.DurationMinutes,i.SellerID,
    p.PurchaseID,p.PurchasePrice,p.AuctionHouseProfit
FROM 
    Item i
INNER JOIN 
    Purchase p ON i.ItemID = p.ItemID
ORDER BY 
    p.AuctionHouseProfit DESC
LIMIT 10;
        `;
        
        const item = await executeQuery(itemQuery);
       
        if (item.length > 0) {
            return item;
        } else {
            throw itemNotFound;
        }
    }

    //get profit earn till date and number of items
    const getTotalProfit = async () => {
        const itemQuery = `
        SELECT SUM(AuctionHouseProfit) AS TotalProfit
FROM Purchase;
        `;
        
        const item = await executeQuery(itemQuery);
       
        if (item.length > 0) {
            return item;
        } else {
            throw itemNotFound;
        }
    }

    //top 10 items on which most number of bids made
    const getTopTenMostBids = async () => {
        const itemQuery = `
        SELECT 
    i.ItemID, 
    i.Name AS ItemName, 
    COUNT(b.BidID) AS TotalBids
FROM 
    Item i
JOIN 
    Bid b 
ON 
    i.ItemID = b.ItemID
GROUP BY 
    i.ItemID, i.Name
ORDER BY 
    TotalBids DESC
LIMIT 10;

        `;
        
        const item = await executeQuery(itemQuery);
       
        if (item.length > 0) {
            return item;
        } else {
            throw itemNotFound;
        }
    }

    //top 10 items on which heighest bid made
    const getTopTenHeighestBidItems = async () => {
        const itemQuery = `
        SELECT 
    i.ItemID, 
    i.Name AS ItemName, 
    MAX(b.BidAmount) AS HighestBidAmount
FROM 
    Item i
JOIN 
    Bid b 
ON 
    i.ItemID = b.ItemID
GROUP BY 
    i.ItemID, i.Name
ORDER BY 
    HighestBidAmount DESC
LIMIT 10;

        `;
        
        const item = await executeQuery(itemQuery);
       
        if (item.length > 0) {
            return item;
        } else {
            throw itemNotFound;
        }
    }

    //top 10 items on which most distinct participats engaged
    const getTopTenNumberOfBidderItems = async () => {
        const itemQuery = `
        SELECT 
    i.ItemID, 
    i.Name AS ItemName, 
    COUNT(DISTINCT b.BuyerID) AS DistinctBidders
FROM 
    Item i
JOIN 
    Bid b 
ON 
    i.ItemID = b.ItemID
GROUP BY 
    i.ItemID, i.Name
ORDER BY 
    DistinctBidders DESC
LIMIT 10;
        `;
        
        const item = await executeQuery(itemQuery);
       
        if (item.length > 0) {
            return item;
        } else {
            throw itemNotFound;
        }
    }

    //get participants list on each item
    const getParticipantsDetails = async () => {
        const query = `
        SELECT 
        DISTINCT a.AccountID,
        a.Username AS BuyerName,
        i.Name AS ItemName,
        p.PurchasePrice AS SaleValue
    FROM 
        Bid b
    JOIN
        Accounts a on a.AccountID=b.BuyerID
    JOIN 
        Item i ON b.ItemID = i.ItemID
    JOIN 
        Purchase p ON b.ItemID = p.ItemID
    WHERE 
        p.PurchasePrice > 0
    ORDER BY 
        a.Username;
    `;
    
    return await executeQuery(query);
    }

    try {
        const { username, password } = event;
        
       // const forensicReport = await getForensicItemReport();
        const topProfitItems = await getTopTenProfitItemsDetails();
        const totalProfit = await getTotalProfit();
        const topMostBids = await getTopTenMostBids();
        const topHeighestBidItems = await getTopTenHeighestBidItems();
        const topBidderItems = await getTopTenNumberOfBidderItems();
        const participants = await getParticipantsDetails();

        // Construct the response object with the results
        response = {
            //forensicReport,
            topProfitItems,
            totalProfit,
            topMostBids,
            topHeighestBidItems,
            topBidderItems,
            participants
        };
return response;
       
    
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
