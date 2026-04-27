import React from 'react';

export default function ClassBlock({ block, onDoubleClick, onDragStart, onDragEnd, isUnscheduled }) {
  const { subject, type, group, room, color, durationMins, sourceAuthor } = block;
  
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', block.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Hide default drag image
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; // Transparent 1x1 gif
    e.dataTransfer.setDragImage(img, 0, 0);

    if (onDragStart) {
      setTimeout(() => {
        onDragStart(e, block);
      }, 0);
    }
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) onDragEnd(e, block);
  };

  // If unscheduled, style it normally (auto height)
  // If scheduled, it will be styled by parent grid layout (gridRow spanning)
  const style = {
    backgroundColor: color,
    height: isUnscheduled ? 'auto' : '100%',
    position: 'relative'
  };

  const isSmall = durationMins <= 45;
  const className = `class-block ${isUnscheduled ? 'unscheduled-block' : ''} ${isSmall && !isUnscheduled ? 'small-block' : ''}`;

  return (
    <div 
      className={className}
      style={style}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDoubleClick={() => onDoubleClick(block)}
      title="Kliknij dwukrotnie, aby edytować"
    >
      {sourceAuthor && <div className="source-badge" title={`Pochodzi od: ${sourceAuthor}`}>od: {sourceAuthor}</div>}
      <div className="block-title">{subject} ({type})</div>
      <div className="block-details">
        {group && <div>Gr: {group}</div>}
        {room && <div>Sala: {room}</div>}
        <div>{durationMins} min</div>
      </div>
    </div>
  );
}
