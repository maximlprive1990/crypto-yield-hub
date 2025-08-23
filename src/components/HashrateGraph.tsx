import { useState, useEffect } from 'react';

interface HashrateGraphProps {
  hashrateHistory: number[];
  currentHashrate: number;
  isActive: boolean;
  accumulatedHashrate: number;
  deadspotCoins: number;
  onExchange: () => void;
}

export const HashrateGraph = ({ hashrateHistory, currentHashrate, isActive, accumulatedHashrate, deadspotCoins, onExchange }: HashrateGraphProps) => {
  const [displayHashrate, setDisplayHashrate] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  // Animation du chiffre principal
  useEffect(() => {
    if (isActive) {
      let start = displayHashrate;
      let end = currentHashrate;
      let startTime = Date.now();
      let duration = 500;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = start + (end - start) * easeOut;
        
        setDisplayHashrate(current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [currentHashrate, isActive]);

  // Trigger animation when hashrate changes
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [currentHashrate]);

  // Calculs statistiques
  const maxHashrate = Math.max(...hashrateHistory, currentHashrate);
  const minHashrate = Math.min(...hashrateHistory, currentHashrate);
  const avgHashrate = hashrateHistory.length > 0 
    ? hashrateHistory.reduce((a, b) => a + b, 0) / hashrateHistory.length 
    : 0;

  // Formatage des nombres
  const formatHashrate = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toFixed(2);
  };

  const canExchange = accumulatedHashrate >= 100000;
  const exchangeAmount = Math.floor(accumulatedHashrate / 100000);

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hashrate accumulé */}
        <div className="relative bg-gradient-to-br from-card via-card/90 to-card/80 p-6 rounded-xl border border-primary/20 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">Hashrate Accumulé</div>
            <div className="text-3xl font-mono font-bold text-primary animate-pulse">
              {accumulatedHashrate.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Hashrate</div>
          </div>
        </div>

        {/* Deadspot Coins */}
        <div className="relative bg-gradient-to-br from-card via-card/90 to-card/80 p-6 rounded-xl border border-primary/20 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">Deadspot Coins</div>
            <div className="text-3xl font-mono font-bold text-yellow-400 animate-pulse">
              {deadspotCoins.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">DSC</div>
          </div>
        </div>
      </div>

      {/* Box d'échange */}
      <div className="relative bg-gradient-to-br from-card via-card/90 to-card/80 p-6 rounded-xl border border-primary/20 backdrop-blur-sm">
        <h4 className="text-lg font-bold text-primary mb-4 text-center">🔄 Échange Hashrate</h4>
        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground">
            Taux d'échange : 100,000 Hashrate = 0.15 DSC
          </div>
          
          <div className="bg-background/50 rounded-lg p-4 border border-primary/10">
            <div className="text-lg font-mono">
              {exchangeAmount > 0 ? (
                <span className="text-green-400">
                  Vous pouvez échanger {exchangeAmount}x (= {(exchangeAmount * 0.15).toFixed(2)} DSC)
                </span>
              ) : (
                <span className="text-orange-400">
                  Il vous faut {(100000 - (accumulatedHashrate % 100000)).toLocaleString()} hashrate de plus
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onExchange}
            disabled={!canExchange}
            className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
              canExchange 
                ? 'bg-gradient-to-r from-primary to-primary/80 text-white hover:shadow-glow animate-pulse' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {canExchange ? `💎 Échanger ${exchangeAmount}x` : '⏳ Pas assez de hashrate'}
          </button>
        </div>
      </div>

      {/* Graphique de hashrate en temps réel */}
      <div className="relative bg-gradient-to-br from-card via-card/90 to-card/80 p-6 rounded-xl border border-primary/20 backdrop-blur-sm">
        {/* Grille de fond cyber */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(var(--primary) / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(var(--primary) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }} />
        </div>

      {/* Header */}
      <div className="relative z-10 mb-6">
        <h4 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          Monitoring Hashrate
        </h4>
      </div>

      {/* Affichage principal */}
      <div className="relative z-10 text-center mb-8">
        <div className="relative inline-block">
          {/* Effet de glow */}
          <div 
            key={animationKey}
            className="absolute inset-0 bg-primary/20 rounded-lg blur-lg animate-pulse"
            style={{ animationDuration: '2s' }}
          />
          
          {/* Valeur principale */}
          <div className="relative bg-background/80 backdrop-blur-sm rounded-lg p-4 border border-primary/30">
            <div className="text-4xl md:text-6xl font-mono font-bold text-primary animate-pulse">
              {formatHashrate(displayHashrate)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">H/s</div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-4 flex justify-center items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isActive ? 'Mining Active' : 'Mining Stopped'}
          </span>
        </div>
      </div>

      {/* Statistiques */}
      <div className="relative z-10 grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-background/50 rounded-lg border border-primary/10">
          <div className="text-lg font-mono font-bold text-green-400">
            {formatHashrate(maxHashrate)}
          </div>
          <div className="text-xs text-muted-foreground">MAX</div>
        </div>
        
        <div className="text-center p-3 bg-background/50 rounded-lg border border-primary/10">
          <div className="text-lg font-mono font-bold text-blue-400">
            {formatHashrate(avgHashrate)}
          </div>
          <div className="text-xs text-muted-foreground">AVG</div>
        </div>
        
        <div className="text-center p-3 bg-background/50 rounded-lg border border-primary/10">
          <div className="text-lg font-mono font-bold text-orange-400">
            {formatHashrate(minHashrate)}
          </div>
          <div className="text-xs text-muted-foreground">MIN</div>
        </div>
      </div>

      {/* Graphique linéaire stylisé */}
      <div className="relative z-10">
        <div className="h-24 relative overflow-hidden rounded-lg bg-background/30 border border-primary/10">
          {hashrateHistory.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              En attente de données...
            </div>
          ) : (
            <div className="flex items-end h-full px-2 gap-1">
              {hashrateHistory.map((h, i) => {
                const height = maxHashrate > 0 ? (h / maxHashrate) * 100 : 0;
                const opacity = 0.3 + (i / hashrateHistory.length) * 0.7;
                
                return (
                  <div key={i} className="relative flex-1 flex flex-col justify-end">
                    {/* Barre principale */}
                    <div
                      className="bg-gradient-to-t from-primary to-primary/50 rounded-t transition-all duration-300"
                      style={{ 
                        height: `${Math.max(height, 2)}%`,
                        opacity: opacity,
                        boxShadow: height > 50 ? `0 0 10px rgba(var(--primary) / 0.5)` : 'none'
                      }}
                    />
                    
                    {/* Point de données */}
                    <div
                      className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full"
                      style={{ 
                        opacity: opacity,
                        boxShadow: `0 0 6px rgba(var(--primary) / 0.8)`
                      }}
                      title={`${h.toFixed(2)} H/s`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Labels temporels */}
        <div className="flex justify-between text-xs text-muted-foreground mt-2 px-2">
          <span>-{hashrateHistory.length}s</span>
          <span>Temps</span>
          <span>Maintenant</span>
        </div>
      </div>

      {/* Effet de scan futuriste */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          <div 
            className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 animate-scan"
          />
        </div>
      )}
      </div>
    </div>
  );
};
