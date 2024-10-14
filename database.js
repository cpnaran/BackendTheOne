import { Sequelize } from 'sequelize';

// กำหนดการเชื่อมต่อกับฐานข้อมูล MySQL
const sequelize = new Sequelize('theONE', 'root', 'cpnaran@km2', {
    host: '98.80.248.196',
    dialect: 'mysql',
});

// ทดสอบการเชื่อมต่อ
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

export default sequelize;
