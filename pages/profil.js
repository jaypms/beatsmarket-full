import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, storage } from '../lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import Link from 'next/link';

export default function Profil() {
  const [user, setUser] = useState(null);
  const [beats, setBeats] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/connexion');
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchBeats = async () => {
        const q = query(collection(db, 'beats'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBeats(data);
      };
      fetchBeats();
    }
  }, [user]);

  const supprimerBeat = async (beatId, storagePath) => {
    const docRef = doc(db, 'beats', beatId);
    await deleteDoc(docRef);

    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);

    setBeats(beats.filter(b => b.id !== beatId));
  };

  if (!user) return <p style={{ padding: 20 }}>Chargement...</p>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h1>🎛️ Mon profil</h1>
      <p>{user.email}</p>

      {beats.length === 0 && <p>Aucune instru uploadée.</p>}

      {beats.map((beat) => (
        <div key={beat.id} style={{ border: '1px solid #ccc', padding: 15, marginBottom: 15 }}>
          <h3>{beat.title}</h3>
          <p>Style : {beat.style}</p>
          <audio controls style={{ width: '100%' }}>
            <source src={beat.previewUrl} type="audio/mp3" />
          </audio>
          <div style={{ marginTop: 10 }}>
            <Link href={`/beat/${beat.id}`}>
              <a style={{ marginRight: 15, color: 'blue' }}>🎵 Voir la page</a>
            </Link>
            <button
              onClick={() => supprimerBeat(beat.id, beat.storagePath)}
              style={{
                background: 'red',
                color: 'white',
                padding: '6px 12px',
                border: 'none',
                borderRadius: 5,
              }}
            >
              ❌ Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
