const express = require('express')
const router = express.Router() //biar bisa bikin router di express

const upload = require('../middleware/upload')
const loanController = require('../controllers/loan.controller')

router.post('/', upload.none(), loanController.createLoan)

module.exports = router