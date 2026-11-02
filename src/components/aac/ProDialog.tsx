import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Lock } from 'lucide-react';
import RainbowLogo from './RainbowLogo';

interface Props {
  open: boolean;
  onClose: () => void;
  onUnlock: (code: string) => boolean;
  language: 'english' | 'hindi';
}

export default function ProDialog({ open, onClose, onUnlock, language }: Props) {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const en = language === 'english';
  const submit = () => {
    if (onUnlock(code)) { setMsg(''); setCode(''); onClose(); }
    else setMsg(en ? 'That code did not work. Please check and try again.' : 'यह कोड सही नहीं है। फिर से कोशिश करें।');
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="items-center text-center">
          <RainbowLogo className="w-24 text-[48px]" />
          <DialogTitle className="flex items-center gap-2"><Lock size={16} /> VOXAFIA Pro</DialogTitle>
          <DialogDescription>
            {en ? 'This folder is part of VOXAFIA Pro. Basic Needs and Core Words are always free.' : 'यह फ़ोल्डर VOXAFIA Pro में है। मूल ज़रूरतें और मुख्य शब्द हमेशा मुफ़्त हैं।'}
          </DialogDescription>
        </DialogHeader>
        <ul className="text-sm space-y-1 font-semibold">
          <li>✅ {en ? 'All picture folders' : 'सभी चित्र फ़ोल्डर'}</li>
          <li>✅ {en ? 'Your own photos and voice' : 'अपनी फ़ोटो और आवाज़'}</li>
          <li>✅ {en ? 'Unlimited custom folders' : 'असीमित फ़ोल्डर'}</li>
        </ul>
        <div className="space-y-2">
          <input value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder={en ? 'Enter activation code' : 'एक्टिवेशन कोड डालें'} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background font-bold" />
          {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
          <button onClick={submit} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold">{en ? 'Unlock Pro' : 'Pro खोलें'}</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
