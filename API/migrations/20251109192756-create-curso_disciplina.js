'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE curso_disciplina (
        id_curso INT NOT NULL,
        id_disciplina INT NOT NULL,

        CONSTRAINT fk_curso
          FOREIGN KEY (id_curso)
          REFERENCES curso (id_curso)
          ON UPDATE CASCADE
          ON DELETE CASCADE,

        CONSTRAINT fk_disciplina
          FOREIGN KEY (id_disciplina)
          REFERENCES disciplina (id_disciplina)
          ON UPDATE CASCADE
          ON DELETE CASCADE,

        PRIMARY KEY (id_curso, id_disciplina)
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('curso_disciplina');
  }
};
