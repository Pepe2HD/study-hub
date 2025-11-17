'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Horario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Curso, {
        foreignKey: 'id_curso',
        as: 'curso',
      }),
      this.belongsTo(models.Professor, {
        foreignKey: 'id_professor',
        as: 'professor',
      }),
      this.belongsTo(models.Disciplina, {
        foreignKey: 'id_disciplina',
        as: 'disciplina',
      })
    }
  }
  Horario.init({
    id_horario: {
      type:DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dia_da_semana: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Horario',
    tableName: 'horario',
    timestamps: false,
  });
  return Horario;
};