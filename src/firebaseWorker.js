import { ref as firebaseRef, update } from "firebase/database";
import { database } from "./utils/firebase";

self.onmessage = async (event) => {
  const { username, soundLevel } = event.data;

  const updates = {
    [`sensors/${username}/value`]: soundLevel,
  };
  update(firebaseRef(database), updates)
    .then(() => {
      // console.log(`Sound level (${soundLevel}) saved to Firebase.`);
    })
    .catch((err) => console.error("Error saving to Firebase:", err));

  // Optionally, you can send a message back to the main thread
  // self.postMessage({ status: "saved", username, soundLevel });
};
