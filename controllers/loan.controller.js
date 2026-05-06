const Validator = require("fastest-validator");
const v = new Validator();
const path = require("path")
const fs = require('fs');
const { Item, Loan, Return } = require('../models');
const { response } = require('../helpers/response.formatter');
const { Op } = require("sequelize");

module.exports = {
    createLoan: async (req, res) => {
        try {
            const { item_id, name, total_item, date } = req.body;
            const schema = {
                item_id: { type: "number", positive: true, integer: true },
                total_item: { type: "number", positive: true, integer: true },
                name: { type: "string", min: 3 },
                date: { type: "date" }
            }
            const data = {
                item_id: Number(item_id),
                total_item: Number(total_item),
                name: name,
                date: new Date(date)
            }

            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, "validasi error", validate));
            }
            // AMbil data sesuai item_id
            const item = await Item.findByPk(item_id);
            if (!item) {
                return res.status(400).json(response(400, "Item not found", item));
            }
            // memastikan data total item yang dipinjam

            if (data.total_item > item.stock) {
                return res.status(400).json(response(400, `Stock not available. Available only ${item.stock}`));
            }

            const loan = await Loan.create(data);

            const updateStock = await Item.update({
                stock: item.stock - data.total_item
            }, {
                where: { id: item_id }
            });
            // ambil data koan dari relasi item nya
            const loanWithItem = await Loan.findByPk(loan.id, { include: Item }); //include : ambil relasi ke model yang disebutkan

            return res.status(201).json(response(201, 'success', loanWithItem));

        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    getLoans: async (req, res) => {
        try {
            const {page, limit} = req.query;
            // page : ambil data di halaman ke berapa, limit : munculin data berapa
            // offset : menentukan data yang dimunculkan mulai dari berapa
            const offset = (Number(page) - 1) * Number(limit);
            // contoh page 1 = 1-1 = 0 , limitnya 10 : 0 * 10 = 0 jadi offset nya 0
            //data nya dimulai dari 1, halaman ke 1 datanya 1-10
            //contoh page 2 = 2-1 = 1, limit nya 10 : 1 * 10 = 10, jadi offset nya 10 data nya dimulai dari 11, halaman ke 2 10-20
            const {count, rows} = await Loan.findAndCountAll({
                offset: Number(offset),
                limit: Number(limit),
                include: [Item, Return]  //mengambil lebih dari satu relasi, dri nama model
            });
            const formatPagination = {
                data : rows, //data yang dimunculkan
                limit: limit,
                rows: (Number(offset)+1) + "-" + (Number(offset) + rows.length),
                total : count, //jumlah data keseluruhan
                page: page, //sedang di halaman ke berapa
            }

            return res.status(200).json(response(200, "success", formatPagination));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    }
}