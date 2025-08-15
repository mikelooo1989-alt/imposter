import React, { useState, useCallback, useEffect } from 'react';

// --- Konfiguration & Daten ---
// Die Wörter werden jetzt aus public/word-categories.json geladen
const STORAGE_KEY = 'imposterGameSettings_v5'; // Version erhöht

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

const CATEGORY_ICONS = {
  'Rund um die Welt': '🌍',
  'Unterhaltung': '�',
  'Alltag': '🛒',
  'Tier & Natur': '🌳',
  'Sport & Freizeit': '⚽',
  'Wissen & Schule': '🎓',
  'Feste & Feiern': '🎉',
  'Deutsche Begriffe': '🥨',
  'Stars & Promis': '⭐',
  'Spicy': '🌶️',
  'Eigene Begriffe': '✏️'
};


// --- Styling-Objekt ---
const styles = {
  safeArea: { flex: 1, backgroundColor: '#111827', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', height: '100vh' /* overflowY wird jetzt dynamisch gesetzt */ },
  container: { flex: 1, padding: 20, display: 'flex', flexDirection: 'column', position: 'relative' },
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
  // Header Buttons
  headerContainer: { position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
  headerButton: { backgroundColor: 'transparent', color: '#9ca3af', border: 'none', fontSize: '2rem', cursor: 'pointer', width: '44px', height: '44px' },
  // Reveal Screen Styles
  revealWrapper: { width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  revealCard: { backgroundColor: '#1f2937', padding: '40px', borderRadius: '20px', height: '350px', justifyContent: 'center', alignItems: 'center', width: '100%', border: '1px solid #374151', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' },
  avatarImage: { width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', marginBottom: '20px', border: '3px solid #3b82f6', backgroundColor: 'white' },
  revealText: { fontSize: '1.75rem', fontWeight: 'bold', color: '#f9fafb', textAlign: 'center' },
  imposterText: { fontSize: '2rem', fontWeight: 'bold', color: '#ef4444', textAlign: 'center' },
  revealSubtext: { fontSize: '1rem', color: '#9ca3af', marginTop: '16px', textAlign: 'center' },
  // Voting Screen Styles
  votingRow: { width: '100%', maxWidth: '500px', padding: '16px 0', borderBottom: '1px solid #374151' },
  votingPlayerText: { color: '#f9fafb', fontSize: '18px', marginBottom: '12px' },
  voteButtonsContainer: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  voteButton: { backgroundColor: '#4b5563', minWidth: '50px', height: '50px', borderRadius: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '8px', padding: '0 15px', border: 'none', cursor: 'pointer', color: '#ffffff', fontSize: '16px', fontWeight: 'bold' },
  voteButtonSelected: { backgroundColor: '#3b82f6', transform: 'scale(1.1)' },
  // Result Screen Styles
  resultDetails: { backgroundColor: '#1f2937', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '500px', marginTop: '20px' },
  resultHeader: { color: '#f9fafb', fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', textAlign: 'center' },
  resultPlayerRow: { display: 'flex', alignItems: 'center', margin: '8px 0' },
  resultAvatar: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginRight: '15px', backgroundColor: 'white' },
  resultPlayerText: { color: '#d1d5db', fontSize: '18px', padding: '4px 0' },
  imposterTextSmall: { color: '#ef4444', fontWeight: 'bold' },
  citizenTextSmall: { color: '#22c55e', fontWeight: 'bold' },
  // Settings Screen Styles
  settingsSection: { width: '90%', maxWidth: '400px', marginBottom: '30px' },
  checkboxContainer: { display: 'flex', alignItems: 'center', marginBottom: '10px' },
  checkbox: { marginRight: '10px', width: '20px', height: '20px', cursor: 'pointer' },
  customWordInputContainer: { display: 'flex', gap: '10px' },
  customWordList: { listStyle: 'none', padding: 0, marginTop: '15px' },
  customWordItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#374151', padding: '8px 12px', borderRadius: '8px', marginBottom: '8px', color: '#f9fafb' },
  deleteButton: { backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 'bold' },
  numberStepper: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#374151', borderRadius: '12px', padding: '8px' },
  stepperButton: { backgroundColor: '#4b5563', color: 'white', border: 'none', borderRadius: '8px', width: '40px', height: '40px', fontSize: '24px', cursor: 'pointer' },
  stepperValue: { color: '#f9fafb', fontSize: '20px', fontWeight: 'bold', margin: '0 20px' },
  // Help Screen
  helpContent: { color: '#d1d5db', maxWidth: '600px', textAlign: 'left', lineHeight: '1.6' },
  helpContentH3: { color: '#f9fafb', fontSize: '1.5rem', marginTop: '20px' },
  // Modal Dialog
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalBox: { backgroundColor: '#1f2937', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px', textAlign: 'center' },
  modalText: { color: '#f9fafb', fontSize: '1.2rem', marginBottom: '20px' },
  modalActions: { display: 'flex', justifyContent: 'space-around' },
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

const NumberStepper = ({ value, onChange, min, max }) => {
    const handleDecrement = () => {
        const newValue = Math.max(min, value - 1);
        onChange(newValue);
    };
    const handleIncrement = () => {
        const newValue = Math.min(max, value + 1);
        onChange(newValue);
    };
    return (
        <div style={styles.numberStepper}>
            <button onClick={handleDecrement} style={styles.stepperButton}>-</button>
            <span style={styles.stepperValue}>{value}</span>
            <button onClick={handleIncrement} style={styles.stepperButton}>+</button>
        </div>
    );
};

const ConfirmationDialog = ({ message, onConfirm, onCancel }) => (
    <div style={styles.modalOverlay}>
        <div style={styles.modalBox}>
            <p style={styles.modalText}>{message}</p>
            <div style={styles.modalActions}>
                <GameButton title="Ja, abbrechen" onClick={onConfirm} style={{backgroundColor: '#ef4444'}} />
                <GameButton title="Weiterspielen" onClick={onCancel} secondary />
            </div>
        </div>
    </div>
);


// --- Bildschirme der App ---

const WelcomeScreen = ({ onStart, onGoToSettings, onGoToHelp }) => (
  <>
    <div style={styles.headerContainer}>
        <div /> {/* Leeres div für korrekte Ausrichtung */}
        <button onClick={onGoToHelp} style={styles.headerButton}>?</button>
    </div>
    <div style={styles.screenContainer}>
        <p style={styles.title}>Imposter</p>
        <p style={styles.subtitle}>Das Spiel um Täuschung und Wahrheit</p>
        <GameButton title="Spiel starten" onClick={onStart} />
        <GameButton title="Einstellungen" onClick={onGoToSettings} secondary />
    </div>
  </>
);

const HelpScreen = ({ onBack }) => (
    <>
        <div style={styles.headerContainer}>
            <button onClick={onBack} style={styles.headerButton}>←</button>
        </div>
        <div style={styles.scrollableScreenContainer}>
            <p style={styles.title}>Spielanleitung</p>
            <div style={styles.helpContent}>
                <h3 style={styles.helpContentH3}>Ziel des Spiels</h3>
                <p>Die <strong>Bürger</strong> müssen durch kluge Hinweise und Diskussionen den oder die <strong>Imposter</strong> entlarven. Die <strong>Imposter</strong> müssen unentdeckt bleiben, indem sie so tun, als wüssten sie das geheime Wort und am Ende versuchen, es zu erraten.</p>
                
                <h3 style={styles.helpContentH3}>Vorbereitung</h3>
                <p>Legt in den <strong>Einstellungen</strong> die Anzahl der Spieler und Imposter fest, vergebt Namen und wählt die Wort-Kategorien aus, mit denen ihr spielen wollt.</p>

                <h3 style={styles.helpContentH3}>Spielablauf</h3>
                <ol>
                    <li><strong>Rollen aufdecken:</strong> Jeder Spieler sieht geheim seine Rolle. Die Bürger sehen das geheime Wort, die Imposter nicht.</li>
                    <li><strong>Hinweise geben:</strong> Ein zufälliger Spieler beginnt. Reihum muss jeder ein Wort nennen, das zum geheimen Wort passt. Der Imposter muss bluffen und ein glaubwürdiges Wort erfinden.</li>
                    <li><strong>Diskussion & Abstimmung:</strong> Nachdem alle einen Hinweis gegeben haben, wird diskutiert und abgestimmt, wer der Imposter sein könnte.</li>
                    <li><strong>Auflösung:</strong> Der Spieler mit den meisten Stimmen wird aufgedeckt.</li>
                </ol>

                <h3 style={styles.helpContentH3}>Wer gewinnt?</h3>
                <p>Die <strong>Bürger</strong> gewinnen, wenn sie einen Imposter aus der Runde wählen. Die <strong>Imposter</strong> gewinnen, wenn ein Bürger rausgewählt wird.</p>
            </div>
        </div>
    </>
);

const SettingsScreen = ({ initialSettings, onSave, wordCategories }) => {
    const [settings, setSettings] = useState(initialSettings);
    const [newWord, setNewWord] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const numPlayers = parseInt(settings.numPlayers, 10) || 0;
        const currentNames = settings.playerNames || [];
        if (currentNames.length !== numPlayers) {
            const newNames = Array.from({ length: numPlayers }, (_, i) => currentNames[i] || '');
            setSettings(s => ({ ...s, playerNames: newNames }));
        }
    }, [settings.numPlayers, settings.playerNames]);

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
        setError('');
        if (settings.selectedCategories.length === 0) {
            setError('Bitte wähle mindestens eine Wort-Kategorie aus.');
            return;
        }
        if (settings.selectedCategories.includes('Eigene Begriffe') && settings.customWords.length === 0) {
            setError('Wenn "Eigene Begriffe" gewählt ist, füge bitte mindestens ein Wort hinzu.');
            return;
        }
        onSave(settings);
    };

    return (
        <>
            <div style={styles.headerContainer}>
                <button onClick={handleSave} style={styles.headerButton}>←</button>
            </div>
            <div style={styles.scrollableScreenContainer}>
                <p style={styles.title}>Einstellungen</p>
                
                <div style={styles.settingsSection}>
                    <p style={styles.subtitle}>Allgemein</p>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Anzahl der Spieler:</label>
                        <NumberStepper value={settings.numPlayers} onChange={(val) => setSettings(s => ({...s, numPlayers: val}))} min={3} max={12} />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Anzahl der Imposter:</label>
                        <NumberStepper value={settings.numImposters} onChange={(val) => setSettings(s => ({...s, numImposters: val}))} min={1} max={settings.numPlayers - 1} />
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
                    {Object.keys(wordCategories).map(category => (
                        <div key={category} style={styles.checkboxContainer}>
                            <input type="checkbox" id={category} checked={settings.selectedCategories.includes(category)} onChange={() => handleCategoryToggle(category)} style={styles.checkbox} />
                            <label htmlFor={category} style={{color: 'white', cursor: 'pointer'}}>{CATEGORY_ICONS[category] || '📁'} {category}</label>
                        </div>
                    ))}
                </div>
                
                {settings.selectedCategories.includes('Eigene Begriffe') && (
                    <div style={styles.settingsSection}>
                        <p style={styles.subtitle}>Eigene Begriffe verwalten</p>
                        <div style={styles.customWordInputContainer}>
                            <GameInput value={newWord} onChange={(e) => setNewWord(e.target.value)} placeholder="Neuer Begriff..." />
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
            </div>
        </>
    );
};

const RevealScreen = ({ players, secretWord, onRevealComplete, onRequestExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleNext = () => {
    if (isRevealed) {
        if (currentIndex < players.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsRevealed(false);
        } else {
            onRevealComplete();
        }
    } else {
        setIsRevealed(true);
    }
  };

  const currentPlayer = players[currentIndex];
  const buttonText = isRevealed ? 'Verstanden & Weitergeben' : 'Rolle aufdecken';
  
  return (
    <>
        <div style={styles.headerContainer}>
            <div/>
            <button onClick={onRequestExit} style={styles.headerButton}>×</button>
        </div>
        <div style={styles.screenContainer}>
            <div style={styles.revealWrapper}>
                <div style={styles.revealCard}>
                    {isRevealed ? (
                        <div>
                            <p style={currentPlayer.role === 'imposter' ? styles.imposterText : styles.revealText}>
                                {currentPlayer.role === 'imposter' ? 'Du bist der Imposter!' : `Das Wort ist: ${secretWord}`}
                            </p>
                        </div>
                    ) : (
                        <>
                            <img src={currentPlayer.avatarUrl} alt={`Avatar für ${currentPlayer.name}`} style={styles.avatarImage} />
                            <p style={styles.revealText}>{currentPlayer.name} ist dran</p>
                            <p style={styles.revealSubtext}>Bist du bereit?</p>
                        </>
                    )}
                </div>
                <GameButton title={buttonText} onClick={handleNext} />
            </div>
        </div>
    </>
  );
};

const DiscussionStartScreen = ({ startingPlayer, onStartVoting, onRequestExit }) => (
    <>
        <div style={styles.headerContainer}>
            <div/>
            <button onClick={onRequestExit} style={styles.headerButton}>×</button>
        </div>
        <div style={styles.screenContainer}>
            <p style={styles.title}>Diskussionsrunde</p>
            <div style={styles.revealCard}>
                <p style={styles.revealText}><span style={{color: '#3b82f6', fontWeight: 'bold'}}>{startingPlayer.name}</span> beginnt die Runde!</p>
                <p style={styles.revealSubtext}>Gebt nun reihum einen Hinweis zum geheimen Wort.</p>
            </div>
            <GameButton title="Zur Abstimmung" onClick={onStartVoting} />
        </div>
    </>
);

const VotingScreen = ({ players, onVoteComplete, onRequestExit }) => {
  const [votes, setVotes] = useState({});
  const handleVote = (voterId, votedForId) => setVotes(prev => ({ ...prev, [voterId]: votedForId }));

  return (
    <>
        <div style={styles.headerContainer}>
            <div/>
            <button onClick={onRequestExit} style={styles.headerButton}>×</button>
        </div>
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
    </>
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
  const [wordCategories, setWordCategories] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [settings, setSettings] = useState({
      numPlayers: 4,
      numImposters: 1,
      playerNames: Array.from({ length: 4 }, (_, i) => ''),
      selectedCategories: ['Alltag'],
      customWords: [],
  });
  const [secretWord, setSecretWord] = useState('');
  const [votes, setVotes] = useState({});

  useEffect(() => {
    // Verhindert "Pull-to-refresh" auf mobilen Geräten
    document.body.style.overscrollBehaviorY = 'contain';

    fetch('/word-categories.json')
      .then(response => response.json())
      .then(data => setWordCategories(data))
      .catch(error => console.error("Konnte Wortkategorien nicht laden:", error));

    try {
        const savedSettings = localStorage.getItem(STORAGE_KEY);
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            if (!parsed.selectedCategories || !parsed.customWords) {
                parsed.selectedCategories = ['Alltag'];
                parsed.customWords = [];
            }
            setSettings(parsed);
        }
    } catch (error) { console.error("Konnte Einstellungen nicht laden:", error); }
    
    // Cleanup-Funktion, um den Style wieder zu entfernen
    return () => {
        document.body.style.overscrollBehaviorY = 'auto';
    };
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
        if (category === 'Eigene Begriffe') {
            wordPool.push(...customWords);
        } else {
            wordPool.push(...(wordCategories[category] || []));
        }
    });

    if (wordPool.length === 0) {
        alert("Keine Wörter zum Spielen vorhanden! Bitte wähle in den Einstellungen Kategorien aus oder füge eigene Begriffe hinzu.");
        return;
    }
    
    const finalPlayerNames = playerNames.map((name, i) => name.trim() === '' ? `Spieler ${i + 1}` : name.trim());

    let playerArray = finalPlayerNames.map((name, i) => ({
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
    setShowExitConfirm(false);
    setGameState('welcome');
  };

  // --- RENDER LOGIK ---
  if (!wordCategories) {
      return <div style={{...styles.screenContainer, color: 'white'}}>Lade Spiel...</div>;
  }

  const nonScrollableStates = ['welcome', 'reveal', 'discussionStart'];
  const safeAreaStyle = {
    ...styles.safeArea,
    overflowY: nonScrollableStates.includes(gameState) ? 'hidden' : 'auto',
  };

  const screenContent = () => {
      switch (gameState) {
          case 'settings': return <SettingsScreen initialSettings={settings} onSave={handleSaveSettings} wordCategories={wordCategories} />;
          case 'help': return <HelpScreen onBack={() => setGameState('welcome')} />;
          case 'reveal': return <RevealScreen players={revealOrder} secretWord={secretWord} onRequestExit={() => setShowExitConfirm(true)} onRevealComplete={() => {
              setStartingPlayer(getRandomElement(players));
              setGameState('discussionStart');
          }} />;
          case 'discussionStart': return <DiscussionStartScreen startingPlayer={startingPlayer} onRequestExit={() => setShowExitConfirm(true)} onStartVoting={() => setGameState('voting')} />;
          case 'voting': return <VotingScreen players={players} onRequestExit={() => setShowExitConfirm(true)} onVoteComplete={(finalVotes) => {
              setVotes(finalVotes);
              setGameState('result');
          }} />;
          case 'result': return <ResultScreen players={players} votes={votes} onPlayAgain={resetGame} />;
          default: return <WelcomeScreen onStart={handleStartGame} onGoToSettings={() => setGameState('settings')} onGoToHelp={() => setGameState('help')} />;
      }
  };

  return (
    <div style={safeAreaStyle}>
      <div style={styles.container}>
          {screenContent()}
          {showExitConfirm && (
              <ConfirmationDialog 
                  message="Möchtest du das aktuelle Spiel wirklich abbrechen?"
                  onConfirm={resetGame}
                  onCancel={() => setShowExitConfirm(false)}
              />
          )}
      </div>
    </div>
  );
}
