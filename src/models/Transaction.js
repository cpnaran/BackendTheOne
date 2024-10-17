import { DataTypes } from 'sequelize';
import sequelize from '../../database.js';

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,  // สร้าง UUID อัตโนมัติ
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'Users',  // Name of the target table
            key: 'userId',        // Primary key column in Users table
        },
        onUpdate: 'CASCADE',  // Update transaction if user id changes
        onDelete: 'CASCADE',  // Delete transaction if user is removed
    },
    packageId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Packages',  // Name of the target table
            key: 'id',           // Primary key column in Packages table
        },
        onUpdate: 'CASCADE',  // Update transaction if package id changes
        onDelete: 'CASCADE',  // Set packageId to null if package is removed
    },
    paymentState: {
        type: DataTypes.ENUM('SUCCESS', 'PENDING', 'CANCEL', 'FAILED'),
        allowNull: false,  // อนุญาตให้เป็นค่าว่าง
    },
    license: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
})

export default Transaction;