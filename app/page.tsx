'use client';

import Contact from '@/src/components/contact';
import Home from '@/src/components/home';
import Resume from '@/src/components/resume';
import Work from '@/src/components/work';

export default function Index() {
  return (
    <div>
      <Home />
      <Resume />
      <Work />
      <Contact />
    </div>
  );
}
