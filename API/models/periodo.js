'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Periodo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Disciplina, {
        foreignKey: 'id_periodo' ,
        as: 'disciplina',
      })
    }
  }
  Periodo.init({
    id_periodo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }, 
  }, {
    sequelize,
    modelName: 'Periodo',
    tableName: 'periodo',
    timestamps: false, 
  });
  return Periodo;
};