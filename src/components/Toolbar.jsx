import React, { useRef } from 'react';

export default function Toolbar({ 
  onAddClick, 
  onNewPlan,
  onSave, 
  onDeletePlan,
  onLoad, 
  onExport, 
  onImport, 
  onMerge,
  onMergeFromDB,
  onExportHTML,
  onPrintPDF,
  semester, 
  setSemester,
  author,
  setAuthor,
  scheduleName,
  setScheduleName,
  savedSchedulesList,
  onOpenGuide
}) {
  const fileInputRef = useRef(null);
  const mergeInputRef = useRef(null);

  const handleImportChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        onImport(data);
      } catch (err) {
        alert("Błąd podczas odczytu pliku JSON");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset
  };

  const handleMergeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        onMerge(data);
      } catch (err) {
        alert("Błąd podczas odczytu pliku JSON do połączenia");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset
  };

  return (
    <div className="toolbar" style={{ flexWrap: 'wrap', height: 'auto', padding: '1rem 2rem', gap: '1rem' }}>
      <div className="toolbar-group">
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginRight: '1rem', whiteSpace: 'nowrap' }}>Plan Zajęć</h1>
        
        <input 
          type="text" 
          placeholder="Autor (np. Kowalski)" 
          value={author} 
          onChange={(e) => setAuthor(e.target.value)}
          style={{ width: '160px' }}
        />
        <input 
          type="text" 
          placeholder="Nazwa Planu" 
          value={scheduleName} 
          onChange={(e) => setScheduleName(e.target.value)}
          style={{ width: '160px' }}
        />

        <select 
          value={semester} 
          onChange={(e) => setSemester(e.target.value)}
          style={{ width: '140px' }}
        >
          <option value="Letni">Sem. Letni</option>
          <option value="Zimowy">Sem. Zimowy</option>
        </select>
      </div>

      <div className="toolbar-group" style={{ flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={onAddClick}>+ Dodaj</button>
        <button className="btn" style={{ background: '#3b82f6', color: 'white', border: 'none' }} onClick={onOpenGuide} title="Instrukcja obsługi">ℹ️ Pomoc</button>
        
        <div style={{ width: '1px', height: '24px', background: 'var(--panel-border)', margin: '0 0.25rem' }}></div>
        
        <button className="btn" onClick={onNewPlan} title="Wyczyść i utwórz nowy plan">Nowy</button>
        <button className="btn" onClick={onSave} title="Zapisz w chmurze">Zapisz</button>
        <button className="btn btn-danger" onClick={onDeletePlan} title="Usuń obecny plan z chmury">Usuń</button>
        
        <select 
          onChange={(e) => { if(e.target.value) onLoad(e.target.value); e.target.value = ""; }}
          style={{ width: '140px' }}
          defaultValue=""
          title="Wczytaj plan z chmury"
        >
          <option value="" disabled>Wczytaj...</option>
          {savedSchedulesList.map(name => (
             <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <select 
          onChange={(e) => { if(e.target.value) onMergeFromDB(e.target.value); e.target.value = ""; }}
          style={{ width: '140px', border: '1px solid #8b5cf6' }}
          defaultValue=""
          title="Dołącz plan z chmury"
        >
          <option value="" disabled>Dołącz z bazy...</option>
          {savedSchedulesList.map(name => (
             <option key={name} value={name}>{name}</option>
          ))}
        </select>
        
        <div style={{ width: '1px', height: '24px', background: 'var(--panel-border)', margin: '0 0.5rem' }}></div>
        
        <button className="btn" onClick={onPrintPDF} title="Drukuj lub zapisz jako PDF">PDF / Drukuj</button>
        <button className="btn" onClick={onExportHTML} title="Zapisz do pliku HTML">HTML</button>
        <button className="btn" onClick={onExport} title="Eksportuj do JSON">Eksport (JSON)</button>
        
        <div style={{ width: '1px', height: '24px', background: 'var(--panel-border)', margin: '0 0.25rem' }}></div>
        
        <button className="btn" onClick={() => fileInputRef.current.click()} title="Nadpisz cały plan plikiem JSON">Import</button>
        <button className="btn btn-primary" onClick={() => mergeInputRef.current.click()} title="Dołącz zajęcia z pliku JSON do obecnego planu" style={{ background: '#8b5cf6' }}>Dołącz (Merge)</button>
        
        <input 
          type="file" 
          accept=".json" 
          style={{ display: 'none' }} 
          ref={fileInputRef}
          onChange={handleImportChange}
        />
        <input 
          type="file" 
          accept=".json" 
          style={{ display: 'none' }} 
          ref={mergeInputRef}
          onChange={handleMergeChange}
        />
      </div>
    </div>
  );
}
