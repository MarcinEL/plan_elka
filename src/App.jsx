import React, { useState, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import ScheduleGrid from './components/ScheduleGrid';
import BlockForm from './components/BlockForm';
import ClassBlock from './components/ClassBlock';
import { db } from './firebase';
import { ref, set, get, onValue, remove } from 'firebase/database';

function App() {
  const [blocks, setBlocks] = useState([]);
  const [semester, setSemester] = useState('Letni');
  const [author, setAuthor] = useState('');
  const [scheduleName, setScheduleName] = useState('Nowy Plan');
  const [savedSchedulesList, setSavedSchedulesList] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [draggedBlock, setDraggedBlock] = useState(null);

  // Load schedules list from Firebase in real-time
  useEffect(() => {
    const schedulesRef = ref(db, 'schedules');
    const unsubscribe = onValue(schedulesRef, (snapshot) => {
      if (snapshot.exists()) {
        setSavedSchedulesList(Object.keys(snapshot.val()));
      } else {
        setSavedSchedulesList([]);
      }
    }, (error) => {
      console.error("Firebase read error:", error);
    });

    return () => unsubscribe();
  }, []);

  // Load from local storage (autosave) on mount
  useEffect(() => {
    const saved = localStorage.getItem('current_schedule');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.blocks) setBlocks(parsed.blocks);
        if (parsed.semester) setSemester(parsed.semester);
        if (parsed.author) setAuthor(parsed.author);
        if (parsed.scheduleName) setScheduleName(parsed.scheduleName);
      } catch (e) {
        console.error("Failed to parse schedule", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('current_schedule', JSON.stringify({ blocks, semester, author, scheduleName }));
  }, [blocks, semester, author, scheduleName]);

  const handleAddClick = () => {
    setEditingBlock(null);
    setIsFormOpen(true);
  };

  const handleSaveBlock = (blockData) => {
    setBlocks(prev => {
      const exists = prev.find(b => b.id === blockData.id);
      if (exists) {
        return prev.map(b => b.id === blockData.id ? { ...b, ...blockData } : b);
      }
      return [...prev, blockData];
    });
    setIsFormOpen(false);
  };

  const handleDeleteBlock = (id) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    setIsFormOpen(false);
  };

  const handleDuplicateBlock = (blockData) => {
    const newBlock = {
      ...blockData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      day: null,
      startTime: null
    };
    setBlocks(prev => [...prev, newBlock]);
    setIsFormOpen(false);
  };

  const handleBlockDoubleClick = (block) => {
    setEditingBlock(block);
    setIsFormOpen(true);
  };

  const handleDragStart = (e, block) => {
    setDraggedBlock(block);
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
  };

  const handleBlockDropOnGrid = (id, day, startTime) => {
    setBlocks(prev => prev.map(b => 
      b.id === id ? { ...b, day, startTime } : b
    ));
    setDraggedBlock(null);
  };

  const handlePoolDrop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    setBlocks(prev => prev.map(b => 
      b.id === id ? { ...b, day: null, startTime: null } : b
    ));
  };

  const handlePoolDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Export / Import
  const getSemesterSuffix = () => semester === 'Letni' ? 'L' : 'Z';

  const handleExport = () => {
    const data = JSON.stringify({ blocks, semester, author, scheduleName }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan_${author || 'anon'}_${scheduleName || 'export'}_${getSemesterSuffix()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (data) => {
    if (data && Array.isArray(data.blocks)) {
      setBlocks(data.blocks);
      if (data.semester) setSemester(data.semester);
      if (data.author) setAuthor(data.author);
      if (data.scheduleName) setScheduleName(data.scheduleName);
    }
  };

  const handleMerge = (data) => {
    if (data && Array.isArray(data.blocks)) {
      const source = data.author || 'Inny';
      const mergedBlocks = data.blocks.map(b => ({
        ...b,
        id: b.id + '_merged_' + Date.now() + Math.random(),
        sourceAuthor: source
      }));
      setBlocks(prev => [...prev, ...mergedBlocks]);
      alert(`Dołączono pomyślnie ${mergedBlocks.length} zajęć od: ${source}`);
    }
  };

  const handleMergeFromDB = (key) => {
    const scheduleRef = ref(db, 'schedules/' + key);
    get(scheduleRef).then((snapshot) => {
      if (snapshot.exists()) {
        const selected = snapshot.val();
        handleMerge(selected);
      } else {
        alert("Ten plan już nie istnieje w bazie.");
      }
    }).catch(error => {
      alert("Błąd odczytu dołączenia: " + error.message);
    });
  };

  const handleNewPlan = () => {
    if (blocks.length > 0) {
      if (!window.confirm("Czy na pewno chcesz utworzyć nowy plan? Niezapisane zmiany na obecnym planie zostaną utracone.")) {
        return;
      }
    }
    setBlocks([]);
    setScheduleName("Nowy Plan");
  };

  const handleExportHTML = () => {
    const content = document.documentElement.outerHTML;
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan_${author || 'anon'}_${scheduleName || 'export'}_${getSemesterSuffix()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  // Named Saves (Cloud Database)
  const handleSave = () => {
    if (!author || !scheduleName) {
      alert("Proszę wpisać Autora oraz Nazwę Planu w górnym pasku przed zapisaniem.");
      return;
    }
    const safeKey = `${author} - ${scheduleName}`.replace(/[.#$[\]]/g, '');
    const scheduleRef = ref(db, 'schedules/' + safeKey);
    set(scheduleRef, {
      blocks, semester, author, scheduleName
    }).then(() => {
      alert(`Zapisano plan jako "${safeKey}" w chmurze.`);
    }).catch(error => {
      alert("Błąd zapisywania. Upewnij się, że w Firebase aktywowałeś Realtime Database w trybie Test Mode.\n" + error.message);
    });
  };

  const handleDeletePlan = () => {
    if (!author || !scheduleName) {
      alert("Proszę wpisać Autora oraz Nazwę Planu, który chcesz usunąć.");
      return;
    }
    const safeKey = `${author} - ${scheduleName}`.replace(/[.#$[\]]/g, '');
    
    if (window.confirm(`Czy na pewno chcesz trwale usunąć plan "${safeKey}" z CHMURY?`)) {
      const scheduleRef = ref(db, 'schedules/' + safeKey);
      remove(scheduleRef).then(() => {
        alert(`Usunięto plan "${safeKey}".`);
      }).catch(error => {
        alert("Błąd usuwania: " + error.message);
      });
    }
  };

  const handleLoad = (key) => {
    const scheduleRef = ref(db, 'schedules/' + key);
    get(scheduleRef).then((snapshot) => {
      if (snapshot.exists()) {
        const selected = snapshot.val();
        setBlocks(selected.blocks || []);
        setSemester(selected.semester || 'Letni');
        setAuthor(selected.author || '');
        setScheduleName(selected.scheduleName || 'Wczytany Plan');
      } else {
        alert("Ten plan już nie istnieje w bazie.");
      }
    }).catch(error => {
      alert("Błąd odczytu: " + error.message);
    });
  };

  const scheduledBlocks = blocks.filter(b => b.day && b.startTime);
  const unscheduledBlocks = blocks.filter(b => !b.day || !b.startTime);

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2>Nieprzypisane Zajęcia</h2>
        <div 
          className="unscheduled-pool"
          onDrop={handlePoolDrop}
          onDragOver={handlePoolDragOver}
        >
          {unscheduledBlocks.length === 0 && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>
              Brak zajęć. Kliknij "+ Dodaj Zajęcia" aby utworzyć nowe, lub przeciągnij klocek tutaj, aby usunąć z siatki.
            </div>
          )}
          {unscheduledBlocks.map(block => (
            <ClassBlock 
              key={block.id} 
              block={block} 
              onDoubleClick={handleBlockDoubleClick}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              isUnscheduled={true}
            />
          ))}
        </div>
      </div>

      <div className="main-content">
        <Toolbar 
          onAddClick={handleAddClick}
          onNewPlan={handleNewPlan}
          onSave={handleSave}
          onDeletePlan={handleDeletePlan}
          onLoad={handleLoad}
          onExport={handleExport}
          onImport={handleImport}
          onMerge={handleMerge}
          onMergeFromDB={handleMergeFromDB}
          onExportHTML={handleExportHTML}
          onPrintPDF={handlePrintPDF}
          semester={semester}
          setSemester={setSemester}
          author={author}
          setAuthor={setAuthor}
          scheduleName={scheduleName}
          setScheduleName={setScheduleName}
          savedSchedulesList={savedSchedulesList}
        />
        
        <ScheduleGrid 
          blocks={scheduledBlocks}
          onBlockDrop={handleBlockDropOnGrid}
          onBlockDoubleClick={handleBlockDoubleClick}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          draggedBlock={draggedBlock}
        />
      </div>

      {isFormOpen && (
        <BlockForm 
          initialData={editingBlock} 
          onSave={handleSaveBlock} 
          onClose={() => setIsFormOpen(false)} 
          onDelete={handleDeleteBlock}
          onDuplicate={handleDuplicateBlock}
        />
      )}
    </div>
  );
}

export default App;
