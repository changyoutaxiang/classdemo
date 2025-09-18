import React from 'react';

interface HighlightTextProps {
  text: string;
  highlight: string;
  className?: string;
}

const HighlightText: React.FC<HighlightTextProps> = ({ text, highlight, className }) => {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 rounded px-1">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

export default HighlightText;