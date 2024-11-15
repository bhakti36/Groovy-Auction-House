import mysql from 'mysql';

export const handler = async (event) => {
    const pool = mysql.createPool({
        host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "8NpElCb61lk8lqVRaYAu",
        database: "auction_house"
    });

    const usernameNotFound = {
        status: 400,
        message: "username not found"
    };

    const dbError = {
        status: 402,
        message: "DB Error"
    };

    const accountClosed = {
        status: 403,
        message: "Account Closed"
    };

    const wrongPassword = {
        status: 401,
        message: "wrong password"
    };

    const notBuyerAccount = {
        status: 403,
        message: "Account is not a Buyer"
    };

    const success = {
        status: 200,
        message: "Logged in successfully"
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

    const getAccountDetails = async (username, password) => {
        const accountsQuery = "SELECT * FROM auction_house.Accounts WHERE Username=?";
        const accounts = await executeQuery(accountsQuery, [username]);

        if (accounts.length === 1) {
            if (accounts[0].Password !== password) {
                throw wrongPassword;
            }
            const accountID = accounts[0].AccountID;
            if (accounts[0].IsClosed === 1) {
                throw accountClosed;
            }
            return { accountID, username, accountType: accounts[0].AccountType };
        }
        throw usernameNotFound;
    };

    const getBuyerAccountDetails = async (accountID) => {
        const buyerAccountQuery = "SELECT * FROM auction_house.BuyerAccount WHERE AccountID=?";
        const buyerAccount = await executeQuery(buyerAccountQuery, [accountID]);

        if (buyerAccount.length === 1) {
            return buyerAccount[0];
        }
        throw usernameNotFound;
    };

    const getItemsWithBids = async () => {
        const itemsQuery = "SELECT * FROM auction_house.Item where IsPublished=1";
        const items = await executeQuery(itemsQuery);

        const itemsWithBids = await Promise.all(items.map(async (item) => {
            const bidsQuery = "SELECT * FROM auction_house.Bid WHERE ItemID=?";
            const bids = await executeQuery(bidsQuery, [item.ItemID]);

            return {
                ItemID: item.ItemID,
                Name: item.Name,
                Description: item.Description,
                Images: item.Images,
                InitialPrice: item.InitialPrice,
                StartDate: item.StartDate,
                Duration: item.Duration,
                IsPublished: item.IsPublished,
                IsFrozen: item.IsFrozen,
                IsArchived: item.IsArchived,
                IsComplete: item.IsComplete,
                IsFailed: item.IsFailed,
                biddingHistory: bids.map(bid => ({
                    BidID: bid.BidID,
                    BuyerID: bid.BuyerID,
                    ItemID: bid.ItemID,
                    BidAmount: bid.BidAmount
                }))
            };
        }));

        return itemsWithBids;
    };

    try {
        const username = event.username || "";
        const password = event.password || "";

        if (!username || !password) {
            return { status: 400, message: "Username and password required." };
        }

        const { accountID, accountType } = await getAccountDetails(username, password);

        if (accountType !== "Buyer") {
            throw notBuyerAccount;
        }

        const buyerAccountDetails = await getBuyerAccountDetails(accountID);
        const itemsWithBids = await getItemsWithBids();

        return {
            status: 200,
            success: {
                message: "logged in successfully!",
                accountID: accountID,
                username: username,
                totalFunds: buyerAccountDetails.TotalFunds,
                availableFunds: buyerAccountDetails.AvailableFunds,
                items: itemsWithBids
            }
        };
    } catch (error) {
        console.error("Handler error:", error);
        return error;
    }
};
