'use strict';
global.totalPeriodo = 12;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    for (let i = 1; i <= totalPeriodo; i++) {
      const existente = await queryInterface.rawSelect( 'periodo', {
          where: { numero: i },
        }, ['id_periodo']);

      if (!existente) {
        await queryInterface.bulkInsert('periodo',[{
              numero: i,
            }], { modelName: 'Periodo' });
      }
    }
  },

  async down (queryInterface, Sequelize) {
    const TOTAL = 10;
    for (let i = 1; i <= totalPeriodo; i++) {
      await queryInterface.bulkDelete('periodo', { turno: 'noturno', numero: i },{});
    }
  }
};
