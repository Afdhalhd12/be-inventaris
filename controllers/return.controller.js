const Validator = require("fastest-validator");
const v = new Validator();
const path = require("path")
const fs = require('fs');
const { Item, Loan, Return } = require('../models');
const { response } = require('../helpers/response.formatter');
const { Op } = require("sequelize");
const { type } = require("os");


module.exports = {
    createReturn: async (req, res) => {
        try {
            // nama di {} bisa disamakan dengan field di model
            const { loan_id, total_item, notes, date } = req.body;

            const schema = {
                loan_id: { type: "number", positive: true, integer: true },
                total_item: { type: "number", positive: true, integer: true },
                // Karena notes tidak wajib diisi, jd jika kosong definisikan sbg "-"
                notes: { type: "string" },
                date: { type: "date" }
            }

            const data = {
                loan_id: Number(loan_id),
                total_item: Number(total_item),
                notes: notes ?? "-",
                date: new Date(date)
            }

            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, "Validasi error", validate));
            }
            const loan = await Loan.findByPk(loan_id, { include: Item }); //sekaligus ambil data item nya, untuk difunakan stock akan diupdate (+)
            // Kalau data pinjaman engga ada
            if (!loan) {
                return res.status(400).json(response(400, "Validasi Error", "Data loan not found"));
            }
            // data total item pengembalian tidak boleh kurang dari pinjaman
            if (data.total_item > loan.total_item) {
                return res.status(400).json(response(400, "validasi error", "total return item more than loan item"));
            }

            //menambahkan data return
            const returnData = await Return.create(data); //Value untuk return sudah ada di const data semuannya
            //update stock : stock sebeleum nya + titak utem pengembalian,
            const updateStock = await Item.update({
                stock : loan.Item.stock + data.total_item
            }, {
                where: {id : loan.Item.id} //data id item adanya di relasi item dari data loan
            });

            // kembalikan data item, pinjaman, pemgembalian
            const loanWithItemReturn = await Loan.findByPk(loan_id, {include : [Item, Return]});
            return res.status(201).json(response(201,"created", loanWithItemReturn));



        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    }
}