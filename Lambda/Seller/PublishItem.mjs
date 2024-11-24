import mysql from 'mysql';

export const handler = async (event) => {
  const pool = mysql.createPool({
    host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "8NpElCb61lk8lqVRaYAu",
    database: "auction_house",
  });

  const publishFailure = {
    status: 400,
    message: "Failed to publish item",
  };

  const dbError = {
    status: 402,
    message: "DB Error",
  };

  const itemNotFound = {
    status: 405,
    message: "Item not found",
  };

    const itemAlreadyPublished = {
    status: 406,
    message: "Item already published",
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

// check the seller and item exist
  const CheckItemAndSeller = async (sellerID, itemID) => {
        const query = "SELECT * FROM auction_house.Item WHERE ItemID = ? AND SellerID = ?";
        const results = await executeQuery(query, [itemID, sellerID]);
        if (results.length === 0) {
            throw itemNotFound;
        }
        if (results[0].IsPublished === 1) {
            throw itemAlreadyPublished;
        }
  };


// Update the item to publish it
  const UpdateItem = async (itemID) => {

    const query = "UPDATE auction_house.Item SET IsPublished = true, StartDate = CURRENT_TIMESTAMP WHERE ItemID = ?";
    await executeQuery(query, [itemID]);

    const itemDeailsQuery = "SELECT * FROM auction_house.Item WHERE ItemID = ?";
    const itemDetails = await executeQuery(itemDeailsQuery, [itemID]);

    response = {
        status: 200,
        success: {
            message: "Item published successfully",
            data: {
                itemID: itemDetails[0].ItemID,
                startDate: itemDetails[0].StartDate
                },
            },
        };
    };



// Lambda handler
    const { sellerID, itemID } = event;
    
    try{
        await CheckItemAndSeller(sellerID, itemID);
        await UpdateItem(itemID);
        return response;
    } catch (error) {
        console.error("Error:", error);
        return error;
    } finally {
        pool.end();
    }
    
};
