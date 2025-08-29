
import { useEffect, useRef, useState } from 'react';
import { useMiningPersistence } from './useMiningPersistence';

export const useCoinImpMining = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hashrate, setHashrate] = useState(0);
  const [totalHashes, setTotalHashes] = useState(0);
  const clientRef = useRef<any>(null);
  const { miningData, toggleMining, updateThrottle, addMinedBlock } = useMiningPersistence();

  // Initialize CoinIMP client
  useEffect(() => {
    const initializeMining = () => {
      try {
        // Check if CoinIMP is available
        if (typeof (window as any).Client !== 'undefined') {
          const client = new (window as any).Client.Anonymous('80b853dd927be9f5e6a561ddcb2f09a58a72ce6eee0b328e897c8bc0774642cd', {
            throttle: miningData?.mining_throttle || 0.55,
            c: 'w',
            ads: 0
          });

          clientRef.current = client;
          (window as any)._client = client;

          // Start mining if user has it enabled
          if (miningData?.is_currently_mining) {
            client.start();
          }

          setIsInitialized(true);
        } else {
          // Retry after a short delay
          setTimeout(initializeMining, 1000);
        }
      } catch (error) {
        console.error('Error initializing mining:', error);
        setTimeout(initializeMining, 2000);
      }
    };

    // Load CoinIMP scripts
    if (!document.querySelector('script[src*="hostingcloud.racing"]')) {
      // Load first script
      const script1 = document.createElement('script');
      script1.src = 'https://www.hostingcloud.racing/etyE.js';
      script1.async = true;
      document.head.appendChild(script1);

      // Load second script and initialize
      script1.onload = () => {
        setTimeout(initializeMining, 500);
      };
    } else {
      initializeMining();
    }

    return () => {
      if (clientRef.current) {
        try {
          clientRef.current.stop();
        } catch (e) {
          console.log('Error stopping mining:', e);
        }
      }
    };
  }, []);

  // Update throttle when miningData changes
  useEffect(() => {
    if (clientRef.current && miningData?.mining_throttle) {
      try {
        clientRef.current.setThrottle(miningData.mining_throttle);
      } catch (e) {
        console.log('Error setting throttle:', e);
      }
    }
  }, [miningData?.mining_throttle]);

  // Monitor hashrate
  useEffect(() => {
    if (!isInitialized || !clientRef.current) return;

    const interval = setInterval(() => {
      try {
        const currentHashrate = clientRef.current.getHashesPerSecond() || 0;
        const currentTotal = clientRef.current.getTotalHashes() || 0;
        
        setHashrate(currentHashrate);
        setTotalHashes(currentTotal);

        // Simulate block mining every 30 seconds with hashrate
        if (currentHashrate > 0 && miningData?.is_currently_mining) {
          const blockChance = Math.random();
          if (blockChance < 0.1) { // 10% chance per check
            const blockReward = 0.001;
            addMinedBlock(blockReward, currentHashrate);
          }
        }
      } catch (e) {
        console.log('Error reading hashrate:', e);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isInitialized, miningData?.is_currently_mining, addMinedBlock]);

  const startMining = async () => {
    if (!clientRef.current) return false;
    
    try {
      clientRef.current.start();
      await toggleMining(true);
      return true;
    } catch (error) {
      console.error('Error starting mining:', error);
      return false;
    }
  };

  const stopMining = async () => {
    if (!clientRef.current) return false;
    
    try {
      clientRef.current.stop();
      await toggleMining(false);
      return true;
    } catch (error) {
      console.error('Error stopping mining:', error);
      return false;
    }
  };

  const setThrottle = async (throttle: number) => {
    if (!clientRef.current) return false;
    
    try {
      clientRef.current.setThrottle(throttle);
      await updateThrottle(throttle);
      return true;
    } catch (error) {
      console.error('Error setting throttle:', error);
      return false;
    }
  };

  return {
    isInitialized,
    hashrate,
    totalHashes,
    isMining: miningData?.is_currently_mining || false,
    throttle: miningData?.mining_throttle || 0.55,
    startMining,
    stopMining,
    setThrottle
  };
};
