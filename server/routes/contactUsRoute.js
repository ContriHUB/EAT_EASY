const express = require('express');
// const { isStudent, isChiefWarden, isCommitteeMember, auth } = require('../middleware/auth.middleware');
const {CreateMessage} = require('../controllers/contactUsController')
const router = express.Router();
router.post("/",CreateMessage);
module.exports = router;