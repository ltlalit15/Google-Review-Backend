

 import mysql from "mysql2";

 const dbConfig = {
   host: "147.93.30.189",
   port: 3306,
   user: "alex",
   password: "Root@123google",
   database: "rateo",
   charset: "utf8mb4",
   multipleStatements: false,
   timezone: "Z",
 };

 const pool = mysql.createPool(dbConfig);

 pool.promise()
   .getConnection()
   .then((connection) => {
     console.log("Database connected successfully");
     connection.release();
   })
   .catch((err) => {
     console.error("Error connecting to the database:", err);
   });

 export default pool.promise();
