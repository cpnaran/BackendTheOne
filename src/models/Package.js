import { DataTypes } from 'sequelize';
import sequelize from '../../database.js';

const Package = sequelize.define('Package', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,  // สร้าง UUID อัตโนมัติ
        allowNull: false,
        primaryKey: true,
    },
    package: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    days: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: false,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    startAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    expiredAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    updatedAt: {
        type: DataTypes.DATE,
    },
});

export default Package;