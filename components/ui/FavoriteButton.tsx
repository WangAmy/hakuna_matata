'use client';

import { useState } from 'react';
import { trackEvent, getEventContext } from '@/lib/amplitude';
import { Button } from './button';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  hotelName: string;
  userId?: string;
}

export function FavoriteButton({ hotelName, userId }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);

  const handleClick = () => {
    setFavorited(!favorited);

    trackEvent('card_favorited', {
      hotelName,
      userId: userId ?? 'guest',
      action: favorited ? 'unfavorite' : 'favorite',
      ...getEventContext(),
    });
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} className="flex items-center gap-1">
      <Heart className={favorited ? 'fill-red-500 text-red-500' : ''} size={16} />
      {favorited ? '已收藏' : '收藏'}
    </Button>
  );
}
