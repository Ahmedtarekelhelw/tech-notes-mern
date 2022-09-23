import { faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAddnewNoteMutation } from "./notesApiSlice";
import useTitle from "../../hooks/useTitle";

const NewNoteForm = ({ users }) => {
  useTitle("New Note Page");

  const [addNewNote, { isError, isSuccess, isLoading, error }] =
    useAddnewNoteMutation();

  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [userId, setUserId] = useState(users[0]?.id);

  const onTitleChange = ({ target }) => {
    setTitle(target.value);
  };
  const onTextChange = ({ target }) => {
    setText(target.value);
  };
  const onUserIdChange = ({ target }) => {
    setUserId(target.value);
  };

  useEffect(() => {
    if (isSuccess) {
      setTitle("");
      setText("");
      setUserId("");
      navigate("/dash/notes");
    }
  }, [isSuccess, navigate]);

  const options = users.map((user) => (
    <option key={user._id} value={user._id}>
      {user.username}
    </option>
  ));

  const canSave = title && text && userId && !isLoading;

  const errClass = isError ? "errmsg" : "offscreen";
  const validTitleClass = !title ? "form__input--incomplete" : "";
  const validTextClass = !text ? "form__input--incomplete" : "";
  const validUserIdClass = !userId ? "form__input--incomplete" : "";

  const onSubmit = async (e) => {
    e.preventDefault();
    if (canSave) {
      await addNewNote({ title, text, userId });
    }
  };

  const content = (
    <>
      <p className={errClass}>{error?.data?.msg}</p>
      <form className="form" onSubmit={onSubmit}>
        <div className="form__title-row">
          <h2>New Note</h2>
          <div className="form__action-buttons">
            <button className="icon-button" title="Save" disabled={!canSave}>
              <FontAwesomeIcon icon={faSave} />
            </button>
          </div>
        </div>

        <label className="form__label" htmlFor="title">
          Title:
        </label>
        <input
          className={`form__input ${validTitleClass}`}
          id="title"
          name="title"
          type="text"
          autoComplete="off"
          value={title}
          onChange={onTitleChange}
        />

        <label className="form__label" htmlFor="text">
          Text:
        </label>
        <input
          className={`form__input ${validTextClass}`}
          id="text"
          name="text"
          type="text"
          value={text}
          onChange={onTextChange}
        />

        <label className="form__label" htmlFor="userId">
          ASSIGNED TO:
        </label>
        <select
          id="userId"
          name="userId"
          className={`form__select ${validUserIdClass}`}
          value={userId}
          onChange={onUserIdChange}
        >
          {options}
        </select>
      </form>
    </>
  );
  return content;
};

export default NewNoteForm;
