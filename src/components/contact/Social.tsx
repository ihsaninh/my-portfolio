import { socials } from '@/src/data/socials';
import Link from 'next/link';

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
            className={iconStyle}
          >
            <Icon />
          </Link>
        );
      })}
    </div>
  );
}
