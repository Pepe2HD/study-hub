'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('horario', 'id_periodo', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'periodo', 
        key: 'id_periodo',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('horario','id_periodo');
  }
};
