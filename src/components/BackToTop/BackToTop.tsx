'use client';

import { ActionIcon } from '@mantine/core';
import { IconArrowUp } from '@tabler/icons-react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
} from 'motion/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { MOTION_TRANSITION } from '@/lib/motion/transitions';

export const BackToTop = () => {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations('common');

  useEffect(() => {
    return scrollY.on('change', (y) => setVisible(y > 600));
  }, [scrollY]);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={MOTION_TRANSITION.standard}
          style={{ position: 'fixed', right: 20, bottom: 84, zIndex: 100 }}
          data-testid="back-to-top"
        >
          <ActionIcon
            size={44}
            radius="xl"
            variant="filled"
            aria-label={t('backToTop')}
            onClick={handleScrollToTop}
            data-testid="back-to-top-button"
          >
            <IconArrowUp size={20} />
          </ActionIcon>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
