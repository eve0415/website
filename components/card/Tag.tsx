import { Chip, Tooltip } from '@mantine/core';
import { tagList } from '../works';

export const Tag = ({ tagId }: { tagId: string }) => {
  const tagName = tagList.find(({ id }) => id === tagId);

  return (
    <Tooltip
      multiline
      withinPortal
      label={tagName?.description}
      events={{ hover: false, focus: true, touch: true }}
      transition='pop'
      transitionDuration={0}
    >
      <Chip variant='filled'>{`${tagName?.name}`}</Chip>
    </Tooltip>
  );
};
