import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import getValidImageUrl from '@/lib/getValidImageUrl'; // ✅ default 匯入

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
}: HotelCardProps) {

  // ✅ 放在這裡，React function component 內部、return 之前
  const [validImageUrl, setValidImageUrl] = useState<string | null>(null);

  useEffect(() => {
    setValidImageUrl(getValidImageUrl(imageUrl));
  }, [imageUrl]);

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

        {/* ✅ 只在 client 計算完成後顯示圖片 */}
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

        {bookingUrl && (
          <Button className="mt-2" asChild>
            <Link href={bookingUrl} target="_blank">
              Book Now
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
