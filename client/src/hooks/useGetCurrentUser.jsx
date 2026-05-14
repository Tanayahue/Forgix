import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { getRedirectResult } from "firebase/auth";
import { auth } from "../firebase";
import { serverUrl } from "../config/api";
import { setUserData } from "../redux/userSlice";

function useGetCurrentUser() {
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;

    const syncGoogleUserToBackend = async (firebaseUser) => {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/google`,
        {
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL,
        },
        { withCredentials: true }
      );

      if (isMounted) {
        dispatch(setUserData(data));
      }
    };

    const getCurrentUser = async () => {
      try {
        const redirectResult = await getRedirectResult(auth);

        if (redirectResult?.user) {
          await syncGoogleUserToBackend(redirectResult.user);
          return;
        }

        const result = await axios.get(`${serverUrl}/api/user/me`, {
          withCredentials: true,
        });

        if (isMounted) {
          dispatch(setUserData(result.data.user));
        }
      } catch (error) {
        // Avoid wiping a freshly logged-in user if the bootstrap request fails later.
        if (isMounted && !auth.currentUser) {
          dispatch(setUserData(null));
        }
        console.log("Auth bootstrap error:", error);
      }
    };

    getCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);
}

export default useGetCurrentUser;
