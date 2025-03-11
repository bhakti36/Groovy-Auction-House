import mysql from 'mysql';

export const handler = async (event) => {
  const pool = mysql.createPool({
    host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "8NpElCb61lk8lqVRaYAu",
    database: "auction_house"
  });

  const itemAddFailure = {
    status: 400,
    message: "Failed to add item"
  };

  const dbError = {
    status: 402,
    message: "DB Error"
  };

  let response = {};

  const AddItem = (
    sellerID,
    name,
    description,
    initialPrice,
    startDate,
    duration,
    isPublished,
    isFrozen,
    isArchived,
    isComplete,
    isFailed,
    images 
  ) => {
    return new Promise((resolve, reject) => {
      pool.query(
        "INSERT INTO auction_house.Item (Name, Description, Images, InitialPrice, StartDate, Duration, IsPublished, IsFrozen, IsArchived, IsComplete, IsFailed, SellerID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          name,
          description,
          JSON.stringify(images),
          initialPrice,
          startDate,
          duration,
          isPublished,
          isFrozen,
          isArchived,
          isComplete,
          isFailed,
          sellerID
        ],
        (error, result) => {
          if (error) {
            console.error("DB Error during insert:", error);
            response = { error: dbError };
            return reject(error);
          }

          const newItemID = result.insertId;

          pool.query("SELECT * FROM auction_house.Item WHERE ItemID=?", [newItemID], (selectError, items) => {
            if (selectError) {
              console.error("DB Error during select:", selectError);
              response = { error: dbError };
              return reject(selectError);
            }

            if (items && items.length === 1) {
              response = {
                success: {
                  code: 200,
                  message: "Item added successfully",
                  itemID: items[0].ItemID
                }
              };
              resolve(response);
            } else {
              response = { error: itemAddFailure };
              reject("Failed to retrieve added item");
            }
          });
        }
      );
    });
  };

  try {
    let {
      SellerID: sellerID,
      Name: name,
      Description: description,
      Initial_Price: initialPrice,
      StartDate: startDate,
      Duration: duration,
      IsPublished: isPublished,
      IsFrozen: isFrozen,
      IsArchived: isArchived,
      IsComplete: isComplete,
      IsFailed: isFailed,
      Images: images
    } = event;

    response = await AddItem(
      sellerID,
      name,
      description,
      initialPrice,
      startDate,
      duration,
      isPublished,
      isFrozen,
      isArchived,
      isComplete,
      isFailed,
      images 
    );
    return response;
  } catch (error) {
    console.error("Error in AddItem function:", error);
    return response;
  } finally {
    pool.end();
  }
};
