import { useState } from 'react';
import { Button, Message, Modal, Typography } from '@arco-design/web-react';
import {
  IconBug,
  IconCheck,
  IconGithub,
  IconQuestion,
  IconStar,
} from '@arco-design/web-react/icon';
import { autoupdate } from '@/autoupdate';
import { shell } from '@tauri-apps/api';
import './about.css';
import { notify } from '@/utils/notify';

const { Title, Paragraph, Text } = Typography;
export const About = () => {
  const [loading, setLoaing] = useState(false);
  return (
    <div className="about">
      <div className="space">
        <div>
          <img className="logo" src="/brand.svg" alt="" />
        </div>
        <div>
          <Button.Group>
            <Button
              onClick={() => {
                shell.open('https://github.com/charlzyx/rush');
              }}
              type="text"
              icon={<IconStar></IconStar>}
            ></Button>
          </Button.Group>
        </div>
      </div>
      <div className="body">
        <img
          onClick={() => {
            shell.open('https://github.com/charlzyx/rush');
          }}
          src="https://gh-card.dev/repos/charlzyx/rush.svg"
          width="460px"
          alt="git"
        />
      </div>
      <div className="center">
        <Button
          onClick={() => {
            shell.open('https://github.com/charlzyx/rush/issues/new');
          }}
          icon={<IconBug></IconBug>}
          long
          type="default"
        >
          上报问题
        </Button>
        &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
        <Button
          onClick={async () => {
            setLoaing(true);
            try {
              await autoupdate();
            } catch (error) {
            } finally {
              setLoaing(false);
            }
          }}
          icon={<IconQuestion></IconQuestion>}
          long
          type="primary"
        >
          检查更新
        </Button>
      </div>
    </div>
  );
};
