import React, { useState } from 'react';
import ClassBlock from './ClassBlock';

const DAYS = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 to 20. Last hour block is 20:00 to 21:00

export const timeToRow = (timeStr) => {
  if (!timeStr) return 1;
  const [h, m] = timeStr.split(':').map(Number);
  return (h - 8) * 4 + Math.floor(m / 15) + 1;
};

export const rowToTime = (row) => {
  const totalMins = (row - 1) * 15;
  const h = Math.floor(totalMins / 60) + 8;
  const m = totalMins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const calculateSpan = (durationMins) => {
  if (!durationMins || durationMins <= 0) return 1;
  const breaksCount = Math.max(0, Math.ceil(durationMins / 45) - 1);
  const breaksMins = breaksCount * 15;
  const totalMins = durationMins + breaksMins;
  return Math.max(1, Math.round(totalMins / 15));
};

export default function ScheduleGrid({ blocks, onBlockDrop, onBlockDoubleClick, onDragStart, onDragEnd, draggedBlock }) {
  const [dragOverDay, setDragOverDay] = useState(null);
  const [dragPreview, setDragPreview] = useState(null);
  const [hoveredBlockId, setHoveredBlockId] = useState(null);

  const hoveredBlock = hoveredBlockId ? blocks.find(b => b.id === hoveredBlockId) : null;
  const hoveredRowStart = hoveredBlock ? timeToRow(hoveredBlock.startTime) : null;
  const hoveredSpan = hoveredBlock ? calculateSpan(hoveredBlock.durationMins) : null;

  const handleDragOver = (e, day) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDay !== day) setDragOverDay(day);

    if (draggedBlock) {
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const hourHeight = 80; 
      let hourIndex = Math.floor(y / hourHeight);
      hourIndex = Math.max(0, Math.min(12, hourIndex));
      
      const h = 8 + hourIndex;
      const startTime = `${h.toString().padStart(2, '0')}:15`;
      
      if (!dragPreview || dragPreview.day !== day || dragPreview.startTime !== startTime) {
        setDragPreview({ day, startTime });
      }
    }
  };

  const handleDragLeave = (e) => {
    setDragOverDay(null);
    setDragPreview(null);
  };

  const handleDrop = (e, day) => {
    e.preventDefault();
    setDragOverDay(null);
    const blockId = e.dataTransfer.getData('text/plain');
    if (!blockId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hourHeight = 80; // 4 slots of 20px
    let hourIndex = Math.floor(y / hourHeight);
    
    // clamp hourIndex between 0 and 12 (8:15 to 20:15)
    hourIndex = Math.max(0, Math.min(12, hourIndex));
    
    const h = 8 + hourIndex;
    const startTime = `${h.toString().padStart(2, '0')}:15`;
    setDragPreview(null);
    onBlockDrop(blockId, day, startTime);
  };

  const blocksByDay = DAYS.reduce((acc, day) => {
    acc[day] = blocks.filter(b => b.day === day);
    return acc;
  }, {});

  return (
    <div className="schedule-container">
      <div className="schedule-grid">
        <div className="grid-header-corner"></div>
        {DAYS.map((day, index) => (
          <div key={`header-${day}`} className={`grid-header-day ${index % 2 !== 0 ? 'alt-bg' : ''}`}>{day}</div>
        ))}

        <div className="grid-time-column" style={{ gridRow: 2, gridColumn: 1 }}>
          {HOURS.map(hour => (
            <div key={`time-${hour}`} className="time-label">
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {DAYS.map((day, index) => (
          <div 
            key={`col-${day}`} 
            className={`grid-day-column ${index % 2 !== 0 ? 'alt-bg' : ''} ${dragOverDay === day ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, day)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, day)}
            style={{ display: 'grid', gridTemplateRows: 'repeat(52, var(--grid-cell-height))', position: 'relative', gridRow: 2, gridColumn: index + 2 }}
          >
            {blocksByDay[day].map(block => {
               const rowStart = timeToRow(block.startTime);
               const span = calculateSpan(block.durationMins);
               const isBeingDragged = draggedBlock && draggedBlock.id === block.id;

               return (
                 <div 
                    key={block.id} 
                    onMouseEnter={() => { if (!draggedBlock) setHoveredBlockId(block.id); }}
                    onMouseLeave={() => setHoveredBlockId(null)}
                    style={{ 
                      gridRow: `${rowStart} / span ${span}`, 
                      padding: '2px',
                      zIndex: 2,
                      height: '100%',
                      ...(isBeingDragged ? {
                         opacity: 0,
                         pointerEvents: 'none'
                      } : {})
                    }}
                 >
                    <ClassBlock 
                      block={block} 
                      onDoubleClick={onBlockDoubleClick} 
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                      isUnscheduled={false}
                    />
                 </div>
               )
            })}
            

            
            {/* Ghost Preview Block */}
            {dragPreview && dragPreview.day === day && draggedBlock && (
              <div 
                style={{ 
                  gridRow: `${timeToRow(dragPreview.startTime)} / span ${calculateSpan(draggedBlock.durationMins)}`, 
                  gridColumn: '1 / -1',
                  padding: '2px',
                  zIndex: 1,
                  height: '100%',
                  opacity: 0.5,
                  pointerEvents: 'none'
                }}
              >
                <div style={{
                  backgroundColor: draggedBlock.color,
                  width: '100%',
                  height: '100%',
                  borderRadius: '0.5rem',
                  border: '2px dashed white'
                }} />
              </div>
            )}
          </div>
        ))}
        
        {/* Full-width Row Highlight Overlay */}
        <div 
          style={{
            gridColumn: '1 / -1',
            gridRow: '2 / 3',
            display: 'grid',
            gridTemplateRows: 'repeat(52, var(--grid-cell-height))',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          <div 
            style={{
              gridRow: hoveredBlock ? `${hoveredRowStart} / span ${hoveredSpan}` : '1 / span 1',
              gridColumn: '1 / -1',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(255, 255, 255, 0.3)',
              opacity: hoveredBlock ? 1 : 0,
              transition: 'opacity 0.1s ease-in-out',
              width: '100%',
              height: '100%'
            }}
          />
        </div>
      </div>
    </div>
  );
}
