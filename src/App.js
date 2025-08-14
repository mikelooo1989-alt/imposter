import React, { useState, useCallback, useEffect } from 'react';

// --- Konfiguration & Daten ---
const INITIAL_WORD_CATEGORIES = {
  'Allgemein': ['Apfel', 'Banane', 'Gitarre', 'Strand', 'Sonne', 'Mond', 'Fluss', 'Berg', 'Fahrrad', 'Auto', 'Buch', 'Kaffee', 'Pizza', 'Haus', 'Schule', 'Computer', 'Musik', 'Film', 'Traum', 'Reise', 'Freund', 'Familie', 'Lachen', 'Glück', 'Sommer', 'Winter', 'Frühling', 'Herbst', 'Blume', 'Baum', 'Wasser', 'Feuer', 'Erde', 'Luft', 'Stern', 'Wolke', 'Regen', 'Schnee'],
  'Tiere': ['Hund', 'Katze', 'Elefant', 'Löwe', 'Tiger', 'Giraffe', 'Zebra', 'Affe', 'Pinguin', 'Krokodil', 'Schlange', 'Adler', 'Eule', 'Fisch', 'Wal', 'Delfin'],
  'Berufe': ['Arzt', 'Lehrer', 'Polizist', 'Feuerwehrmann', 'Koch', 'Bäcker', 'Ingenieur', 'Pilot', 'Künstler', 'Musiker', 'Schauspieler', 'Anwalt', 'Richter', 'Wissenschaftler'],
  'Eigene Wörter': []
};
const STORAGE_KEY = 'imposterGameSettings_v2';

// --- Hilfsfunktionen ---
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffleArray = (arr) => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

// --- Styling-Objekt ---
const styles = {
  safeArea: { flex: 1, backgroundColor: '#111827', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' },
  container: { flex: 1, padding: 20, display: 'flex', flexDirection: 'column' },
  screenContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' },
  scrollableScreenContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', width: '100%' },
  title: { fontSize: '3rem', fontWeight: 'bold', color: '#f9fafb', marginBottom: '16px', textAlign: 'center' },
  subtitle: { fontSize: '1.125rem', color: '#d1d5db', textAlign: 'center', marginBottom: '32px' },
  button: { backgroundColor: '#3b82f6', padding: '16px 32px', borderRadius: '12px', color: '#ffffff', fontSize: '18px', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.25)', marginTop: '20px' },
  buttonSecondary: { backgroundColor: '#6b7280' },
  buttonDisabled: { backgroundColor: '#4b5563', cursor: 'not-allowed' },
  input: { backgroundColor: '#374151', color: '#f9fafb', padding: '16px', borderRadius: '12px', fontSize: '18px', width: '100%', border: '1px solid #4b5563', boxSizing: 'border-box' },
  inputGroup: { width: '90%', maxWidth: '400px', marginBottom: '24px' },
  label: { color: '#d1d5db', fontSize: '16px', marginBottom: '8px', display: 'block' },
  errorText: { color: '#ef4444', marginTop: '10px', textAlign: 'center' },
  revealCard: { backgroundColor: '#1f2937', padding: '40px', borderRadius: '20px', minHeight: '250px', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: '400px', marginBottom: '40px', border: '1px solid #374151', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },
  avatarImage: { width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', marginBottom: '20px', border: '3px solid #3b82f6', backgroundColor: 'white' },
  revealText: { fontSize: '1.75rem', fontWeight: 'bold', color: '#f9fafb', textAlign: 'center' },
  imposterText: { fontSize: '2rem', fontWeight: 'bold', color: '#ef4444', textAlign: 'center' },
  revealSubtext: { fontSize: '1rem', color: '#9ca3af', marginTop: '16px', textAlign: 'center' },
  votingRow: { width: '100%', maxWidth: '500px', padding: '16px 0', borderBottom: '1px solid #374151' },
  votingPlayerText: { color: '#f9fafb', fontSize: '18px', marginBottom: '12px' },
  voteButtonsContainer: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  voteButton: { backgroundColor: '#4b5563', minWidth: '50px', height: '50px', borderRadius: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '8px', padding: '0 15px', border: 'none', cursor: 'pointer', color: '#ffffff', fontSize: '16px', fontWeight: 'bold' },
  voteButtonSelected: { backgroundColor: '#3b82f6', transform: 'scale(1.1)' },
  resultDetails: { backgroundColor: '#1f2937', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '500px', marginTop: '20px' },
  resultHeader: { color: '#f9fafb', fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', textAlign: 'center' },
  resultPlayerRow: { display: 'flex', alignItems: 'center', margin: '8px 0' },
  resultAvatar: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginRight: '15px', backgroundColor: 'white' },
  resultPlayerText: { color: '#d1d5db', fontSize: '18px', padding: '4px 0' },
  imposterTextSmall: { color: '#ef4444', fontWeight: 'bold' },
  citizenTextSmall: { color: '#22c55e', fontWeight: 'bold' },
  settingsSection: { width: '90%', maxWidth: '400px', marginBottom: '30px' },
  checkboxContainer: { display: 'flex', alignItems: 'center', marginBottom: '10px' },
  checkbox: { marginRight: '10px', width: '20px', height: '20px', cursor: 'pointer' },
  customWordInputContainer: { display: 'flex', gap: '10px' },
  customWordList: { listStyle: 'none', padding: 0, marginTop: '15px' },
  customWordItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#374151', padding: '8px 12px', borderRadius: '8px', marginBottom: '8px', color: '#f9fafb' },
  deleteButton: { backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 'bold' },
};

// --- UI Komponenten ---

const GameButton = ({ title, onClick, style, disabled = false, secondary = false }) => (
  <button onClick={onClick} style={{ ...styles.button, ...(secondary && styles.buttonSecondary), ...(disabled && styles.buttonDisabled), ...style }} disabled={disabled}>
    {title}
  </button>
);

const GameInput = ({ value, onChange, placeholder, type = 'text' }) => (
  <input style={styles.input} value={value} onChange={onChange} placeholder={placeholder} type={type} />
);

// --- Bildschirme der App ---

const WelcomeScreen = ({ onStart, onGoToSettings }) => (
  <div style={styles.screenContainer}>
    <p style={styles.title}>Imposter</p>
    <p style={styles.subtitle}>Das Spiel um Täuschung und Wahrheit</p>
    <GameButton title="Spiel starten" onClick={onStart} />
    <GameButton title="Einstellungen" onClick={onGoToSettings} secondary />
  </div>
);

const SettingsScreen = ({ initialSettings, onSave }) => {
    const [settings, setSettings] = useState(initialSettings);
    const [newWord, setNewWord] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const numPlayers = parseInt(settings.numPlayers, 10) || 0;
        const currentNames = settings.playerNames || [];
        if (currentNames.length !== numPlayers) {
            const newNames = Array.from({ length: numPlayers }, (_, i) => currentNames[i] || `Spieler ${i + 1}`);
            setSettings(s => ({ ...s, playerNames: newNames }));
        }
    }, [settings.numPlayers, settings.playerNames]); // KORRIGIERT: settings.playerNames hinzugefügt

    const handleCategoryToggle = (category) => {
        const newSelection = settings.selectedCategories.includes(category)
            ? settings.selectedCategories.filter(c => c !== category)
            : [...settings.selectedCategories, category];
        setSettings(s => ({ ...s, selectedCategories: newSelection }));
    };

    const handleAddWord = () => {
        if (newWord.trim() && !settings.customWords.includes(newWord.trim())) {
            const updatedWords = [...settings.customWords, newWord.trim()];
            setSettings(s => ({ ...s, customWords: updatedWords }));
            setNewWord('');
        }
    };

    const handleDeleteWord = (wordToDelete) => {
        const updatedWords = settings.customWords.filter(w => w !== wordToDelete);
        setSettings(s => ({ ...s, customWords: updatedWords }));
    };

    const handleSave = () => {
        // Validation logic
        setError('');
        if (settings.selectedCategories.length === 0) {
            setError('Bitte wähle mindestens eine Wort-Kategorie aus.');
            return;
        }
        if (settings.selectedCategories.includes('Eigene Wörter') && settings.customWords.length === 0) {
            setError('Wenn "Eigene Wörter" gewählt ist, füge bitte mindestens ein Wort hinzu.');
            return;
        }
        onSave(settings);
    };

    return (
        <div style={styles.scrollableScreenContainer}>
            <p style={styles.title}>Einstellungen</p>
            
            <div style={styles.settingsSection}>
                <p style={styles.subtitle}>Allgemein</p>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Anzahl der Spieler:</label>
                    <GameInput value={settings.numPlayers} onChange={(e) => setSettings(s => ({...s, numPlayers: e.target.value}))} type="number" />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Anzahl der Imposter:</label>
                    <GameInput value={settings.numImposters} onChange={(e) => setSettings(s => ({...s, numImposters: e.target.value}))} type="number" />
                </div>
            </div>

            <div style={styles.settingsSection}>
                <p style={styles.subtitle}>Spielernamen</p>
                {settings.playerNames.map((name, index) => (
                    <div key={index} style={styles.inputGroup}>
                        <GameInput value={name} onChange={(e) => {
                            const newNames = [...settings.playerNames];
                            newNames[index] = e.target.value;
                            setSettings(s => ({...s, playerNames: newNames}));
                        }} placeholder={`Name von Spieler ${index + 1}`} />
                    </div>
                ))}
            </div>

            <div style={styles.settingsSection}>
                <p style={styles.subtitle}>Wort-Kategorien</p>
                {Object.keys(INITIAL_WORD_CATEGORIES).map(category => (
                    <div key={category} style={styles.checkboxContainer}>
                        <input type="checkbox" id={category} checked={settings.selectedCategories.includes(category)} onChange={() => handleCategoryToggle(category)} style={styles.checkbox} />
                        <label htmlFor={category} style={{color: 'white', cursor: 'pointer'}}>{category}</label>
                    </div>
                ))}
            </div>
            
            {settings.selectedCategories.includes('Eigene Wörter') && (
                <div style={styles.settingsSection}>
                    <p style={styles.subtitle}>Eigene Wörter verwalten</p>
                    <div style={styles.customWordInputContainer}>
                        <GameInput value={newWord} onChange={(e) => setNewWord(e.target.value)} placeholder="Neues Wort..." />
                        <GameButton title="+" onClick={handleAddWord} style={{marginTop: 0, padding: '16px 20px'}} />
                    </div>
                    <ul style={styles.customWordList}>
                        {settings.customWords.map(word => (
                            <li key={word} style={styles.customWordItem}>
                                <span>{word}</span>
                                <button onClick={() => handleDeleteWord(word)} style={styles.deleteButton}>X</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {error && <p style={styles.errorText}>{error}</p>}
            <GameButton title="Speichern & Zurück" onClick={handleSave} />
        </div>
    );
};

const RevealScreen = ({ players, secretWord, onRevealComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleNext = () => {
    if (isRevealed) {
      if (currentIndex < players.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsRevealed(false);
      } else { onRevealComplete(); }
    } else { setIsRevealed(true); }
  };

  const currentPlayer = players[currentIndex];
  const revealText = isRevealed ? (currentPlayer.role === 'imposter' ? 'Du bist der Imposter!' : `Das Wort ist: ${secretWord}`) : `${currentPlayer.name} ist dran`;
  const buttonText = isRevealed ? 'Verstanden & Weitergeben' : 'Rolle aufdecken';

  return (
    <div style={styles.screenContainer}>
      <div style={styles.revealCard}>
        {!isRevealed && (<img src={currentPlayer.avatarUrl} alt={`Avatar für ${currentPlayer.name}`} style={styles.avatarImage} />)}
        <p style={isRevealed && currentPlayer.role === 'imposter' ? styles.imposterText : styles.revealText}>{revealText}</p>
        {!isRevealed && <p style={styles.revealSubtext}>Bist du bereit? Schau allein auf den Bildschirm.</p>}
      </div>
      <GameButton title={buttonText} onClick={handleNext} />
    </div>
  );
};

const DiscussionStartScreen = ({ startingPlayer, onStartVoting }) => (
    <div style={styles.screenContainer}>
        <p style={styles.title}>Diskussionsrunde</p>
        <div style={styles.revealCard}>
            <p style={styles.revealText}><span style={{color: '#3b82f6', fontWeight: 'bold'}}>{startingPlayer.name}</span> beginnt die Runde!</p>
            <p style={styles.revealSubtext}>Gebt nun reihum einen Hinweis zum geheimen Wort.</p>
        </div>
        <GameButton title="Zur Abstimmung" onClick={onStartVoting} />
    </div>
);

const VotingScreen = ({ players, onVoteComplete }) => {
  const [votes, setVotes] = useState({});
  const handleVote = (voterId, votedForId) => setVotes(prev => ({ ...prev, [voterId]: votedForId }));

  return (
    <div style={styles.scrollableScreenContainer}>
      <p style={styles.title}>Wer ist der Imposter?</p>
      <p style={styles.subtitle}>Diskutiert und stimmt ab!</p>
      {players.map(player => (
        <div key={player.id} style={styles.votingRow}>
          <p style={styles.votingPlayerText}>{player.name} stimmt für:</p>
          <div style={styles.voteButtonsContainer}>
            {players.map(candidate => (
              <button key={candidate.id} style={{...styles.voteButton, ...(votes[player.id] === candidate.id && styles.voteButtonSelected)}} onClick={() => handleVote(player.id, candidate.id)}>
                {candidate.name}
              </button>
            ))}
          </div>
        </div>
      ))}
      <GameButton title="Ergebnis anzeigen" onClick={() => onVoteComplete(votes)} />
    </div>
  );
};

const ResultScreen = ({ players, votes, onPlayAgain }) => {
  const voteCounts = useCallback(() => {
    const counts = {};
    players.forEach(p => { counts[p.id] = 0; });
    Object.values(votes).forEach(votedForId => {
      if (counts[votedForId] !== undefined) counts[votedForId]++;
    });
    return counts;
  }, [votes, players])();

  const maxVotes = Math.max(...Object.values(voteCounts));
  const votedOutPlayers = players.filter(p => voteCounts[p.id] === maxVotes && maxVotes > 0);
  const impostersFound = votedOutPlayers.some(p => p.role === 'imposter');

  return (
    <div style={styles.scrollableScreenContainer}>
      <p style={styles.title}>{impostersFound ? 'Die Bürger gewinnen!' : 'Die Imposter gewinnen!'}</p>
      <p style={styles.subtitle}>{votedOutPlayers.length > 0 ? `Am meisten Stimmen erhielt: ${votedOutPlayers.map(p => p.name).join(', ')}` : 'Niemand wurde rausgewählt.'}</p>
      <div style={styles.resultDetails}>
        <p style={styles.resultHeader}>Die wahren Rollen waren:</p>
        {players.map(player => (
          <div key={player.id} style={styles.resultPlayerRow}>
             <img src={player.avatarUrl} alt={player.name} style={styles.resultAvatar} />
             <p style={styles.resultPlayerText}>{player.name}: <span style={player.role === 'imposter' ? styles.imposterTextSmall : styles.citizenTextSmall}>{player.role === 'imposter' ? 'Imposter' : 'Bürger'}</span></p>
          </div>
        ))}
      </div>
      <GameButton title="Neue Runde spielen" onClick={onPlayAgain} />
    </div>
  );
};

// --- Haupt-App-Komponente ---
export default function App() {
  const [gameState, setGameState] = useState('welcome');
  const [players, setPlayers] = useState([]);
  const [revealOrder, setRevealOrder] = useState([]);
  const [startingPlayer, setStartingPlayer] = useState(null);
  const [settings, setSettings] = useState({
      numPlayers: 4,
      numImposters: 1,
      playerNames: Array.from({ length: 4 }, (_, i) => `Spieler ${i + 1}`),
      selectedCategories: ['Allgemein'],
      customWords: [],
  });
  const [secretWord, setSecretWord] = useState('');
  const [votes, setVotes] = useState({});

  useEffect(() => {
    try {
        const savedSettings = localStorage.getItem(STORAGE_KEY);
        if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch (error) { console.error("Konnte Einstellungen nicht laden:", error); }
  }, []);

  const handleSaveSettings = (newSettings) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        setSettings(newSettings);
        setGameState('welcome');
    } catch (error) { console.error("Konnte Einstellungen nicht speichern:", error); }
  };

  const handleStartGame = () => {
    const { numImposters, playerNames, selectedCategories, customWords } = settings;
    
    let wordPool = [];
    selectedCategories.forEach(category => {
        if (category === 'Eigene Wörter') {
            wordPool.push(...customWords);
        } else {
            wordPool.push(...(INITIAL_WORD_CATEGORIES[category] || []));
        }
    });

    if (wordPool.length === 0) {
        alert("Keine Wörter zum Spielen vorhanden! Bitte wähle in den Einstellungen Kategorien aus oder füge eigene Wörter hinzu.");
        return;
    }

    let playerArray = playerNames.map((name, i) => ({
      id: i + 1, name, role: 'citizen',
      avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=${encodeURIComponent(name)}`
    }));

    const tempShuffled = shuffleArray([...playerArray]);
    for (let i = 0; i < numImposters; i++) {
        if(tempShuffled[i]) tempShuffled[i].role = 'imposter';
    }

    setPlayers(tempShuffled.sort((a, b) => a.id - b.id));
    setRevealOrder(shuffleArray([...tempShuffled]));
    setSecretWord(getRandomElement(wordPool));
    setGameState('reveal');
  };

  const resetGame = () => {
    setPlayers([]);
    setRevealOrder([]);
    setStartingPlayer(null);
    setSecretWord('');
    setVotes({});
    setGameState('welcome');
  };

  const renderScreen = () => {
    switch (gameState) {
      case 'settings': return <SettingsScreen initialSettings={settings} onSave={handleSaveSettings} />;
      case 'reveal': return <RevealScreen players={revealOrder} secretWord={secretWord} onRevealComplete={() => {
          setStartingPlayer(getRandomElement(players));
          setGameState('discussionStart');
      }} />;
      case 'discussionStart': return <DiscussionStartScreen startingPlayer={startingPlayer} onStartVoting={() => setGameState('voting')} />;
      case 'voting': return <VotingScreen players={players} onVoteComplete={(finalVotes) => {
          setVotes(finalVotes);
          setGameState('result');
      }} />;
      case 'result': return <ResultScreen players={players} votes={votes} onPlayAgain={resetGame} />;
      default: return <WelcomeScreen onStart={handleStartGame} onGoToSettings={() => setGameState('settings')} />;
    }
  };

  return (
    <div style={styles.safeArea}>
      <div style={styles.container}>
        {renderScreen()}
      </div>
    </div>
  );
}
