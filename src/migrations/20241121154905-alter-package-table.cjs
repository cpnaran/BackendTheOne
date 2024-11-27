'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Packages', 'packageType', {
      type: Sequelize.ENUM('STANDARD', 'PROMOTION', 'PREMIUM'),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Packages', 'packageType', {
      type: Sequelize.ENUM('STANDARD', 'PROMOTION'),
      allowNull: false,
    });
  },
};
