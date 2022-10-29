// import { AniSvg } from '@/blocks/AniSvg';
import './style.css';
import { ReactComponent as Brand } from '@/blocks/AniSvg/brand.svg';

export const Logo = () => {
  return (
    <div className="brand">
      <Brand></Brand>
      <div className="moveable"></div>
    </div>
  );
};
