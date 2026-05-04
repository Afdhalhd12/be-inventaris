'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Returns', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      loan_id: {
        type: Sequelize.BIGINT
      },
      total_item: {
        type: Sequelize.INTEGER
      },
      notes: {
        type: Sequelize.TEXT
      },
      date: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
     await queryInterface.addConstraint("Returns", {
      fields: ['loan_id'], //COlumn fk
      type: 'foreign key',
      name: "fk_custom_loan_id", //alias nya
      references: { //pk nya ada dimana
        table: "Loans",
        field: 'id' //nama pk nya
      },
      onDelete: 'CASCADE', //Jika pk dihapus, data FK ikut terhapus
      onUpdate: 'CASCADE', //Jika Pk(id) di ubah, id fk ikut terubah
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Returns');
  }
};