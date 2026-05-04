'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Loans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      item_id: {
        type: Sequelize.BIGINT
      },
      name: {
        type: Sequelize.STRING
      },
      total_item: {
        type: Sequelize.INTEGER
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
    // Mendefinisikan fk
    await queryInterface.addConstraint("Loans", {
      fields: ['item_id'], //COlumn fk
      type: 'foreign key',
      name: "fk_custom_item_id", //alias nya
      references: { //pk nya ada dimana
        table: "Items",
        field: 'id' //nama pk nya
      },
      onDelete: 'CASCADE', //Jika pk dihapus, data FK ikut terhapus
      onUpdate: 'CASCADE', //Jika Pk(id) di ubah, id fk ikut terubah
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Loans');
  }
};