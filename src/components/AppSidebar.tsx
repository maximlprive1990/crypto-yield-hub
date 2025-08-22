import { useState } from "react";
import { 
  Home, 
  TrendingUp, 
  Gamepad2, 
  BarChart3, 
  Wallet, 
  MousePointer, 
  Pickaxe, 
  Gift, 
  Link, 
  Crown, 
  Trophy, 
  Users, 
  Zap, 
  Package, 
  Calendar, 
  Settings, 
  Shield, 
  MessageCircle, 
  Star,
  Cpu
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const mainSections = [
  { id: "features", title: "Avantages", icon: Star },
  { id: "gaming", title: "Gaming", icon: Gamepad2 },
  { id: "mining-control", title: "Contrôle Mineur", icon: Cpu },
  { id: "stats", title: "Statistiques", icon: BarChart3 },
  { id: "deposits", title: "Dépôts & Staking", icon: Wallet },
  { id: "clicker", title: "DeadSpot Click", icon: MousePointer },
  { id: "mining-farm", title: "Ferme Mining", icon: Pickaxe },
  { id: "rewards", title: "Récompenses", icon: Gift },
  { id: "referrals", title: "Liens Référents", icon: Link },
  { id: "vip", title: "VIP & Monétisation", icon: Crown },
  { id: "gaming-features", title: "Gaming Features", icon: Trophy },
  { id: "leaderboard", title: "Classements", icon: Users },
  { id: "customization", title: "Personnalisation", icon: Settings },
  { id: "security", title: "Sécurité", icon: Shield },
  { id: "news", title: "Actualités", icon: MessageCircle },
  { id: "custom-staking", title: "Staking Custom", icon: Zap },
  { id: "withdrawal", title: "Retrait", icon: Package },
  { id: "portfolio", title: "Portfolio", icon: TrendingUp },
  { id: "referral-system", title: "Système Parrainage", icon: Users }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("features");

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getNavCls = (sectionId: string) => 
    activeSection === sectionId ? "bg-primary/20 text-primary font-medium" : "hover:bg-muted/50";

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      className={isCollapsed ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {mainSections.map((section) => (
                <SidebarMenuItem key={section.id}>
                  <SidebarMenuButton 
                    onClick={() => scrollToSection(section.id)}
                    className={getNavCls(section.id)}
                  >
                    <section.icon className="mr-2 h-4 w-4" />
                    {!isCollapsed && <span className="text-sm">{section.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}