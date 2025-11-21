'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const senhaCriptografada = await bcrypt.hash('admin123', 10);
    const emailAdmin = 'pedroviniciuslimasilva219@gmail.com';

    const adminExistente = await queryInterface.rawSelect('admin', {
      where: { email: emailAdmin },
    }, ['id_admin']);

    if (!adminExistente) {

      await queryInterface.bulkInsert('admin', [{
        nome: 'Administrador',
        email: emailAdmin,
        senha: senhaCriptografada,
      }], { modelName: 'Admin' });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('admin', { email: emailAdmin }, {});
  }
};
