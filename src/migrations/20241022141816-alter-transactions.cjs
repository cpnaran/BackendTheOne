"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Transactions", "amount", {
      type: Sequelize.FLOAT,
      after: "packageId",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Transactions", "amount", {});
  },
};
