import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useEffect, useState } from 'react';

export default function BeatPage() {
  const router = useRouter();
  const { id } = router.query;
  const [beat, setBeat] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchBeat = async () => {
      const ref = doc(db, 'beats', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setBeat({ id: snap.id, ...snap.data() });
      }
    };

    fetchBeat();
  }, [id]);

  if (!beat) return <p style={{ padding: 20 }}>Chargement...</p>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h1>🎵 {beat.title}</h1>
      <p>Style : {beat.style}</p>
      <p>Prix : {beat.price} €</p>
      <audio controls style={{ width: '100%' }}>
        <source src={beat.previewUrl} type="audio/mp3" />
      </audio>

      <div style={{ marginTop: 20 }}>
        <a
          href={`/api/checkout-session?beatId=${beat.id}`}
          style={{
            backgroundColor: '#22c55e',
            color: 'white',
            padding: '10px 20px',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          💳 Acheter
        </a>
      </div>
    </div>
  );
}
