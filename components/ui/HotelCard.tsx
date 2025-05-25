'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import getValidImageUrl from '@/lib/getValidImageUrl';
import { trackEvent, getEventContext } from '@/lib/amplitude';
import { Heart } from 'lucide-react';

interface HotelCardProps {
  name: string;
  description: string;
  location: string;
  starRating: number;
  guestRating: number;
  reviewCount: number;
  price: string;
  maxOccupancy: number;
  imageUrl: string;
  bookingUrl?: string;
  userId?: string;
}

export default function HotelCard({
  name,
  description,
  location,
  starRating,
  guestRating,
  reviewCount,
  price,
  maxOccupancy,
  imageUrl,
  bookingUrl,
  userId,
}: HotelCardProps) {
  const [validImageUrl, setValidImageUrl] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    setValidImageUrl(getValidImageUrl(imageUrl));
  }, [imageUrl]);

  const handleFavorite = () => {
    setFavorited(!favorited);
    trackEvent('card_favorited', {
      hotelName: name,
      userId: userId ?? 'guest',
      action: favorited ? 'unfavorite' : 'favorite',
      ...getEventContext(),
    });
  };

  return (
    <Card className="w-full max-w-xl rounded-2xl shadow-md border p-4 space-y-4">
      <CardContent className="space-y-3">
        <h2 className="text-xl font-semibold">
          🏨{' '}
          {bookingUrl ? (
            <Link
              href={bookingUrl}
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {name}
            </Link>
          ) : (
            name
          )}
        </h2>
        <p>{description}</p>
        <ul className="list-disc list-inside text-sm">
          <li><strong>Location:</strong> {location}</li>
          <li><strong>Star Rating:</strong> {starRating}</li>
          <li><strong>Guest Rating:</strong> {guestRating} / 10.0 ({reviewCount} reviews)</li>
          <li><strong>Total Price:</strong> {price}</li>
          <li><strong>Max Occupancy:</strong> {maxOccupancy}</li>
        </ul>

        {validImageUrl && (
          <div className="w-full h-64 relative overflow-hidden rounded-xl">
            <Image
              src={validImageUrl}
              alt={name}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {bookingUrl && (
            <Button className="mt-2" asChild>
              <Link
                href={bookingUrl}
                target="_blank"
                onClick={() => {
                  trackEvent('hotel_card_clicked', {
                    hotelName: name,
                    location,
                    price,
                    ...getEventContext(),
                  });
                }}
              >
                Book Now
              </Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavorite}
            className="flex items-center gap-1"
          >
            <Heart className={favorited ? 'fill-red-500 text-red-500' : ''} size={16} />
            {favorited ? '已收藏' : '收藏'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
