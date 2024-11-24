import mysql from 'mysql';

export const handler = async (event) => {
  const pool = mysql.createPool({
    host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "8NpElCb61lk8lqVRaYAu",
    database: "auction_house",
  });

  const unpublishFailure = {
    status: 400,
    message: "Failed to unpublish item",
  };

  const dbError = {
    status: 402,
    message: "DB Error",
  };

  const itemNotFound = {
    status: 405,
    message: "Item not found",
  };

  const itemAlreadyUnpublished = {
    status: 406,
    message: "Item is not published",
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

  // Check if the item exists and is published
  const CheckItemAndSeller = async (sellerID, itemID) => {
    const query = "SELECT * FROM auction_house.Item WHERE ItemID = ? AND SellerID = ?";
    const results = await executeQuery(query, [itemID, sellerID]);
    if (results.length === 0) {
      throw itemNotFound;
    }
    if (results[0].IsPublished === 0) {
      throw itemAlreadyUnpublished;
    }
  };

  // Update the item to unpublish it
  const UpdateItemUnpublish = async (itemID) => {
    const query = "UPDATE auction_house.Item SET IsPublished = false, StartDate = null WHERE ItemID = ?";
    await executeQuery(query, [itemID]);

    const itemDetailsQuery = "SELECT * FROM auction_house.Item WHERE ItemID = ?";
    const itemDetails = await executeQuery(itemDetailsQuery, [itemID]);

    response = {
      status: 200,
      success: {
        message: "Item unpublished successfully",
        data: {
          itemID: itemDetails[0].ItemID,
        },
      },
    };
  };

  // Lambda handler
  const { sellerID, itemID } = event;

  try {
    await CheckItemAndSeller(sellerID, itemID);
    await UpdateItemUnpublish(itemID);
    return response;
  } catch (error) {
    console.error("Error:", error);
    return error;
  } finally {
    pool.end();
  }
};
