'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Packages', 'expiredAt', {
      type: Sequelize.DATE,
      allowNull: true,  // อนุญาตให้เป็นค่าว่าง
    });
  },

  async down(queryInterface, Sequelize) {
  },
};
