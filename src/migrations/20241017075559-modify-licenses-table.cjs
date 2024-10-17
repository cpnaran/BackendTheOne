'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add a unique constraint on the license column
    await queryInterface.addConstraint('Licenses', {
      fields: ['license'],
      type: 'unique',
      name: 'unique_license' // Optional: give a name to the constraint
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the unique constraint on the license column
    await queryInterface.removeConstraint('Licenses', 'unique_license');
  }
};
