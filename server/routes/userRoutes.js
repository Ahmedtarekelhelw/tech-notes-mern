const router = require("express").Router();
const {
  getAllUsers,
  createNewuser,
  updateuser,
  deleteuser,
} = require("../controllers/usersControllers");
const verifyJwt = require("../middleware/verifyJwt");

router.use(verifyJwt);
router
  .route("/")
  .get(getAllUsers)
  .post(createNewuser)
  .patch(updateuser)
  .delete(deleteuser);

module.exports = router;
