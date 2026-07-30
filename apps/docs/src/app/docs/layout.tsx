import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { CopyToast } from '@/components/copy-toast';
import { SiteHeader, MobileMenuBanner } from '@/components/site-header';
import { MobileNavTrigger } from '@/components/mobile-nav-trigger';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <>
      {/* full-width site header above the docs layout (Fumadocs' own nav is disabled) */}
      <SiteHeader />
      <DocsLayout
        tree={source.getPageTree()}
        {...baseOptions()}
        sidebar={{ banner: <MobileMenuBanner /> }}
      >
        {children}
        <CopyToast />
        {/* renders inside the sidebar provider; portals a hamburger into <SiteHeader />
            so mobile can open the component nav (Fumadocs' own trigger is disabled) */}
        <MobileNavTrigger />
      </DocsLayout>
    </>
  );
}
