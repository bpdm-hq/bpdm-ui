import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { CopyToast } from '@/components/copy-toast';
import { SiteHeader } from '@/components/site-header';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <>
      {/* full-width site header above the docs layout (Fumadocs' own nav is disabled) */}
      <SiteHeader />
      <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
        {children}
        <CopyToast />
      </DocsLayout>
    </>
  );
}
