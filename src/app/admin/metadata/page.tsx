import { getAvailableTranslationKeysByType } from '@/lib/metadata/translationKeys';
import MetadataAdminClient from './MetadataAdminClient';

const AdminMetadataPage = async () => {
  const translationKeysByType = await getAvailableTranslationKeysByType();

  return <MetadataAdminClient translationKeysByType={translationKeysByType} />;
};

export default AdminMetadataPage;
