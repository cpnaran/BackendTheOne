'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Packages', 'packageType', {
      type: Sequelize.ENUM('STANDARD', 'PROMOTION'),
      defaultValue: 'STANDARD',
      allowNull: false,  // อนุญาตให้เป็นค่าว่าง
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Packages', 'packageType');
  }
};
