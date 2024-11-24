import mysql from 'mysql';

export const handler = async (event) => {
  const pool = mysql.createPool({
    host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "8NpElCb61lk8lqVRaYAu",
    database: "auction_house",
  });

  const dbError = {
    status: 402,
    message: "DB Error",
  };

  const itemNotFound = {
    status: 404,
    message: "Item not found",
  };

  const itemNotEligible = {
    status: 405,
    message: "Item doesn't meet criteria for removal",
  };

  const removeSuccess = {
    status: 200,
    message: "Item removed successfully",
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

  const CheckItem = async (itemID) => {
    try {
      const query = "SELECT * FROM auction_house.Item WHERE ItemID = ?";
      const results = await executeQuery(query, [itemID]);
      
      if (results.length === 0) {
        throw itemNotFound;
      }

      const item = results[0];
      if (item.IsPublished || !item.IsArchived) {
        throw itemNotEligible;
      }
      return item; 
    } catch (error) {
      throw error;
    }
  };

  const RemoveItem = async (itemID) => {
    try {
      const query = "DELETE FROM auction_house.Item WHERE ItemID = ?";
      const results = await executeQuery(query, [itemID]);

      response = {
        status: removeSuccess.status,
        success: {
          message: removeSuccess.message,
          removedItemID: itemID,
        },
      };
    } catch (error) {
      console.error("DB Error:", error);
      response = { error: dbError };
      throw error;
    }
  };

  const { itemID } = event;

  try {
    if (!itemID) {
      throw { status: 400, message: "ItemID is required for this operation" };
    }
    await CheckItem(itemID);
    await RemoveItem(itemID);
    return response;
  } catch (error) {
    console.error("Error:", error);
    return error;
  } finally {
    pool.end();
  }
};
