import { useEffect, useState } from "react";
import { db, storage } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import ReactAudioPlayer from "react-audio-player";
import Link from "next/link";

export default function Home() {
  const [beats, setBeats] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchBeats = async () => {
      const beatsRef = collection(db, "beats");
      const querySnapshot = await getDocs(beatsRef);
      const fetchedBeats = [];

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        if (data.visibility === "public") {
          const fileRef = ref(storage, data.previewFile);
          const url = await getDownloadURL(fileRef);
          fetchedBeats.push({ id: doc.id, ...data, previewURL: url });
        }
      }

      setBeats(fetchedBeats);
    };

    fetchBeats();
  }, []);

  const filteredBeats =
    filter === "all" ? beats : beats.filter((b) => b.style === filter);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">🎵 BeatsMarket</h1>

      <div className="mb-4">
        <label>Filtrer par style : </label>
        <select
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">Tous</option>
          <option value="Drill">Drill</option>
          <option value="Trap">Trap</option>
          <option value="RnB">RnB</option>
          <option value="BoomBap">Boom Bap</option>
          <option value="Afro">Afro</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredBeats.length === 0 && <p>Aucune instru trouvée.</p>}

        {filteredBeats.map((beat) => (
          <div
            key={beat.id}
            className="border rounded p-4 shadow-md bg-white"
          >
            <h2 className="text-xl font-semibold">{beat.title}</h2>
            <p className="text-sm text-gray-600">
              Style : {beat.style} | BPM : {beat.bpm}
            </p>

            <ReactAudioPlayer src={beat.previewURL} controls preload="none" />

            <div className="mt-2 flex justify-between items-center">
              <Link
                href={`/beatmaker/${beat.userId}`}
                className="text-blue-600 underline"
              >
                Voir le beatmaker
              </Link>
              <button className="bg-black text-white px-4 py-2 rounded">
                Acheter
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
