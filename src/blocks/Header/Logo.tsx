import { AniSvg } from '@/blocks/AniSvg';
import './style.css';

export const Logo = () => {
  return (
    <div className="brand">
      <AniSvg name="brand"></AniSvg>
      <div className="moveable"></div>
    </div>
  );
};
