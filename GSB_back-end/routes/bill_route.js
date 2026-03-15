const express = require('express')
const router = express.Router()
const { createBill, getBills, getBillById, updateBill, deleteBill } = require('../controllers/bill_controllers')
const { verifyToken } = require('../controllers/authentification_controller')
const upload = require('../middlewares/upload')

router.post('/', verifyToken, upload.single('proof'), createBill)
router.get('/', verifyToken, getBills)
router.get('/:id', verifyToken, getBillById)
router.put('/:id', verifyToken, updateBill)
router.delete('/:id', verifyToken, deleteBill)

module.exports = router 