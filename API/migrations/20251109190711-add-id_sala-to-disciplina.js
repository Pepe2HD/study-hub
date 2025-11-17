'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('disciplina', 'id_sala', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'sala', 
        key: 'id_sala',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('disciplina','id_sala');
  }
};
