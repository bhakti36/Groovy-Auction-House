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

    const bidFailed = {
        status: 401,
        message: "Failed to bid on the Item"
    };

    const dbError = {
        status: 402,
        message: "DB Error"
    };

    const insufficientFunds = {
        status: 403,
        message: "Insufficient funds"
    };

    const notBuyerAccount = {
        status: 403,
        message: "Account is not a Buyer"
    };
    
    const accountClosed = {
        status: 404,
        message: "Account Closed"
    };

    const itemNotFound = {
        status: 405,
        message: "Item not found"
    };

    const itemFrozen = {
        status: 406,
        message: "Item is frozen"
    };

    const itemComplete = {
        status: 407,
        message: "Item is complete"
    };

    const itemArchived = {
        status: 408,
        message: "Item is archived"
    };

    const bidAlreadyPlaced = {
        status: 409,
        message: "Bid already placed"
    };

    const bidTooLow = {
        status: 410,
        message: "Bid amount is too low"
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

    const getAccountDetails = async (accountID) => {
        const accountsQuery = "SELECT * FROM auction_house.Accounts WHERE AccountID=?";
        const accounts = await executeQuery(accountsQuery, [accountID]);

        if (accounts.length === 1) {
            if(accounts[0].AccountType !== 'Buyer') {
                throw notBuyerAccount;
            }
            if(accounts[0].IsClosed === 1) {
                throw accountClosed;
            }
            return accounts[0];
        } else {
            throw accountNotFound;
        }
    };

    const getBuyerAccountDetails = async (accountID) => {
        const accountsQuery = "SELECT * FROM auction_house.BuyerAccount WHERE AccountID=?";
        const accounts = await executeQuery(accountsQuery, [accountID]);

        if (accounts.length === 1) {
            return accounts[0];
        } else {
            throw accountNotFound;
        }
    };

    const getItemDetails = async (itemID) => {
        const itemQuery = "SELECT * FROM auction_house.Item WHERE ItemID=?";
        const item = await executeQuery(itemQuery, [itemID]);

        if (item.length === 1) {
            return item[0];
        } else {
            throw itemNotFound;
        }
    };

    const getBidsOnItem = async (itemID) => {
        const bidsQuery = "SELECT * FROM auction_house.Bid WHERE ItemID=?";
        const bids = await executeQuery(bidsQuery, [itemID]);

        if (bids.length > 0) {
            return bids;
        } else {
            return [];
        }
    };

    const placeBid = async (accountID, itemID, bidAmount, previousMaxBid = 0) => {
        const query = "INSERT INTO auction_house.Bid (BuyerID, ItemID, BidAmount) VALUES (?, ?, ?)";
        const params = [accountID, itemID, bidAmount];

        const updateFundsQuery = "UPDATE auction_house.BuyerAccount SET AvailableFunds = AvailableFunds + ? - ? WHERE AccountID = ?";
        const updateFundsParams = [previousMaxBid, bidAmount, accountID];

        await executeQuery(query, params);
        await executeQuery(updateFundsQuery, updateFundsParams);
        const buyerAccountDetails = await getAccountDetails(accountID);

        response = {
            status: 200,
            message: "Bid placed successfully",
            availableFunds: buyerAccountDetails.AvailableFunds
        };
    };

    try {
        const { accountID, itemID, bidAmount } = event;
        const accountDetails = await getAccountDetails(accountID);
        const buyerAccountDetails = await getBuyerAccountDetails(accountID);
        const itemDetails = await getItemDetails(itemID);
        const bidsOnItem = await getBidsOnItem(itemID);

        if (itemDetails.IsPublished === 0) {
            throw itemNotFound;
        } else if (itemDetails.IsFrozen === 1) {
            throw itemFrozen;
        } else if (itemDetails.IsComplete === 1) {
            throw itemComplete;
        } else if (itemDetails.IsArchived === 1) {
            throw itemArchived;
        }

        if (bidsOnItem.length > 0) {
            let maximumBid = bidsOnItem[0].BidAmount;
            let maximumBidderID = bidsOnItem[0].BuyerID;
            let previousMaxBid = 0
            for (const bid of bidsOnItem) {
                if (maximumBid < bid.BidAmount) {
                    maximumBid = bid.BidAmount;
                    maximumBidderID = bid.BuyerID;
                }
                if (accountID === bid.BuyerID && bid.BidAmount > previousMaxBid) {
                    previousMaxBid = bid.BidAmount;
                }
            }
            if (maximumBidderID === accountID) {
                throw bidAlreadyPlaced;
            }
            if (bidAmount > buyerAccountDetails.AvailableFunds + previousMaxBid) {
                throw insufficientFunds;
            } else

            if (bidAmount <= maximumBid) {
                throw bidTooLow;
            } else {
                await placeBid(accountID, itemID, bidAmount, previousMaxBid);
            }
        } else {
            if (bidAmount < itemDetails.InitialPrice) {
                throw bidTooLow;
            } else {
                await placeBid(accountID, itemID, bidAmount);
            }
        }

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
