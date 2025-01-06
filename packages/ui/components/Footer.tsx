'use client';

import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer
      className={`sm:absolute bottom-4 right-4 left-4 bg-grayone px-[3%] mt-3 rounded-xl py-4 sm:py-10`}
    >
      <div className="text-center sm:text-left sm:flex">
        <div className="flex-initial sm:mr-20">
          <div className="mb-4 sm:mb-20">
            <Link
              className={`flex justify-center sm:justify-start items-center sm:pr-10`}
              href={'https://ionic.money'}
              target="_blank"
            >
              <Image
                alt="logo"
                className={`h-5`}
                height="20"
                src="/img/logo/logo.png"
                width="80"
              />
            </Link>
          </div>

          <div className="flex justify-center sm:justify-start mb-4 sm:mb-0">
            <Link
              className={`flex items-center pr-5`}
              href={'https://ionic.money'}
              target="_blank"
            >
              <Image
                alt="logo"
                className={`h-5`}
                height="20"
                src="/images/globe.png"
                width="20"
              />
            </Link>

            <Link
              className={`flex items-center pr-5`}
              href={'https://t.me/ionicmoney'}
              target="_blank"
            >
              <Image
                alt="logo"
                className={`h-5`}
                height="20"
                src="/images/tg.png"
                width="20"
              />
            </Link>

            <Link
              className={`flex items-center pr-5`}
              href={'https://twitter.com/ionicmoney'}
              target="_blank"
            >
              <Image
                alt="logo"
                className={`h-5`}
                height="20"
                src="/images/x.png"
                width="20"
              />
            </Link>

            <Link
              className={`flex items-center`}
              href={'https://discord.gg/FmgedqR9wn'}
              target="_blank"
            >
              <Image
                alt="logo"
                className={`h-5`}
                height="20"
                src="/images/discord.png"
                width="20"
              />
            </Link>
          </div>
        </div>

        <div className="flex-initial sm:mr-20">
          <h4 className="text-lg text-bold mb-2">Resources</h4>

          <ul className="text-sm">
            <li className="mb-1">
              <a
                href="https://doc.ionic.money/ionic-documentation/audit"
                target="_blank"
                rel="noreferrer"
              >
                Audit
              </a>
            </li>
            <li className="mb-1">
              <a
                href="https://doc.ionic.money/"
                target="_blank"
                rel="noreferrer"
              >
                Documentation
              </a>
            </li>
            <li className="mb-1">
              <a
                href="https://github.com/orgs/ionicprotocol/repositories"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </li>
            <li className="mb-1">
              <a
                href="https://linktr.ee/ionicmoney"
                target="_blank"
                rel="noreferrer"
              >
                Linktree
              </a>
            </li>
            <li className="mb-1">
              <a
                href="https://www.coingecko.com/en/coins/ionic-protocol"
                target="_blank"
                rel="noreferrer"
              >
                CoinGecko
              </a>
            </li>
            <li className="mb-1">
              <a
                href="https://id.ionic.money/#/"
                target="_blank"
                rel="noreferrer"
              >
                ID
              </a>
            </li>
          </ul>
        </div>

        <div className="flex-initial mt-4 sm:mt-0 sm:mr-20">
          <h4 className="text-lg text-bold mb-2">Tools</h4>

          <ul className="text-sm">
            <li className="mb-1">
              <a
                href="https://app.anthias.xyz/protocols/ionic/ionic_v1_mode/positions"
                target="_blank"
                rel="noreferrer"
              >
                Analytics
              </a>
            </li>
            <li className="mb-1">
              <a
                href="https://defillama.com/protocol/ionic-protocol"
                target="_blank"
                rel="noreferrer"
              >
                DeFi Llama
              </a>
            </li>
            <li className="mb-1">
              <a
                href="https://dune.com/mrwildcat/ionic-protocol"
                target="_blank"
                rel="noreferrer"
              >
                Dune
              </a>
            </li>
            <li className="mb-1">
              <a
                href="https://status.ionic.money/"
                target="_blank"
                rel="noreferrer"
              >
                Status
              </a>
            </li>
          </ul>
        </div>

        <div className="flex-initial mt-4 sm:mt-0 sm:mr-20">
          <Image
            alt="logo"
            height={30}
            src="/img/pyth.svg"
            width={100}
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
