import mysql from 'mysql'

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
    }

    const success = {
        status: 200,
        message: "Logged in successfully"
    };

    let response = {}

    let EditItem = (sellerID, itemID, updates) => {
        return new Promise((resolve, reject) => {
            const { name, description, initial_price, images, startDate, endDate } = updates;
    
            
            pool.query(
                `UPDATE Item 
                 SET Name = ?, Description = ?, InitialPrice = ?, Images = ?, StartDate = ?, Duration = ? 
                 WHERE ItemID = ? AND SellerID = ?`, 
                [name, description, initial_price, images, startDate, endDate, itemID, sellerID],
                (error, result) => {
                    if (error) {
                        response = {
                            error: "Database Error"
                        };
                        reject(response);
                    } else {
                        if (result.affectedRows == 1) {
                            response = {
                                success: "Item updated successfully"
                            };
                            resolve(response); 
                        } else {
                            response = {
                                error: "Item not found or update failed"
                            };
                            reject(response);
                        }
                    }
                }
            );
        });
    };

    try {
       // const { sellerID, itemID, updates } = event.request;
        await EditItem(event.sellerID, event.itemID, event.updates);
        console.log("Edit Item successfully");
        return response;
    } catch (error) {
        console.log(error)
        return response;
    } finally {
        pool.end(); 
    }

};
