'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Licenses', {
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
      },
      license: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      expired: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('Licenses');
  },
};
