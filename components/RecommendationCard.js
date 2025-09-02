    'use client';

    import { useState } from 'react';
    import VibeTag from './VibeTag';

    export default function RecommendationCard({ rec, onSave }) {
      const [expanded, setExpanded] = useState(false);

      return (
        <div className="surface rounded-lg shadow-card p-4 mb-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <h3 className="heading">{rec.title}</h3>
          <p>{rec.description}</p>
          {expanded && (
            <>
              <video src={rec.video_url} controls className="w-full mt-2" />
              <div className="flex flex-wrap mt-2">
                {rec.vibe_tags.map((tag) => (
                  <VibeTag key={tag} tag={tag} />
                ))}
              </div>
              <button onClick={() => onSave(rec.recommendationId)} className="bg-primary text-white px-4 py-2 rounded-md mt-2">
                Save
              </button>
            </>
          )}
        </div>
      );
    }
  