import React, { useState, useEffect } from 'react';

const CLASS_TYPES = ['WYK', 'LAB', 'CWI', 'PRO', 'ZIN'];
const DEFAULT_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function BlockForm({ initialData, onSave, onClose, onDelete, onDuplicate }) {
  const [formData, setFormData] = useState({
    subject: '',
    type: 'WYK',
    group: '',
    room: '',
    durationMins: 90, // Default 1.5h
    color: DEFAULT_COLORS[0],
    ...initialData
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'durationMins' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject) {
      alert("Nazwa przedmiotu jest wymagana.");
      return;
    }
    onSave({
      ...formData,
      id: formData.id || Date.now().toString(),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialData?.id ? 'Edytuj Zajęcia' : 'Dodaj Zajęcia'}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Przedmiot (np. EADSP)</label>
            <input 
              type="text" 
              name="subject" 
              value={formData.subject} 
              onChange={handleChange} 
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label>Rodzaj Zajęć</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              {CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <label>Grupa Studencka (np. 101)</label>
            <input 
              type="text" 
              name="group" 
              value={formData.group} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="form-group">
            <label>Numer Sali (np. 123)</label>
            <input 
              type="text" 
              name="room" 
              value={formData.room} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="form-group">
            <label>Czas trwania (minuty)</label>
            <input 
              type="number" 
              name="durationMins" 
              value={formData.durationMins} 
              onChange={handleChange} 
              step="45"
              min="45"
            />
          </div>
          
          <div className="form-group">
            <label>Kolor klocka</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {DEFAULT_COLORS.map(c => (
                <div 
                  key={c}
                  style={{
                    width: '24px', height: '24px', borderRadius: '4px', background: c, cursor: 'pointer',
                    border: formData.color === c ? '2px solid white' : 'none'
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, color: c }))}
                />
              ))}
            </div>
            <input 
              type="color" 
              name="color" 
              value={formData.color} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="modal-actions">
            {initialData?.id && (
              <div style={{ display: 'flex', gap: '0.5rem', marginRight: 'auto' }}>
                <button type="button" className="btn btn-danger" onClick={() => onDelete(formData.id)}>
                  Usuń
                </button>
                <button type="button" className="btn" onClick={() => onDuplicate(formData)} title="Tworzy kopię w puli nieprzypisanych">
                  Duplikuj
                </button>
              </div>
            )}
            <button type="button" className="btn" onClick={onClose}>Anuluj</button>
            <button type="submit" className="btn btn-primary">Zapisz</button>
          </div>
        </form>
      </div>
    </div>
  );
}
