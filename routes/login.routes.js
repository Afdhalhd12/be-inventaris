const express = require('express')
const router = express.Router() //biar bisa bikin router di express

const loginController = require('../controllers/login.controller')
const upload = require('../middleware/upload')

//tidak menggunakan prefix karena nanti akan berbeda, tidak pake prefix karena nanti login dan logout akan beda
router.post('/login', upload.none(), loginController.login);

module.exports = router