import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, onChange, size = 6, readOnly = false }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange && onChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={`h-${size} w-${size} ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            fill={star <= rating ? 'currentColor' : 'none'}
          />
        </button>
      ))}
      {rating > 0 && (
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating; 