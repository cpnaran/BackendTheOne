'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LogData', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,  // สร้าง UUID อัตโนมัติ
        allowNull: false,
        primaryKey: true,
      },
      license: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      checkInAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      checkOutAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW, // กำหนดวันที่สร้างเริ่มต้น
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW, // กำหนดวันที่อัปเดตเริ่มต้น
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('LogData');
  },
};