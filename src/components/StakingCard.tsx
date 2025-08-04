import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface StakingCardProps {
  name: string;
  symbol: string;
  network: string;
  apy: string;
  icon: string;
  color: string;
}

const StakingCard = ({ name, symbol, network, apy, icon, color }: StakingCardProps) => {
  const [amount, setAmount] = useState("");

  return (
    <Card className="relative overflow-hidden gradient-card border-primary/20 hover:shadow-glow transition-smooth animate-float group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
      
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${color}`}>
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg font-bold">{name}</CardTitle>
              <CardDescription className="text-muted-foreground">{network}</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="gradient-crypto text-white font-semibold">
            {apy}% APY
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Montant à staker</label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-16 bg-secondary/50 border-primary/20 focus:border-primary transition-smooth"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
              {symbol}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rendement quotidien:</span>
            <span className="font-semibold text-success">+{apy}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimation mensuelle:</span>
            <span className="font-semibold text-info">+{(parseFloat(apy) * 30).toFixed(0)}%</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative z-10">
        <Button 
          variant="crypto" 
          size="lg" 
          className="w-full"
          disabled={!amount || parseFloat(amount) <= 0}
        >
          Staker {symbol}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StakingCard;