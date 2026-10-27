import { useCallback, useState } from 'react';
import AACApp from '@/components/aac/AACApp';
import SplashIntro from '@/components/aac/SplashIntro';

const Index = () => {
  const [showIntro, setShowIntro] = useState(() => {
    try { return sessionStorage.getItem('voxafia-intro-seen') !== '1'; } catch { return true; }
  });
  const done = useCallback(() => {
    try { sessionStorage.setItem('voxafia-intro-seen', '1'); } catch { /* ignore */ }
    setShowIntro(false);
  }, []);

  return (
    <>
      <AACApp onReplayIntro={() => setShowIntro(true)} />
      {showIntro && <SplashIntro onDone={done} />}
    </>
  );
};

export default Index;
