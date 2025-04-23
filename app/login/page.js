// "use client";

// import { useEffect, useState } from "react";
// import {
//   signInWithPopup,
//   GoogleAuthProvider,
//   onAuthStateChanged,
// } from "firebase/auth";
// import { auth } from "../../lib/firebase";
// import { useRouter } from "next/navigation";
// import styles from "../page.module.css";

// const provider = new GoogleAuthProvider();

// export default function LoginPage() {
//   const router = useRouter();
//   const [user, setUser] = useState(null);

//   const handleGoogleLogin = async () => {
//     try {
//       const result = await signInWithPopup(auth, provider);
//       setUser(result.user);
//       router.push("/");
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setUser(user);
//         router.push("/"); // auto-redirect if already logged in
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   return (
//     <div className={styles.container}>
//       <div className={styles.form}>
//         <h2 className={styles.title}>Login</h2>
//         <button className={styles.button} onClick={handleGoogleLogin}>
//           Sign in with Google
//         </button>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";

const provider = new GoogleAuthProvider();

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Track initial auth check
  const [user, setUser] = useState(null);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      router.push("/"); // Redirect after login
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        router.push("/"); // Redirect if already authenticated
      } else {
        setLoading(false); // Done checking auth, show login
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    ); // Optional: styled loading screen
  }

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <h2 className={styles.title}>Login</h2>
        <button className={styles.button} onClick={handleGoogleLogin}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
