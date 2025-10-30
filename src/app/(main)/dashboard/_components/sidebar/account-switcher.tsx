"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { BadgeCheck, Bell, CreditCard, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import api from "@/config/axiosConfig";
import { cn, getInitials } from "@/lib/utils";

export function AccountSwitcher({
  users,
}: {
  readonly users: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly avatar: string;
    readonly role: string;
  }>;
}) {
  const [activeUser, setActiveUser] = useState(users[0]);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      toast.success("Logged out successfully");
      router.push("/auth/v2/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-9 rounded-lg">
          <AvatarImage src={activeUser.avatar || undefined} alt={activeUser.name} />
          <AvatarFallback className="rounded-lg">{getInitials(activeUser.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56 space-y-1 rounded-lg" side="bottom" align="end" sideOffset={4}>
        {users.map((user) => (
          <DropdownMenuItem
            key={user.email}
            className={cn("p-0", user.id === activeUser.id && "bg-accent/50 border-l-primary border-l-2")}
            onClick={() => setActiveUser(user)}
          >
            <div className="flex w-full items-center justify-between gap-2 px-1 py-1.5">
              <Avatar className="size-9 rounded-lg">
                <AvatarImage src={user.avatar || undefined} alt={user.name} />
                <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs capitalize">{user.role}</span>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        {/* <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup> */}
        <DropdownMenuSeparator />
        <div className="flex items-center justify-end px-2 py-1">
          <Button onClick={handleLogout} className="cursor-pointer">
            <LogOut />
            Log out
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
