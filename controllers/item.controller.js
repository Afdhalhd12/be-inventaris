const Validator = require("fastest-validator");
const v = new Validator();
const path = require("path")
const fs = require('fs');


const { Item } = require('../models');
const { response } = require('../helpers/response.formatter');
const { Op } = require("sequelize");

module.exports = {
    // req : inputan, res : output nya
    createItem: async (req, res) => {
        try {
            // ambil inputan (payload) : req.body
            const { name, stock } = req.body;
            const { image } = req.file;

            // Validasi
            const schema = {
                name: { type: "string", min: 3 },
                stock: { type: "number", positive: true, integer: true }
            }

            // Menyiapkan data yang akan divalidasi
            const data = {
                // FieldDatabase : NamaDariReq
                name: name,
                stock: Number(stock)
                // Karena req.body json berupa string, jd stock diubah ke tipe dat number pake number
            }
            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                // Jika hasil vaalidate ada error
                return res.status(400).json(response(400, "Validasi Error", validate));
            }
            // Cek jika image tidak diupload (req.file : mengambil input file)
            if (!req.file) {
                return res.status(400).json(response(400, "validasi Error", "Image not found"));
            }

            // Proses menyimpan data melalui ORM sequelize
            const item = await Item.create({
                name: data.name, //ambil dari object yang di validasi sebelumnya
                stock: data.stock,
                image: req.file.filename //Ambil fieldname hasil dari middleware multer
            });
            return res.status(201).json(response(201, "created", item));
        } catch (error) {
            // Penanganan err kodingan di try
            return response.status(500).json(500, "Server Error", error.message);
        }
    },

    getItem: async (req, res) => {
        try {
            // req.query : ambil params di postman/ambil data acuan untuk search/sort
            // sortBy -> mengurutkan berdasarkan field apa
            // order : ASC/DESC, opsi pengututan
            const { name, sortBy, order } = req.query

            const items = await Item.findAll({
                where: name ? {
                    name: {
                        [Op.like]: `%${name}%` //mencari yang mirip
                    }
                } : {}, //Cari berdasarkan field name di db dari name req.query
                // kalau di params postman ada sortby order, jalannin pengurutan, klo gaada pake default. misal sortBy wn order DESC
                order: sortBy && order ? [[sortBy, order]] : []
            });

            return res.status(200).json(response(201, 'Success', items));
        } catch (error) {
            return res.status(500).json(response(500, 'Serverr Error', error.message));
        }
    },

    showItem: async (req, res) => {
        try {
            // req.params :ambil dari path diamis, /items/2, item angkka 2 (id)
            const { id } = req.params;
            // findByPk : mencari berdasarkan primary key (id)
            const item = await Item.findByPk(id)
            if (!item) {
                return res.status(400).json(response(400, " Data [id] not found"))
            }
            return res.status(200).json(response(200, "Success", item))
        } catch (error) {
            return res.status(500).json(response(500, "Response error", error.message))
        }
    },

    updateItem: async (req, res) => {
        try {
            const { id } = req.params;

            const { name, stock } = req.body;
            const { image } = req.file;

            // Validasi
            const schema = {
                name: { type: "string", min: 3 },
                stock: { type: "number", positive: true, integer: true }
            }

            // Menyiapkan data yang akan divalidasi
            const data = {
                // FieldDatabase : NamaDariReq
                name: name,
                stock: Number(stock)
                // Karena req.body json berupa string, jd stock diubah ke tipe dat number pake number
            }
            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                // Jika hasil vaalidate ada error
                return res.status(400).json(response(400, "Validasi Error", validate));
            }

            const item = await Item.findByPk(id); //ambil data sebelumnya
            if (!item) {
                return res.status(400).json(response(400, "Validasi Error", "Data not found"));
            }
            // Kalau ada file baru, file lama dihapus
            if (req.file) {
                const imageName = item.getDataValue('image');
                // Karena image udah diganti jadi link di getter model di ambil yang aslinya pake getDataValue
                // Cari image ke folder uploads
                const filePath = path.join(__dirname, '../uploads', imageName);
                //cek jika file ada di folder tersebut
                if (fs.existsSync(filePath)) {
                    // hapus file
                    fs.unlinkSync(filePath);
                    // Hasil dari proses update hanya true dan false buka data baru
                    const updateProcess = await Item.update({
                        name: data.name,
                        stock: data.stock,
                        // Jika ada data baru ambil namanya, kalau gaada ambil tanpa link (nama ghambar sebelumnya)
                        image: (req.file ? req.file.filename : item.getDataValue('image'))
                    }, {
                        where: { id: id }
                    });
                    // Untuk memunculkan data karena sebelum nya hanya berupa true/false
                    const newItem = await Item.findByPk(id);
                    return res.status(200).json(response(200, "success update", newItem));
                }
            }


        } catch (error) {
            return res.status(500).json(response(500, "Response error", error.message))
        }
    },

    deleteItem : async (req, res) => {
        try{
            const {id} = req.params;
            const item = await Item.findByPk(id);
             const imageName = item.getDataValue('image');
                // Karena image udah diganti jadi link di getter model di ambil yang aslinya pake getDataValue
                // Cari image ke folder uploads
                const filePath = path.join(__dirname, '../uploads', imageName);
                //cek jika file ada di folder tersebut
                if (fs.existsSync(filePath)) {
                    // hapus file
                    fs.unlinkSync(filePath);
                }
            const deleteProcess = await Item.destroy({
                where: {id : id}
            });
            return res.status(200).json(response(200,'deleted'));
        }catch (error){
             return res.status(500).json(response(500, "Response error", error.message))
        }
    }
}