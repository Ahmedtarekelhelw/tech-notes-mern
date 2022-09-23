import { Outlet, Link } from "react-router-dom";
import usePersist from "../../hooks/usePersist";
import { useState, useRef, useEffect } from "react";
import { selectCurrentToken } from "./authSlice";
import { useRefreshMutation } from "./authApiSlice";
import { useSelector } from "react-redux";
import PulseLoader from "react-spinners/PulseLoader";

const PersistLogin = () => {
  const [persist] = usePersist();
  const token = useSelector(selectCurrentToken);
  const effectRef = useRef(false);

  const [trueSucc, setTrueSucc] = useState(false);

  const [
    refresh,
    {
      isUninitialized, // mean the function refresh has not been called yet
      isLoading,
      isError,
      error,
      isSuccess,
    },
  ] = useRefreshMutation();

  useEffect(() => {
    // react strict mode mount and unmount and remount
    if (effectRef.current === true || process.env.NODE_ENV !== "development") {
      const verifyRefreshToken = async () => {
        try {
          await refresh();
          setTrueSucc(true);
        } catch (error) {
          console.log(error);
        }
      };

      if (!token && persist) verifyRefreshToken();
    }

    return () => (effectRef.current = true);

    // eslint-disable-next-line
  }, []);

  let content;
  if (!persist) {
    // persit : false
    content = <Outlet />;
  } else if (isLoading) {
    // persist : true token : false
    content = <PulseLoader color={"#fff"} />;
  } else if (isError) {
    // persist : true token : false
    content = (
      <p className="errmsg">
        {error?.data?.msg} <Link to="/login">PLease Login again</Link>
      </p>
    );
  } else if (isSuccess && trueSucc) {
    //persit: true , token: true
    content = <Outlet />;
  } else if (token && isUninitialized) {
    //persit: true , token: true
    content = <Outlet />;
  }
  return content;
};

export default PersistLogin;
