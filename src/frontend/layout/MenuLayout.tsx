import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "#frontx/components/ui/avatar";
import { Button } from "#frontx/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "#frontx/components/ui/navigation-menu";

import { useIsMobile } from "#front/hooks/use-mobile";
import {
  NavigationMenuContent,
  NavigationMenuTrigger,
} from "@radix-ui/react-navigation-menu";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { LogIn, LogOut, Users } from "lucide-react";
import { toast } from "sonner";
import { usePageContext } from "vike-react/usePageContext";
import { navigate, reload } from "vike/client/router";

export const MenuLayout = () => {
  // @ts-expect-error -- fix type
  const { user } = usePageContext();

  const isMobile = useIsMobile();

  const mutation = useMutation({
    mutationFn: async () => {
      return axios
        .post("http://localhost:3000/auth/logout")
        .then(async () => await reload())
        .catch((error) => {
          console.log(error);
          toast.error("An Error occured");
        });
    },
  });
  return (
    <NavigationMenu
      viewport={isMobile}
      orientation="horizontal"
      className="w-20"
    >
      <NavigationMenuList className="w-20 fixed z-300">
        <NavigationMenuItem className=" w-10 h-10 ">
          <div className="flex gap-2 mt-5 text-2xl font-bold items-center">
            <NavigationMenuTrigger asChild>
              <Avatar className="h-14 w-14">
                <AvatarImage
                  alt={user?.image ?? "offline"}
                  src={user?.image ?? undefined}
                />
                <AvatarFallback className="rounded-lg bg-secondary font-medium text-xl">
                  {user ? user.name[0] : <Users className="text-primary" />}
                </AvatarFallback>
              </Avatar>
            </NavigationMenuTrigger>
            <h1>Menu</h1>
          </div>
          <NavigationMenuContent className="h-[300px] w-fit">
            {user == null ? (
              <Button
                className="text-xl font-bold my-5"
                onClick={() => navigate("/auth/login")}
                variant="ghost"
              >
                <LogIn size={26}></LogIn>
                Login
              </Button>
            ) : (
              <>
                {" "}
                <Button
                  variant="ghost"
                  onClick={() => navigate("/profile")}
                  className="text-xl font-bold my-5"
                >
                  Update Profile
                </Button>
                <Button
                  onClick={() => navigate("/game")}
                  className="text-xl font-bold my-5"
                  variant="ghost"
                >
                  Play Chess Games
                </Button>
                <Button
                  onClick={() => navigate("/puzzles")}
                  className="text-xl font-bold my-5"
                  variant="ghost"
                >
                  Solves Puzzles
                </Button>
                <Button
                  onClick={() => mutation.mutate()}
                  variant="ghost"
                  className="text-xl font-bold my-5"
                >
                  <LogOut size={26} />
                  Log out
                </Button>
              </>
            )}
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
