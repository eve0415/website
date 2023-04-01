import { Chip, Tooltip } from '@mantine/core';
import { tagList } from '../works';

export const Tag = ({ tagId }: { tagId: string }) => {
  const tagName = tagList.find(({ id }) => id === tagId);
  if (!tagName) return <></>;

  return (
    <Tooltip
      multiline
      withinPortal
      label={tagName.description}
      events={{ hover: false, focus: true, touch: true }}
      transitionProps={{ transition: 'pop', duration: 0 }}
    >
      <Chip variant='filled'>{`${tagName.name}`}</Chip>
    </Tooltip>
  );
};
