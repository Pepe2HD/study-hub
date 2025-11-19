'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Turno extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Disciplina, {
        foreignKey: 'id_turno' ,
        as: 'horario',
      })
    }
  }
  Turno.init({
    id_turno: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    turno: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Turno',
    tableName: 'turno',
    timestamps: false,
  });
  return Turno;
};
