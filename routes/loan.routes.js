const express = require('express')
const router = express.Router() //biar bisa bikin router di express

const upload = require('../middleware/upload')
const loanController = require('../controllers/loan.controller')
const returnController = require('../controllers/return.controller')

router.post('/', upload.none(), loanController.createLoan)
router.get('/', loanController.getLoans)
router.post('/:id/return', upload.none(), returnController.createReturn)

module.exports = router