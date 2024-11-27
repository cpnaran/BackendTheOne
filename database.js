import { Sequelize } from "sequelize";
import { config } from "dotenv";

config();
//Todo after pass all test change db credential
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",

    pool: {
      max: 10, // Maximum number of connections in pool
      min: 0, // Minimum number of connections in pool
      acquire: 30000, // The maximum time Sequelize will wait before throwing an error when trying to connect (in milliseconds)
      idle: 10000, // The maximum time (in milliseconds) that a connection can be idle before being released
    },
  }
);

// ทดสอบการเชื่อมต่อ
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

export default sequelize;
