'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('LogData', 'vehicleType', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('LogData', 'vehicleColor', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('LogData', 'vehicleType');
    await queryInterface.removeColumn('LogData', 'vehicleColor');
  }
};