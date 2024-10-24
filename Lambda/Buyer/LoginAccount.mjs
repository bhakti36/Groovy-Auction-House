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
                    console.log(rows[0])
                    response = {
                        success: success,
                        accountID: rows[0].accountID
                        // Add fields for more info
                    }
                    resolve(rows[0].value)
                } else {
                    response = {
                        error: usernameNotFound
                    }
                    reject("unable to locate username '" + username + "'")
                }
            });
        });
    }

    try {
        let username = event.username
        let password = event.password
        await CheckPassword(username, password)
        return response
    } catch (error) {
        return response
    } finally {
        pool.end()
    }

};

