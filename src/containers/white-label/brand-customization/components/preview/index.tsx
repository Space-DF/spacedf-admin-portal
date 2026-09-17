import { BrandIdentityPreview } from '@/containers/white-label/brand-customization/components/brand-identity-preview';

import { AuthPreview } from '../auth-preview';
import { BrandStylePreview } from '../brand-style-preview';
import { EmailPreview } from '../email-preview';

interface Props {
  activeTab: string;
  domain?: string;
  isLoading?: boolean;
  isLoadingSettings?: boolean;
}

export const BrandPreview = ({
  activeTab,
  domain,
  isLoading,
  isLoadingSettings,
}: Props) => {
  switch (activeTab) {
    case 'style':
      return <BrandStylePreview domain={domain} isLoading={isLoading} />;
    case 'email':
      return <EmailPreview />;
    case 'auth-pages':
      return <AuthPreview />;
    default:
      return (
        <BrandIdentityPreview
          domain={domain}
          isLoading={isLoading}
          isLoadingSettings={isLoadingSettings}
        />
      );
  }
};
