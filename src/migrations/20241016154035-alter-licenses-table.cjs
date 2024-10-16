'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Licenses', 'paymentState');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Licenses', 'paymentState', {
      type: Sequelize.UUID,
      allowNull: false,
    });
  }
};
