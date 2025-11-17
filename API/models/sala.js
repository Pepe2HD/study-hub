'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sala extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Disciplina, {
        foreignKey: 'id_sala' ,
        as: 'disciplina',
      })
    }
  }
  Sala.init({
    id_sala: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    capacidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bloco: {
      type: DataTypes.STRING(50),
      allowNull: true,
    }
    }, {
    sequelize,
    modelName: 'Sala',
    tableName: 'sala',
    timestamps: false,
  });
  return Sala;
};