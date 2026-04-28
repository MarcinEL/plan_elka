import React from 'react';

export default function UserGuideModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h3>ℹ️ Instrukcja obsługi</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div style={{ lineHeight: '1.6', fontSize: '0.9rem' }}>
          <h4 style={{ color: 'var(--accent)', marginTop: '0.5rem' }}>1. Tworzenie i edycja zajęć</h4>
          <p>Kliknij przycisk <strong>+ Dodaj</strong>, aby utworzyć nowy blok zajęć. Możesz go również zduplikować lub usunąć. Podwójne kliknięcie na istniejący blok otwiera okno jego edycji.</p>
          
          <h4 style={{ color: 'var(--accent)', marginTop: '1rem' }}>2. Przeciąganie i upuszczanie (Drag & Drop)</h4>
          <p>Zajęcia domyślnie lądują w puli "Nieprzypisane Zajęcia" po lewej stronie. Przeciągnij je i upuść na siatkę planu, aby przypisać do konkretnego dnia i godziny. Możesz też przeciągnąć zajęcia z siatki z powrotem do puli po lewej.</p>

          <h4 style={{ color: 'var(--accent)', marginTop: '1rem' }}>3. Zapis w chmurze (Firebase)</h4>
          <p>Wpisz <strong>Autora</strong> oraz <strong>Nazwę Planu</strong> w górnym pasku. Kliknij <strong>Zapisz</strong>, aby wysłać plan do bazy danych. Inni użytkownicy będą mogli go wczytać, wybierając go z listy rozwijanej <strong>Wczytaj...</strong>.</p>

          <h4 style={{ color: 'var(--accent)', marginTop: '1rem' }}>4. Dołączanie (Merge)</h4>
          <p>Możesz połączyć swój plan z planem innego użytkownika! Wybierz plan z listy rozwijanej <strong>Dołącz z bazy...</strong> lub wczytaj plik z dysku klikając <strong>Dołącz (Merge)</strong>. Zaimportowane zajęcia zostaną dodane do puli, z zachowaniem informacji o oryginalnym autorze.</p>

          <h4 style={{ color: 'var(--accent)', marginTop: '1rem' }}>5. Eksport i PDF</h4>
          <p>Użyj opcji <strong>Eksport (JSON)</strong>, aby pobrać kopię zapasową na dysk, lub <strong>PDF / Drukuj</strong>, aby wygenerować wersję do druku. Przycisk <strong>HTML</strong> zapisuje interaktywny widok strony.</p>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>Zrozumiałem</button>
        </div>
      </div>
    </div>
  );
}
