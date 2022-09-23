import { store } from "../../app/store";
import { notesApiSlice } from "../notes/notesApiSlice";
import { usersApiSlice } from "../users/usersApiSlice";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

const Prefetch = () => {
  useEffect(() => {
    store.dispatch(
      notesApiSlice.util.prefetch("getNotes", "notesList", { force: true })
    );
    store.dispatch(
      usersApiSlice.util.prefetch("getUsers", "usersList", { force: true })
    );

    // const notes = store.dispatch(notesApiSlice.endpoints.getNotes.initiate());
    // const users = store.dispatch(usersApiSlice.endpoints.getUsers.initiate());
    // return () => {
    //   notes.unsubscribe();
    //   users.unsubscribe();
    // };
  }, []);
  return <Outlet />;
};

export default Prefetch;
