import * as React from 'react';
import { Github } from 'lucide-react';
import { AirtableIcon } from '../icons/AirtableIcon';
import { DiscordIcon } from '../icons/DiscordIcon';

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-3">Data Sources</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://airtable.com/appFEDy5FPBFHPY5r/shr773Cn3Q3owRDDR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <AirtableIcon className="w-4 h-4 group-hover:text-blue-500 transition-colors" />
                  <span>Engagement Data (Airtable)</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/users/kt-wawro/projects/7/views/1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <Github className="w-4 h-4 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                  <span>Contributor Contributions (GitHub)</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://discord.gg/hCw74E2mE4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <DiscordIcon className="w-4 h-4 group-hover:text-[#5865F2] transition-colors" />
                  <span>Community Discussion (Discord)</span>
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Update Frequency</h3>
            <p className="text-sm text-muted-foreground">
              • Airtable: Real-time updates<br />
              • GitHub: Every 5 minutes<br />
              • Discord: Daily digest
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">About PLDG</h3>
            <p className="text-sm text-muted-foreground">
              The Protocol Labs Developer Guild (PLDG) is a program designed to drive open source 
              contributors through structured engagement and technical collaboration.
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Protocol Labs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 