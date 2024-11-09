import mysql from 'mysql'

export const handler = async (event) =>  {

  const pool = mysql.createPool({
    host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "8NpElCb61lk8lqVRaYAu",
    database: "auction_house"
    });
  
  const success = {
    status: 200,
    message: "Logged in successfully"
  };

  let response = {}
  
  
    let GetItemsBySellerId = (sellerId) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM auction_house.Items WHERE SellerId=?", [sellerId], (error, rows) => {
                if (error) {
                    response = {
                        error: dbError
                    }
                    reject(error)
                }
                if (rows && rows.length > 0) {
                    response = {
                        status: 200,
                        items: rows
                    }
                    resolve(rows)
                } else {
                    response = {
                        status: 404,
                        message: "No items found for seller id " + sellerId
                    }
                    resolve([])
                }
            });
        });
    }

    try {
        const items = await GetItemsBySellerId(event.sellerId)
        return response;
    } catch (error) {
        console.log(error)
        return response;
    } finally {
        pool.end()
    }
}