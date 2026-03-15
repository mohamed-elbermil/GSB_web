const express = require('express')
const router = express.Router()
const userController = require('../controllers/user_controllers')
const authenticationController = require('../controllers/authentification_controller')

router.post('/', userController.createUser)
router.get('/', authenticationController.verifyToken,userController.getUsers)
router.put('/', authenticationController.verifyToken, userController.updateUser)
router.delete('/', authenticationController.verifyToken, userController.deleteUser)

module.exports = router