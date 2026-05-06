const Validator = require("fastest-validator");
const v = new Validator();
const { User } = require('../models');
const { response } = require('../helpers/response.formatter');
const passwordHash = require('password-hash');
const {auth_secret} = require('../config/base.config')
const jwt = require('jsonwebtoken')

module.exports = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const schema = {
                email: { type: "string" },
                password: { type: "string" }
            }
            const data = {
                email: email,
                password: password
            }
            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, "Validasi Error", validate));
            }
            //cek apakah email tsb ada di table user?
            const user = await User.findOne({ where: { email: email } });
            // findOne : mencari 1 data bukan berdasarkan primary key
            if (!user) {
                return res.status(400).json(response(400, "Validasi Error", "Email not found. Try again"));
            }
            //mencocokan password teks dengan password encrpty
            const checkPassword = passwordHash.verify(password, user.password);
            // Jika tidak cocok
            if (!checkPassword) {
                return res.status(400).json(response(400, "validasi error", "Password incorrect. Try again!"));
            }

            //jika validasi berhasil, buat token jwt
            const token = jwt.sign({userId : user.id, email: user.email, name: user.name}, auth_secret);
            if(!token){
                return res.status(400).json(response(400, "validasi error", "login failed"));
            }
            //output
            const formatData = {
                data: user,
                token: token
            }
            return res.status(200).json(response(200, "success", formatData));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message))
        }
    }
}