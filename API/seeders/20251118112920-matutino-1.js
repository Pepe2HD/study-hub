'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    const existente = await queryInterface.rawSelect( 'turno', {
      where: { turno: 'matutino',numero: 1},
    }, ['id_turno']);

    if (!existente) {
      await queryInterface.bulkInsert('turno', [{
        turno:'matutino',
        numero: 1,
      }], {modelName: 'Turno'});
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('turno', { turno: 'matutino',numero: 1 }, {});
  }
};
