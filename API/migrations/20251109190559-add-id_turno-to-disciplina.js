'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('disciplina', 'id_turno', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Turno', 
        key: 'id_turno',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('disciplina','id_turno');
  }
};
