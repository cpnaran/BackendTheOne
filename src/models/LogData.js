import { DataTypes } from 'sequelize';
import sequelize from '../../database.js';

const LogData = sequelize.define('LogData', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    license: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    checkInAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    checkOutAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
    }
});

export default LogData;
