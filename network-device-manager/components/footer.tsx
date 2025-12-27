import Link from "next/link";
import { Github, Heart, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl tracking-tight"
            >
              <Shield className="h-6 w-6 text-primary" />
              <span>
                NetManager <span className="text-primary">AI</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm">
              Next-generation network orchestration powered by AI. Manage,
              diagnose, and secure your infrastructure with ease.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="hover:text-primary transition-colors"
                >
                  Documentation
                </Link>
              </li>
              {/* <li>
                <Link
                  href="/monitor"
                  className="hover:text-primary transition-colors"
                >
                  Network Monitor
                </Link>
              </li> */}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">
              Connect
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="https://github.com/srini047/apify-network-device-manager/"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Github className="h-4 w-4" /> GitHub
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© 2025 NetManager AI. All rights reserved.</p>
          <div className="flex items-center gap-1">
            Created with{" "}
            <Heart className="h-3 w-3 text-destructive fill-destructive" /> by{" "}
            <Link
              href="https://github.com/srini047"
              className="font-bold hover:text-primary transition-colors"
            >
              srini047
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
