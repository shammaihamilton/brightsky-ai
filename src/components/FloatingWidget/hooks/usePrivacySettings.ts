import { useEffect } from 'react';
import { useAppSelector } from '../../../store/hooks';
import { selectPrivacySettings } from '../../../store/selectors/settingsSelectors';

export const usePrivacySettings = () => {
  const privacySettings = useAppSelector(selectPrivacySettings);

  useEffect(() => {
    if (privacySettings?.autoClearDays && privacySettings.autoClearDays > 0) {
      const clearOldMessages = () => {
        const cutoffDate = new Date();
        cutoffDate.setDate(
          cutoffDate.getDate() - (privacySettings.autoClearDays ?? 0)
        );

        // This could be moved to a dedicated service
      };

      clearOldMessages();
      const interval = setInterval(clearOldMessages, 24 * 60 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [privacySettings?.autoClearDays]);
};
