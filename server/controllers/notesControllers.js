const Note = require("../models/Note");
const User = require("../models/User");

//@desc Get all notes
//@route GET /notes
//@access private
const getAllNotes = async (req, res) => {
  const notes = await Note.find().lean();
  if (!notes?.length) return res.status(400).json({ msg: "No notes found" });

  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );

  res.json(notesWithUser);
};

//@desc create new note
//@route POST /notes
//@access private
const createNewNote = async (req, res) => {
  const { title, text, userId } = req.body;
  if (!title || !text || !userId)
    return res.status(400).json({ msg: "All fields are required" });

  // Check for duplicate title
  const duplicate = await Note.findOne({ title })
    .collation({ locale: "en", strength: 2 }) // check for case sensitive data (lower case or upper case)
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate note title" });
  }

  const user = await User.findById(userId).exec();

  if (!user) return res.status(400).json({ msg: "User not found" });

  const newNote = await Note.create({ title, text, user: userId });

  res.json(newNote);
};

//@desc update a note
//@route PATCH /notes
//@access private
const updateNote = async (req, res) => {
  const { id, title, text, completed, userId } = req.body;

  if (!id || !title || !text || !userId || typeof completed !== "boolean")
    return res.status(400).json({ msg: "All fields are required" });

  const note = await Note.findById(id).exec();
  if (!note) return res.status(400).json({ msg: "Note not found" });

  // Check for duplicate title
  const duplicate = await Note.findOne({ title })
    .collation({ locale: "en", strength: 2 }) // check for case sensitive data (lower case or upper case)
    .lean()
    .exec();

  // Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate note title" });
  }

  const updatedNote = await Note.findByIdAndUpdate(
    id,
    { title, text, completed, user: userId },
    { new: true }
  );

  res.json(`'${updatedNote.title}' updated`);
};

//@desc delete note
//@route DELETE /notes
//@access private
const deleteNote = async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ msg: "'Note ID required" });

  // Confirm note exists to delete
  const note = await Note.findById(id).exec();

  if (!note) return res.status(400).json({ message: "Note not found" });

  const result = await note.deleteOne();

  const reply = `Note '${result.title}' with ID ${result._id} deleted`;

  res.json({ msg: reply });
};

module.exports = { getAllNotes, createNewNote, updateNote, deleteNote };
