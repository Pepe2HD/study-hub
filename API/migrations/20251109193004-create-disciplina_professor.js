'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('disciplina_professor', {
      id_disciplina: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'disciplina',
          key: 'id_disciplina'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_professor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'professor',
          key: 'id_professor'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
    });

    await queryInterface.addConstraint('disciplina_professor', {
      fields: ['id_disciplina', 'id_professor'],
      type: 'primary key',
      name: 'id_disciplina_professor'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('disciplina_professor');
  }
};
