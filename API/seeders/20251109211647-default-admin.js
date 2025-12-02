'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const senhaCriptografada = await bcrypt.hash('123456', 10);
    const emailAdmin = 'ti2@fasec.edu.br;

    const adminExistente = await queryInterface.rawSelect('admin', {
      where: { email: emailAdmin },
    }, ['id_admin']);

    if (!adminExistente) {

      await queryInterface.bulkInsert('admin', [{
        nome: 'João.vitor',
        email: emailAdmin,
        senha: senhaCriptografada,
      }], { modelName: 'Admin' });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('admin', { email: emailAdmin }, {});
  }
};
