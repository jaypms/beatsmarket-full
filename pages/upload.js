import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage, auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [style, setStyle] = useState('Trap');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState(null);
  const [exclusive, setExclusive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [user] = useAuthState(auth);
  const router = useRouter();

  const styles = ['Trap', 'Drill', 'RnB', 'Boom Bap', 'Afro', 'Autre'];

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!user) return alert('Vous devez être connecté.');
    if (!file || !title || !price) return alert('Remplissez tous les champs.');

    setLoading(true);
    try {
      const fileRef = ref(storage, `beats/${user.uid}/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      await addDoc(collection(db, 'beats'), {
        title,
        style,
        price: parseFloat(price),
        previewUrl: url,
        exclusive,
        isPublic: true,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      router.push('/profil');
    } catch (err) {
      console.error('Erreur upload :', err);
      alert('Erreur upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h1>📤 Upload un beat</h1>
      <form onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Titre du beat"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />

        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        >
          {styles.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Prix en €"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />

        <label>
          <input
            type="checkbox"
            checked={exclusive}
            onChange={(e) => setExclusive(e.target.checked)}
            style={{ marginRight: 6 }}
          />
          Vendre en exclusivité
        </label>

        <input
          type="file"
          accept="audio/mp3,audio/wav"
          onChange={(e) => {
            setFile(e.target.files[0]);
            setPreviewUrl(URL.createObjectURL(e.target.files[0]));
          }}
          style={{ width: '100%', marginTop: 10, marginBottom: 10 }}
        />

        {previewUrl && (
          <audio controls style={{ width: '100%', marginBottom: 10 }}>
            <source src={previewUrl} />
          </audio>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: 12,
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontWeight: 'bold',
          }}
        >
          {loading ? 'Upload en cours...' : 'Uploader le beat'}
        </button>
      </form>
    </div>
  );
}
