'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('horario', 'id_disciplina', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'disciplina', 
        key: 'id_disciplina',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('horario','id_disciplina');
  }
};
