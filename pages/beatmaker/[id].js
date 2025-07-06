import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function BeatmakerPage() {
  const router = useRouter();
  const { id } = router.query;
  const [beats, setBeats] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchBeatmaker = async () => {
      const docRef = doc(db, 'users', id);
      const userSnap = await getDoc(docRef);
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }

      const q = query(collection(db, 'beats'), where('userId', '==', id), where('isPublic', '==', true));
      const snapshot = await getDocs(q);
      const beatsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBeats(beatsList);
    };

    fetchBeatmaker();
  }, [id]);

  if (!userData) return <p style={{ padding: 20 }}>Chargement...</p>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      {userData.bannerUrl && (
        <img
          src={userData.bannerUrl}
          alt="bannière"
          style={{ width: '100%', borderRadius: 10, marginBottom: 20 }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        {userData.avatarUrl && (
          <img
            src={userData.avatarUrl}
            alt="avatar"
            style={{ width: 80, height: 80, borderRadius: '50%', marginRight: 20 }}
          />
        )}
        <div>
          <h1>{userData.displayName || 'Beatmaker'}</h1>
          {userData.bio && <p>{userData.bio}</p>}
        </div>
      </div>

      <h2>🎶 Beats disponibles</h2>
      {beats.length === 0 && <p>Ce beatmaker n’a encore rien publié.</p>}
      {beats.map(beat => (
        <div key={beat.id} style={{ border: '1px solid #ccc', padding: 15, marginBottom: 15 }}>
          <h3>{beat.title}</h3>
          <p>Style : {beat.style}</p>
          <audio controls style={{ width: '100%' }}>
            <source src={beat.previewUrl} type="audio/mp3" />
          </audio>
        </div>
      ))}
    </div>
  );
}
