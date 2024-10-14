'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('Licenses', 'expired', 'expiredAt');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('Licenses', 'expiredAt', 'expired');
  }
};
