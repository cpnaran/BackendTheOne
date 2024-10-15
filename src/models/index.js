import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../../database.js'; // ตรวจสอบให้แน่ใจว่าเส้นทางนี้ถูกต้อง

const basename = path.basename(import.meta.url);
const db = {};

// อ่านไฟล์โมเดลทั้งหมดในโฟลเดอร์นี้
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db; // ใช้ export default ถ้าใช้ ES Modules
