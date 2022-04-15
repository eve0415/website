import { Tooltip, Chip } from '@mui/material';
import { useState } from 'react';
import { tagList } from '../constants';

export function CreateTag({ tagId }: { tagId: string }) {
    const [open, setOpen] = useState(false);
    const tagName = tagList.find(({ id }) => id === tagId);

    return (
        <Tooltip
            onClose={() => setOpen(false)}
            onClick={() => setOpen(true)}
            onOpen={() => setOpen(true)}
            open={open}
            title={`${tagName?.description}`}
        >
            <Chip size='small' label={`${tagName?.name}`} sx={{ ml: 1 }} />
        </Tooltip>
    );
}
