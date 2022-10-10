import { useState } from 'react';

import { Radio } from '@arco-design/web-react';
import {
  IconHistory,
  IconSettings,
  IconUpload,
} from '@arco-design/web-react/icon';
import { Link } from 'react-router-dom';

const RadioGroup = Radio.Group;

type Pages = 'Hisotry' | 'Up' | 'Settings';

export const Menu = () => {
  const [route, setRoute] = useState<Pages>('Hisotry');

  return (
    <RadioGroup
      style={{ width: '216px' }}
      value={route}
      type="button"
      defaultValue="Hisotry"
    >
      <Link to="/">
        <Radio onClick={() => setRoute('Hisotry')} value="Hisotry">
          <div>
            <IconHistory color="rgb(var(--arcoblue-6))"></IconHistory>
            历史
          </div>
        </Radio>
      </Link>
      <Link to="/up">
        <Radio onClick={() => setRoute('Up')} value="Up">
          <div>
            <IconUpload color="rgb(var(--arcoblue-6))"></IconUpload>
            上传
          </div>
        </Radio>
      </Link>
      <Link to="/settings">
        <Radio onClick={() => setRoute('Settings')} value="Settings">
          <div>
            <IconSettings color="rgb(var(--arcoblue-6))"></IconSettings>
            设置
          </div>
        </Radio>
      </Link>
    </RadioGroup>
  );
};
