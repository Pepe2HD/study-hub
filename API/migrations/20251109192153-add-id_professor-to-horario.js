'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('horario', 'id_professor', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Professor', 
        key: 'id_professor',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('horario','id_professor');
  }
};
