
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Cpu, Play, Square, Zap, TrendingUp } from "lucide-react";
import { useCoinImpMining } from "@/hooks/useCoinImpMining";
import { useMiningPersistence } from "@/hooks/useMiningPersistence";
import HashrateTicker from "./HashrateTicker";
import { HashrateGraph } from "./HashrateGraph";
import { useState, useEffect } from "react";

const MiningSection = () => {
  const { 
    isInitialized, 
    hashrate, 
    totalHashes, 
    isMining, 
    throttle, 
    startMining, 
    stopMining, 
    setThrottle 
  } = useCoinImpMining();
  
  const { miningData, exchangeHashrate } = useMiningPersistence();
  const [hashrateHistory, setHashrateHistory] = useState<number[]>([]);

  // Track hashrate history
  useEffect(() => {
    setHashrateHistory(prev => {
      const newHistory = [...prev, hashrate];
      return newHistory.slice(-50); // Keep last 50 readings
    });
  }, [hashrate]);

  const handleToggleMining = async () => {
    if (isMining) {
      await stopMining();
    } else {
      await startMining();
    }
  };

  const handleThrottleChange = async (value: number[]) => {
    await setThrottle(value[0]);
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="gradient-card border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                isInitialized && isMining ? 'bg-green-500 animate-pulse' : 
                isInitialized ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium">
                {isInitialized ? (isMining ? 'Mining' : 'Ready') : 'Loading'}
              </span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {hashrate > 0 ? hashrate.toFixed(2) : '0.00'}
            </div>
            <div className="text-xs text-muted-foreground">
              H/s Current ({Math.round((1 - throttle) * 100)}% CPU)
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {totalHashes.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Hashes</div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {miningData?.accumulated_hashrate?.toFixed(6) || '0.000000'}
            </div>
            <div className="text-xs text-muted-foreground">
              Hashrate Accumulé (Blocs: {miningData?.total_blocks_mined || 0})
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-info">
              {miningData?.total_blocks_mined || 0}
            </div>
            <div className="text-xs text-muted-foreground">Blocks Mined</div>
          </CardContent>
        </Card>
      </div>

      {/* Mining Controls */}
      <Card className="gradient-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-primary" />
            Mining Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Start/Stop Button */}
          <div className="flex items-center justify-center">
            <Button
              onClick={handleToggleMining}
              disabled={!isInitialized}
              size="lg"
              className={`px-8 py-4 rounded-lg font-bold transition-all duration-300 ${
                isMining 
                  ? 'bg-destructive hover:bg-destructive/90' 
                  : 'bg-success hover:bg-success/90'
              }`}
            >
              {isMining ? (
                <>
                  <Square className="w-5 h-5 mr-2" />
                  Stop Mining
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Mining
                </>
              )}
            </Button>
          </div>

          {/* Throttle Control */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">CPU Usage</label>
              <Badge variant="outline">
                {Math.round((1 - throttle) * 100)}%
              </Badge>
            </div>
            <Slider
              value={[throttle]}
              onValueChange={handleThrottleChange}
              min={0.1}
              max={0.9}
              step={0.1}
              disabled={!isInitialized}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low (10%)</span>
              <span>High (90%)</span>
            </div>
          </div>

          {/* Mining Info */}
          {!isInitialized && (
            <div className="text-center text-muted-foreground">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              Initializing mining client...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Hashrate Graph */}
      <Card className="gradient-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-success" />
            Live Hashrate Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HashrateTicker />
        </CardContent>
      </Card>

      {/* Hashrate Exchange */}
      <Card className="gradient-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-warning" />
            Hashrate Exchange
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HashrateGraph
            hashrateHistory={hashrateHistory}
            currentHashrate={hashrate}
            isActive={isMining}
            accumulatedHashrate={miningData?.accumulated_hashrate || 0}
            deadspotCoins={miningData?.deadspot_coins || 0}
            onExchange={exchangeHashrate}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MiningSection;
