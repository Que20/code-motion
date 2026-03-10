import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { GitHubLogoIcon, HamburgerMenuIcon } from '@radix-ui/react-icons';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { mainMenu } from '@/data/constant/menu';
import { cn } from '@/utils/tailwind';

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur">
      <div className="container flex h-14 items-center px-4 md:px-8">
        <NavLink to="/" className="mr-6 hidden items-center space-x-2 md:flex">
          <span className="inline-block font-bold">Code Motion</span>
          <Badge
            className="rounded-lg border-emerald-900 bg-emerald-500/20 px-1.5 text-emerald-500"
            variant="outline"
          >
            vibe
          </Badge>
        </NavLink>

        <div className="mr-4 hidden flex-1 justify-center md:flex">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {mainMenu.map((menu, index) => (
              <NavLink
                key={index}
                to={menu.to ?? ''}
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    isActive ? 'text-foreground' : 'text-foreground/60',
                  )
                }
              >
                {menu.title}
              </NavLink>
            ))}
          </nav>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-4 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <HamburgerMenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 sm:max-w-xs">
            <NavLink
              to="/"
              onClick={() => setOpen(false)}
              className="flex items-center space-x-2"
            >
              <span className="inline-block font-bold">Code Motion</span>
              <Badge
                className="rounded-lg border-emerald-900 bg-emerald-500/20 px-1.5 text-emerald-500"
                variant="outline"
              >
                vibe
              </Badge>
            </NavLink>
            <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-8 pl-8">
              <div className="flex flex-col space-y-3">
                {mainMenu.map((menu, index) => (
                  <NavLink
                    key={index}
                    to={menu.to ?? ''}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'py-1 text-sm font-medium transition-colors hover:text-primary',
                        isActive ? 'text-foreground' : 'text-foreground/60',
                      )
                    }
                  >
                    {menu.title}
                  </NavLink>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <NavLink to="/" className="mr-6 flex items-center space-x-2 md:hidden">
          <span className="inline-block font-bold">Code Motion</span>
          <Badge
            className="rounded-lg border-emerald-900 bg-emerald-500/20 px-1.5 text-emerald-500"
            variant="outline"
          >
            vibe
          </Badge>
        </NavLink>

        <div className="ml-auto flex items-center justify-between space-x-2">
          <nav className="flex items-center space-x-2">
            <a
              href="https://github.com/que20/code-motion"
              title="GitHub Repo"
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                  }),
                  'w-9 px-0',
                )}
              >
                <GitHubLogoIcon className="h-full w-full" />
                <span className="sr-only">GitHub</span>
              </div>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
