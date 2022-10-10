import { Radio } from '@arco-design/web-react';
import { IconMoon, IconSun } from '@arco-design/web-react/icon';

import { useTheme } from '@/hooks/useTheme';
const RadioGroup = Radio.Group;

export const Theme = () => {
  const [theme, _, setTheme] = useTheme();

  return (
    <RadioGroup
      value={theme}
      onChange={(v) => setTheme(v)}
      type="button"
      defaultValue="light"
    >
      <Radio value="light">
        <IconSun></IconSun>
      </Radio>
      <Radio value="dark">
        <IconMoon></IconMoon>
      </Radio>
    </RadioGroup>
  );
};
