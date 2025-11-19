'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Professor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Horario, {
        foreignKey: 'id_professor' ,
        as: 'horario',
      }),
      this.belongsToMany(models.Disciplina, {
        through: 'disciplina_professor',
        foreignKey: 'id_professor',
        otherKey: 'id_disciplina',
        as: 'disciplina',
        timestamps: false
      });
    }
  }
  Professor.init({
    id_professor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
    },
  }, {
    sequelize,
    modelName: 'Professor',
    tableName: 'professor',
    timestamps: false,
  });
  return Professor;
};
