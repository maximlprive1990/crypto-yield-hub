import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const CollapsibleSection = ({ 
  title, 
  subtitle, 
  children, 
  defaultOpen = false,
  className = ""
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className={`py-8 px-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full p-6 h-auto flex items-center justify-between text-left hover:bg-secondary/50 border-2 border-border rounded-lg mb-4"
            >
              <div className="text-center flex-1">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                    {subtitle}
                  </p>
                )}
              </div>
              <div className="ml-4">
                {isOpen ? (
                  <ChevronUp className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="animate-accordion-down">
            <div className="pt-4">
              {children}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
};