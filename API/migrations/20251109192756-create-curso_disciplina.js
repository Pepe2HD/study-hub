'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('curso_disciplina', {
      id_curso: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Curso',
          key: 'id_curso'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_disciplina: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Disciplina',
          key: 'id_disciplina'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
    });

    await queryInterface.addConstraint('curso_disciplina', {
      fields: ['id_curso', 'id_disciplina'],
      type: 'primary key',
      name: 'id_curso_disciplina'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('curso_disciplina');
  }
};
