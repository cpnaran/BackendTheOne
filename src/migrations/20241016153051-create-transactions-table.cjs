'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,  // สร้าง UUID อัตโนมัติ
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        references: {
          model: 'Users',  // Name of the target table
          key: 'userId',        // Primary key column in Users table
        },
        onUpdate: 'CASCADE',  // Update transaction if user id changes
        onDelete: 'CASCADE',  // Delete transaction if user is removed
      },
      packageId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Packages',  // Name of the target table
          key: 'id',           // Primary key column in Packages table
        },
        onUpdate: 'CASCADE',  // Update transaction if package id changes
        onDelete: 'CASCADE',  // Set packageId to null if package is removed
      },
      paymentState: {
        type: Sequelize.ENUM('SUCCESS', 'PENDING', 'CANCEL', 'FAILED'),
        allowNull: false,  // อนุญาตให้เป็นค่าว่าง
      },
      licenseId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), // กำหนดให้บันทึกวันที่ปัจจุบัน
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), // อัปเดตวันที่อัตโนมัติ
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transactions');
  },
};
