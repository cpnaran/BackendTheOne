'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. ลบ Foreign Key Constraints ซ้ำ
    await queryInterface.removeConstraint('Transactions', 'Transactions_ibfk_3');
    await queryInterface.removeConstraint('Transactions', 'Transactions_ibfk_4');
    await queryInterface.removeConstraint('Transactions', 'Transactions_ibfk_5');
    await queryInterface.removeConstraint('Transactions', 'Transactions_ibfk_6');

    // 2. ลบ Unique Index ของ userId
    await queryInterface.removeIndex('Transactions', 'userId');

    // 3. เปลี่ยนคอลัมน์ userId ให้ไม่มี UNIQUE
    await queryInterface.changeColumn('Transactions', 'userId', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // 4. เพิ่ม Foreign Key Constraint กลับ (เพียงอันเดียว)
    await queryInterface.addConstraint('Transactions', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'Transactions_user_fk',
      references: {
        table: 'Users',
        field: 'userId',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

  },

  async down(queryInterface, Sequelize) {
    // 1. ลบ Foreign Key Constraint ที่เพิ่มไว้ใหม่
    await queryInterface.removeConstraint('Transactions', 'Transactions_user_fk');

    // 2. เพิ่ม Unique Index กลับ
    await queryInterface.addIndex('Transactions', ['userId'], {
      unique: true,
      name: 'userId',
    });

    // 3. เพิ่ม Foreign Key Constraints กลับ (หากจำเป็น)
    await queryInterface.addConstraint('Transactions', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'Transactions_ibfk_3',
      references: {
        table: 'Users',
        field: 'userId',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

  },
};
