import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';

export default function Home() {
  const [beats, setBeats] = useState([]);
  const [styleFilter, setStyleFilter] = useState('');

  useEffect(() => {
    const fetchBeats = async () => {
      const beatsCollection = collection(db, 'beats');
      const q = styleFilter
        ? query(beatsCollection, where('style', '==', styleFilter))
        : beatsCollection;

      const snapshot = await getDocs(q);
      const beatsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBeats(beatsData);
    };

    fetchBeats();
  }, [styleFilter]);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      <h1>🎧 BeatsMarket</h1>
      <p>Explore les instrumentales disponibles</p>

      <div style={{ marginBottom: 20 }}>
        <label>Filtrer par style :</label>
        <select
          value={styleFilter}
          onChange={(e) => setStyleFilter(e.target.value)}
          style={{ marginLeft: 10 }}
        >
          <option value="">Tous</option>
          <option value="Drill">Drill</option>
          <option value="Trap">Trap</option>
          <option value="RnB">RnB</option>
          <option value="Afro">Afro</option>
          <option value="BoomBap">BoomBap</option>
        </select>
      </div>

      {beats.length === 0 && <p>Aucune instru trouvée.</p>}

      {beats.map((beat) => (
        <div key={beat.id} style={{ border: '1px solid #ccc', padding: 15, marginBottom: 20 }}>
          <h3>{beat.title}</h3>
          <p>Style : {beat.style}</p>
          <audio controls style={{ width: '100%' }}>
            <source src={beat.previewUrl} type="audio/mp3" />
          </audio>
          <div style={{ marginTop: 10 }}>
            <Link href={`/beat/${beat.id}`}>
              <a style={{ color: 'blue', textDecoration: 'underline' }}>🎵 Voir la page</a>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
