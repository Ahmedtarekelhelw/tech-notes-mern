const router = require("express").Router();
const {
  createNewNote,
  getAllNotes,
  updateNote,
  deleteNote,
} = require("../controllers/notesControllers");
const verifyJwt = require("../middleware/verifyJwt");

router.use(verifyJwt);
router
  .route("/")
  .get(getAllNotes)
  .post(createNewNote)
  .patch(updateNote)
  .delete(deleteNote);

module.exports = router;
