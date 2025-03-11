import mysql from 'mysql'

export const handler = async (event) =>  {

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

  const wrongPassword = {
    status: 401,
    message: "wrong password"
  };

  const success = {
    status: 200,
    message: "Logged in successfully"
  };

  let response = {}
  
  let CheckPassword = (username, password) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM auction_house.Accounts WHERE Username=? AND Password=?", [username, password], (error, rows) => {
            if (error) { 
              response = {
                error: dbError
              }
              reject(error) 
            }
            if ((rows) && (rows.length == 1)) {
              response = {
                success: success
                // Add fields for more info
              }  
              resolve(rows[0].value)

            } else {
                reject("unable to locate username '" + username + "'")
                response = {
                  error: usernameNotFound
                }
            }
        });
    });
  }

  try {
    await CheckPassword(event.username, event.password)
    console.log("Hii not in lambda");
    return response;
  } catch (error) {
    console.log(error)
    return response;
  } finally {
    pool.end()
  }

};
