import { BrandName } from '@/types';

// Using simple text/colors for now, but structured to swap for SVGs later
// or use a CDN for logos if preferred.
// For a quick win, we can use simple SVG paths or specialized icons.

export const getBrandColor = (brand: BrandName) => {
  switch (brand) {
    case 'BP': return 'bg-green-600 text-yellow-400';
    case 'Shell': return 'bg-red-600 text-yellow-300';
    case '7-Eleven': return 'bg-green-700 text-red-500'; // complex logo, simplified
    case 'Ampol': return 'bg-red-600 text-blue-600';
    case 'United': return 'bg-blue-600 text-red-500';
    case 'Costco': return 'bg-red-600 text-blue-600';
    default: return 'bg-gray-600 text-white';
  }
};

// Simple mapping to public logo paths (we will need to add these files or use external URLs)
export const getBrandLogoUrl = (brand: BrandName) => {
  const safeBrand = brand.toLowerCase().replace(/[^a-z0-9]/g, '-');
  // Return a placeholder or a specific CDN logo
  // For MVP without assets, we might return null and handle fallback
  return `/logos/${safeBrand}.png`; 
};

// Fallback "Logo" component using CSS if image fails or isn't present
export const BrandLogoFallback = ({ brand, className = "w-8 h-8" }: { brand: BrandName, className?: string }) => {
  const style = getBrandColor(brand);
  
  // Specific simple geometric approximations
  if (brand === 'BP') {
    return (
      <div className={`${className} rounded-full overflow-hidden bg-green-600 flex items-center justify-center relative border border-white shadow-sm`}>
         <div className="w-2/3 h-2/3 bg-yellow-400 rounded-full transform rotate-45"></div>
         <div className="absolute w-1/3 h-1/3 bg-green-600 rounded-full"></div>
      </div>
    );
  }
  if (brand === 'Shell') {
    return (
      <div className={`${className} bg-yellow-300 rounded-lg border-2 border-red-600 shadow-sm flex items-center justify-center`}>
        <div className="w-1/2 h-1/2 bg-red-600 rounded-full"></div>
      </div>
    );
  }
  if (brand === '7-Eleven') {
    return (
       <div className={`${className} bg-green-700 rounded flex items-center justify-center border border-white shadow-sm`}>
         <span className="text-white font-bold text-[10px] leading-none">7<span className="text-orange-500">E</span></span>
       </div>
    );
  }
  if (brand === 'Ampol') {
    return (
       <div className={`${className} bg-red-600 rounded flex items-center justify-center border border-white shadow-sm relative overflow-hidden`}>
          <div className="absolute inset-y-0 right-0 w-1/2 bg-blue-600 -skew-x-12 transform origin-bottom-right"></div>
       </div>
    );
  }
  
  // Default Initial
  return (
    <div className={`${className} ${style.split(' ')[0]} rounded flex items-center justify-center text-white font-bold text-xs border border-white shadow-sm`}>
      {brand.slice(0, 1)}
    </div>
  );
};

