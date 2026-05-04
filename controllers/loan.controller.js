const Validator = require("fastest-validator");
const v = new Validator();
const path = require("path")
const fs = require('fs');
const { Item } = require('../models');
const { response } = require('../helpers/response.formatter');
const { Op } = require("sequelize");

module.exports = {
    createLoan: async (req, res) => {
        try{
            const {item_id, name, total_item, date} = req.body;
            const schema = {
                item_id : {type: "number", positive: true, integer: true},
                total_item : {type: "number", positive: true, integer: true},
                name : {type: "string", min: 3},
                date : {type: "date"}
            }
            const data = {
                item_id : Number(item_id),
                total_item: Number(total_item),
                name: name,
                date: new Date(date)
            }

            const validate = v.validate(data,schema);
            if(validate.length > 0){
                return res.status(400).json(response(400, "validasi error", validate));
            }
            // AMbil data sesuai item_id
            const item = await Item.findByPk(item_id);
            if(!item){
                return res.status(400).json(response(400, "Item not found", item));
            }
            // memastikan data total item yang dipinjam

            if(data.total_item > item.stock){
                return res.status(400).json(response(400, `Stock not available. Available only ${item.stock}`));
            }
        } catch (error){
            return response.status(500).json(500, "Server Error", error.message);
        }
    }
}