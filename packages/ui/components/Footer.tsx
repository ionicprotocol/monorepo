'use client';

import Image from 'next/image';
import Link from 'next/link';

import { BookOpen, Wrench } from 'lucide-react';

import { Separator } from '@ui/components/ui/separator';

const Footer = () => {
  return (
    <footer className="sm:absolute bottom-4 right-4 left-4 bg-grayone px-6 mt-3 rounded-xl py-3">
      {/* Logo and Social Links Row */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 mt-2">
        <div className="flex items-center gap-6">
          <Link
            href="https://ionic.money"
            target="_blank"
          >
            <Image
              alt="Ionic Logo"
              className="h-5 w-auto"
              height="20"
              src="/img/logo/logo.png"
              width="80"
            />
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="https://ionic.money"
              target="_blank"
            >
              <Image
                alt="Website"
                className="h-5 w-5"
                height="20"
                src="/images/globe.png"
                width="20"
              />
            </Link>
            <Link
              href="https://t.me/ionicmoney"
              target="_blank"
            >
              <Image
                alt="Telegram"
                className="h-5 w-5"
                height="20"
                src="/images/tg.png"
                width="20"
              />
            </Link>
            <Link
              href="https://twitter.com/ionicmoney"
              target="_blank"
            >
              <Image
                alt="Twitter"
                className="h-5 w-5"
                height="20"
                src="/images/x.png"
                width="20"
              />
            </Link>
            <Link
              href="https://discord.gg/FmgedqR9wn"
              target="_blank"
            >
              <Image
                alt="Discord"
                className="h-5 w-5"
                height="20"
                src="/images/discord.png"
                width="20"
              />
            </Link>
          </div>
        </div>

        <Image
          alt="Pyth Network"
          className="hidden sm:block"
          height={24}
          src="/img/pyth.svg"
          width={80}
        />
      </div>

      <Separator className="my-4" />

      {/* Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium tracking-wide uppercase">
              Resources
            </h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
            <a
              href="https://doc.ionic.money/ionic-documentation/audit"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Audit
            </a>
            <a
              href="https://doc.ionic.money/"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Documentation
            </a>
            <a
              href="https://github.com/orgs/ionicprotocol/repositories"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://linktr.ee/ionicmoney"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Linktree
            </a>
            <a
              href="https://www.coingecko.com/en/coins/ionic-protocol"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              CoinGecko
            </a>
            <a
              href="https://id.ionic.money/#/"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ID
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium tracking-wide uppercase">
              Tools & Analytics
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <a
              href="https://app.anthias.xyz/protocols/ionic/ionic_v1_mode/positions"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Analytics
            </a>
            <a
              href="https://defillama.com/protocol/ionic-protocol"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              DeFi Llama
            </a>
            <a
              href="https://dune.com/mrwildcat/ionic-protocol"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Dune
            </a>
            <a
              href="https://status.ionic.money/"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Status
            </a>
          </div>
        </div>
      </div>
      {/* Mobile Pyth Logo */}
      <div className="mt-4 flex justify-center sm:hidden">
        <Image
          alt="Pyth Network"
          height={24}
          src="/img/pyth.svg"
          width={80}
        />
      </div>
    </footer>
  );
};

export default Footer;
