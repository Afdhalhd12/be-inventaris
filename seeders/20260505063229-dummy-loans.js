'use strict';
const { Item } = require('../models')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    //ambil data item, semua untuk akses id nya byat fk item_id
    const items = await Item.findAll();
    //  loop sebanyak 20 kali data
    let dummyData = [];
    for (let index = 1; index <= 20; index++) {
      //mengambil secara acak id dari data item
      const itemId = items[Math.floor(Math.random() * items.length)];
      // Math.random : menghasilkan angka 0-1 (termasuk desimal), items.length : itung jumlah item
      //contoh : hasil random 0.5 length itemsnya 3
      //0.5 * 3 = 1.5 : kemudian di Math.floor diambil angka sblm koma = 1 jadi item_id atau 0.9 * 3 = 2.7 jadi item_id nya 2 atau 1 * 3 = 3 jd item_id nya 3
      let data = {
        item_id : itemId.id,
        name: `Peminjam ke-${index}`,
        total_item: 1,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      dummyData.push(data); //simpan data ke array
    }
    await queryInterface.bulkInsert("Loans", dummyData);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Loans", null, {});
  }
};
