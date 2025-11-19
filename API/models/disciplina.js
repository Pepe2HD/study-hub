'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Disciplina extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Periodo, {
        foreignKey: 'id_periodo',
        as: 'periodo',
      }),
      this.belongsTo(models.Sala, {
        foreignKey: 'id_sala',
        as: 'sala',
      }),
      this.belongsTo(models.Turno, {
        foreignKey: 'id_turno',
        as: 'turno',
      }),
      this.hasMany(models.Horario, {
        foreignKey: 'id_disciplina' ,
        as: 'horario',
      }),
      this.belongsToMany(models.Curso, {
        through: 'curso_disciplina',
        foreignKey: 'id_disciplina',
        otherKey: 'id_curso',
        as: 'curso',
        timestamps: false
      }),
      this.belongsToMany(models.Professor, {
        through: 'disciplina_professor',
        foreignKey: 'id_disciplina',
        otherKey: 'id_professor',
        as: 'professor',
        timestamps: false
      });
    }
  }
  Disciplina.init({
    id_disciplina: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    } ,
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Disciplina',
    tableName: 'disciplina',
    timestamps: false,
  });
  return Disciplina;
};
