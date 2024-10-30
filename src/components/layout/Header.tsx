import * as React from 'react';
import Link from 'next/link';
import { Github } from 'lucide-react';
import { AirtableIcon } from '../icons/AirtableIcon';
import { DiscordIcon } from '../icons/DiscordIcon';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">PLDG Dashboard</span>
          </Link>
        </div>
        
        <nav className="flex items-center gap-6">
          <Link 
            href="https://airtable.com/appFEDy5FPBFHPY5r/shr773Cn3Q3owRDDR" 
            target="_blank"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
          >
            <AirtableIcon className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
            <span className="hidden sm:inline">Airtable</span>
          </Link>
          
          <Link 
            href="https://github.com/users/kt-wawro/projects/7/views/1" 
            target="_blank"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
          >
            <Github className="w-5 h-5 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            <span className="hidden sm:inline">GitHub</span>
          </Link>
          
          <Link 
            href="https://discord.gg/hCw74E2mE4" 
            target="_blank"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
          >
            <DiscordIcon className="w-5 h-5 group-hover:text-[#5865F2] transition-colors" />
            <span className="hidden sm:inline">Discord</span>
          </Link>
        </nav>
      </div>
    </header>
  );
} 