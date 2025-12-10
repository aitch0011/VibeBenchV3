
import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { Button } from './Button';

interface Props {
  rank: number;
  score: number;
}

export const Share: React.FC<Props> = ({ rank, score }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = `I just hit Rank #${rank} on VibeBench with a rating of ${score}. The AI didn't carry me—I flew it. Can you beat my baseline? ${window.location.origin}`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Button 
      onClick={handleShare} 
      variant="secondary" 
      className={`w-full font-mono text-xs uppercase tracking-widest transition-all duration-300 ${copied ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' : ''}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Copied to Clipboard
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" />
          Broadcast Result
        </>
      )}
    </Button>
  );
};
