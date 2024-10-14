'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Packages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,  // สร้าง UUID อัตโนมัติ
        allowNull: false,
        primaryKey: true,
      },
      package: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      days: {
        type: Sequelize.SMALLINT.UNSIGNED,
        allowNull: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      startAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      expiredAt: {
        type: Sequelize.DATE,
        allowNull: false
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
    await queryInterface.dropTable('Packages');
  },
};
