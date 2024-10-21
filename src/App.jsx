import { MicIcon, MicOffIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { database } from "./utils/firebase";
import { ref as firebaseRef, onValue, update } from "firebase/database";

function App() {
  const [username, setUsername] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [user, setUser] = useState(null);

  const [audioData, setAudioData] = useState(null); // Audio data from microphone

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const firebaseWorker = useRef(null);
  const audioWorker = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username.trim()) {
      // Save the username and initialize with 'enabled' as true
      const updates = {
        [`sensors/${username}/enabled`]: false,
        [`sensors/${username}/value`]: 0, // Initial value for the sound sensor
      };
      update(firebaseRef(database), updates)
        .then(() => {
          console.log(`User "${username}" saved to Firebase`);
          setIsRegistered(true);
        })
        .catch((err) => console.error("Error saving to Firebase:", err));
    }
  };

  const startRecording = useCallback(async (audioWorker) => {
    const initAudio = async () => {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      microphoneRef.current =
        audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);

      // uncomment hear urself
      // analyserRef.current.connect(audioContextRef.current.destination);

      const processAudio = () => {
        // Handle messages from Audio Processor worker
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteTimeDomainData(dataArray); // Use time domain data for RMS calculation

        audioWorker.postMessage({ dataArray });

        requestAnimationFrame(processAudio);
      };

      processAudio();
    };

    initAudio();
  }, []);

  useEffect(() => {
    if (isRegistered && username) {
      onValue(firebaseRef(database, "sensors"), (snapshot) => {
        const sensors = snapshot.val();
        Object.keys(sensors).forEach((user) => {
          if (user === username) {
            setUser(sensors[user]);
          }
        });
      });
    }
  }, [isRegistered, username]);

  useEffect(() => {
    if (user?.enabled) {
      const firebaseWorker = new Worker(
        new URL("./firebaseWorker.js", import.meta.url),
        {
          type: "module",
        }
      );
      const audioWorker = new Worker(
        new URL("./audioWorker.js", import.meta.url),
        {
          type: "module",
        }
      );

      startRecording(audioWorker);

      audioWorker.onmessage = (event) => {
        const { value } = event.data;

        setAudioData(value);
        firebaseWorker.postMessage({
          username,
          soundLevel: value,
        });
      };

      return () => {
        if (audioContextRef.current) {
          audioContextRef.current.close();
          firebaseWorker.terminate();
          audioWorker.terminate();
        }
      };
    }
  }, [startRecording, user, username]);

  return (
    <main>
      <div>
        {!isRegistered ? (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col text-3xl space-y-2">
              <label>Enter your username: </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="p-2 rounded"
              />
            </div>
            <button
              className="bg-orange-500 text-white py-2 px-1 rounded w-full"
              type="submit"
            >
              Submit
            </button>
          </form>
        ) : (
          <div className="text-3xl flex flex-col justify-center items-center space-y-4">
            <span className="text-orange-500">{username}</span>

            <div>
              {user?.enabled ? (
                <div>
                  <MicIcon size={200} color="orange" />
                  <p>Recording sound... Sound Level: {audioData}%</p>
                </div>
              ) : (
                <MicOffIcon size={200} color="gray" />
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
