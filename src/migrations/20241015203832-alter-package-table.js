'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Change 'expiredAt' column to allow null values
    await queryInterface.changeColumn('Packages', 'expiredAt', {
      type: Sequelize.DATE,
      allowNull: true, // Allow NULL values
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert 'expiredAt' column to disallow null values (if needed)
    await queryInterface.changeColumn('Packages', 'expiredAt', {
      type: Sequelize.DATE,
      allowNull: false, // Disallow NULL values
    });
  }
};
