import { selectAllUsers } from "../users/usersApiSlice";
import { selectNoteById } from "../notes/notesApiSlice";
import { useSelector } from "react-redux";
import EditNoteForm from "./EditNoteForm";
import { useParams } from "react-router-dom";
import { useGetUsersQuery } from "../users/usersApiSlice";
import { useGetNotesQuery } from "../notes/notesApiSlice";
import PulseLoader from "react-spinners/PulseLoader";
import useAuth from "../../hooks/useAuth";

const EditNote = () => {
  const { id } = useParams();
  const { username, isManager, isAdmin } = useAuth();
  // const users = useSelector(selectAllUsers);
  // const note = useSelector((state) => selectNoteById(state, id));

  const { users } = useGetUsersQuery("usersList", {
    selectFromResult: ({ data }) => ({
      users: data?.ids.map((id) => data?.entities[id]),
    }),
  });

  const { note } = useGetNotesQuery("notesList", {
    selectFromResult: ({ data }) => ({
      note: data?.entities[id],
    }),
  });

  if (!note || !users?.length) return <PulseLoader color={"#fff"} />;

  if (!isAdmin && !isManager) {
    if (note.username !== username) {
      return <p className="errmsg">No Access</p>;
    }
  }
  const content = <EditNoteForm users={users} note={note} />;

  return content;
};

export default EditNote;
