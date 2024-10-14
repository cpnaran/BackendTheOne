import { DataTypes } from 'sequelize';
import sequelize from '../../database.js';

const License = sequelize.define('License', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    license: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    paymentState: {
        type: DataTypes.ENUM('SUCCESS', 'PENDING', 'CANCEL', "FAILED"),
        allowNull: false,
        defaultValue: 'PENDING'
    },
    expiredAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
    }
});

export default License;
