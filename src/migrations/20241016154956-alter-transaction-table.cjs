'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('Transactions', 'licenseId', 'license');

    await queryInterface.changeColumn('Transactions', 'license', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('Transactions', 'license', 'licenseId');

    await queryInterface.changeColumn('Transactions', 'licenseId', {
      type: Sequelize.UUID,
      allowNull: false,
    });
  }
};