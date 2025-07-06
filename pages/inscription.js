import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';

export default function Inscription() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: pseudo });

      await setDoc(doc(db, 'users', user.uid), {
        displayName: pseudo,
        email: email,
        createdAt: new Date(),
        avatarUrl: '',
        bannerUrl: '',
        bio: '',
        plan: 'gratuit',
      });

      router.push('/profil');
    } catch (err) {
      console.error(err);
      setError('Erreur lors de l’inscription');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 20 }}>
      <h1>📝 Inscription</h1>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Nom d'artiste / Pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          required
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        <input
          type="email"
          placeholder="Adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: 10,
            backgroundColor: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontWeight: 'bold',
          }}
        >
          S'inscrire
        </button>
      </form>
    </div>
  );
}
