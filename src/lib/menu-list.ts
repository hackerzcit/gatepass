import { LucideIcon, Search, ClipboardList, Calendar, CreditCard, Trophy, Award, RefreshCcw } from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "User",
      menus: [
        {
          href: "/users",
          label: "All Users",
          icon: Search
        },
        {
          href: "/attendance",
          label: "Attendance History",
          icon: ClipboardList
        }
      ]
    },
    {
      groupLabel: "Events",
      menus: [
        {
          href: "/events",
          label: "All Events",
          icon: Calendar
        }
      ]
    },
  
    {
      groupLabel: "Payments",
      menus: [
        {
          href: "/payments",
          label: "All Payments",
          icon: CreditCard
        }
      ]
    },
    {
      groupLabel: "Winner",
      menus: [
        {
          href: "/winners",
          label: "Declare Winner",
          icon: Trophy
        },
        {
          href: "/winners/list",
          label: "Winner List",
          icon: Award
        }
      ]
    },
  
    {
      groupLabel: "System",
      menus: [
        {
          href: "/sync",
          label: "Sync Status",
          icon: RefreshCcw
        },
      ]
    }
  ]
}
