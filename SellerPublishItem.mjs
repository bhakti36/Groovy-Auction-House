import mysql from 'mysql';

export const handler = async (event) => {
  const pool = mysql.createPool({
    host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "8NpElCb61lk8lqVRaYAu",
    database: "auction_house"
  });

  const itemPublishFailure = {
    status: 400,
    message: "Publish item failed"
  };

  const dbError = {
    status: 402,
    message: "DB Error"
  };

  let response = {};

  const AddItem = (SellerID, ItemID) => {
    return new Promise((resolve, reject) => {
      pool.query("SELECT * FROM auction_house.Item WHERE ItemID=? AND SellerID=?", [ItemID, SellerID], (error, rows) => {
        if (error) {
          console.error("DB error during item fetch:", error);
          response = { error: dbError };
          return reject(error);
        }

        if (rows && rows.length === 1) {
          const item = rows[0];
          item.IsActive = 1;

          pool.query("UPDATE auction_house.Item SET IsPublished = 1 WHERE ItemID=? AND SellerID=?", [ItemID, SellerID], (updateError, result) => {
            if (updateError) {
              console.error("Update error:", updateError);
              response = { error: dbError };
              return reject(updateError);
            }

            console.log("Item published successfully", result);

            response = {
              success: {
                code: 200,
                message: "Item published successfully",
                sellerID: item.SellerID,
                itemID: item.ItemID,
                type: [{
                  isActive: item.isActive,
                  isArchived: item.isArchived,
                  isFrozen: item.isFrozen,
                  isComplete: item.isComplete,
                  isFailed: item.isFailed,
                  StartDate: item.StartDate,
                }]
              }
            };
            resolve(response);
          });
        } else {
          console.log("Item not found or multiple items found");
          response = { error: itemPublishFailure };
          reject("Unable to publish item '" + ItemID + "'");
        }
      });
    });
  };

  try {
    const { SellerID, ItemID } = event;

    response = await AddItem(SellerID, ItemID);
    return response;

  } catch (error) {
    console.error("Error in AddItem process:", error);
    return { error: { message: error.message, code: 500 } };

  } finally {
    pool.end();
  }
};
