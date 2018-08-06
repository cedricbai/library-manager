'use strict';

var dateFormat = require('dateformat');

module.exports = function(sequelize, DataTypes) {
  var Loans = sequelize.define('Loans', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    book_id: DataTypes.INTEGER,
    patron_id: DataTypes.INTEGER,
    loaned_on: {
      type: DataTypes.DATEONLY,
      validate: {
        notEmpty: {
          msg: "Loaned on date is required"
        }
      }
    },
    return_by: {
      type: DataTypes.DATEONLY,
      validate: {
        notEmpty: {
          msg: "Due date is required"
        }
      }
    },
    returned_on: {
      type: DataTypes.DATEONLY,
      validate: {
        notEmpty: {
          msg: "Return date is required"
        }
      }
    }
  }, 
  {
    timestamps: false 
  },{ 
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Loans;
};