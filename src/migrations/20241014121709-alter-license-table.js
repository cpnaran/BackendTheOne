'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Licenses', 'paymentState', {
      type: Sequelize.ENUM('SUCCESS', 'PENDING', 'CANCEL', 'FAILED'),
      allowNull: false,  // อนุญาตให้เป็นค่าว่าง
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Licenses', 'paymentState');
  },
};
