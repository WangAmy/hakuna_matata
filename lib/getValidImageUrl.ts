// lib/getValidImageUrl.ts

export default function getValidImageUrl(originalUrl: string): string {
    if (originalUrl.includes("marriott.com")) {
      const codeMatch = originalUrl.match(/travel\/([a-z0-9]+)-/i);
      if (codeMatch) {
        const hotelCode = codeMatch[1];
        return `https://cache.marriott.com/marriottassets/marriott/${hotelCode}/${hotelCode}_exterior.jpg`;
      }
    }
  
    if (originalUrl.includes("agoda.com")) {
      return `https://cdn.agoda.net/images/agoda-homes/default-hotel.jpg`;
    }
  
    return "/default-hotel.jpg";
  }
  