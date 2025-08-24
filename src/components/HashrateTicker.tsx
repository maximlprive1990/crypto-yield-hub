
import { useEffect, useMemo, useRef, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/**
 * Affiche un graphe temps-réel du hashrate (H/s) rafraîchi toutes les 750ms.
 * Lit window._client.getHashesPerSecond() (CoinIMP).
 */
const HashrateTicker = () => {
  const [hashrate, setHashrate] = useState(0);
  const [totalHashes, setTotalHashes] = useState(0);
  const [data, setData] = useState<{ t: number; h: number }[]>([]);
  const [isClientReady, setIsClientReady] = useState(false);
  const maxPoints = 40; // ~30s de données visibles à 750ms
  const timerRef = useRef<number | null>(null);

  // Check if client is ready
  useEffect(() => {
    const checkClient = () => {
      const client = (window as any)._client;
      if (client && typeof client.getHashesPerSecond === 'function') {
        setIsClientReady(true);
        return true;
      }
      return false;
    };

    if (!checkClient()) {
      const interval = setInterval(() => {
        if (checkClient()) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (!isClientReady) return;

    const tick = () => {
      try {
        const client: any = (window as any)._client;
        if (client && typeof client.getHashesPerSecond === 'function') {
          const hps = Number(client.getHashesPerSecond()) || 0;
          const th = Number(client.getTotalHashes()) || 0;
          
          setHashrate(hps);
          setTotalHashes(th);
          setData(prev => {
            const next = [...prev, { t: Date.now(), h: hps }];
            if (next.length > maxPoints) next.shift();
            return next;
          });
        }
      } catch (e) {
        console.log('Hashrate ticker read error', e);
      }
    };

    // Initial tick
    tick();
    
    // 750 ms comme demandé
    timerRef.current = window.setInterval(tick, 750);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isClientReady]);

  const formatted = useMemo(() => data.map((d) => ({ ...d, label: '' })), [data]);

  if (!isClientReady) {
    return (
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">Hashrate</div>
          <div className="font-mono text-muted-foreground">
            Initializing...
          </div>
        </div>
        <div className="h-28 w-full rounded-md border border-border/50 bg-card/50 flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-foreground">Hashrate</div>
        <div className="font-mono">
          {hashrate.toFixed(2)} H/s
          <span className="text-muted-foreground ml-2">Total: {totalHashes.toLocaleString()}</span>
        </div>
      </div>
      <div className="h-28 w-full rounded-md border border-border/50 bg-card/50">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
            <XAxis dataKey="label" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip
              formatter={(value: any) => [`${Number(value).toFixed(2)} H/s`, 'Hashrate']}
              labelFormatter={() => ''}
            />
            <Line
              type="monotone"
              dataKey="h"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HashrateTicker;
