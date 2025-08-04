import Link from 'next/link';

import { socials } from '@/src/data/socials';

export default function Social({ containerClass = '', iconStyle = '' }) {
  return (
    <div className={containerClass}>
      {socials.map((social, index) => {
        const Icon = social.icon;
        return (
          <Link
            key={index}
            href={social.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            className={iconStyle}
          >
            <Icon aria-hidden="true" />
          </Link>
        );
      })}
    </div>
  );
}
