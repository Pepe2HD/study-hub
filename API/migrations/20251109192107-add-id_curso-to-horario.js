'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('horario', 'id_curso', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'curso', 
        key: 'id_curso',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('horario','id_curso');
  }
};
