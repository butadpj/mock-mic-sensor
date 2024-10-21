import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCoGWjGrJXsyVqaBTtSppMXU8UUBRGZOo0",
  authDomain: "mock-mic-sensor.firebaseapp.com",
  databaseURL:
    "https://mock-mic-sensor-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mock-mic-sensor",
  storageBucket: "mock-mic-sensor.appspot.com",
  messagingSenderId: "989440159988",
  appId: "1:989440159988:web:6253c42a1b92c609f32ea1",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
