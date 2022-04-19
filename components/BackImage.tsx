import { Box, useMediaQuery, useTheme } from '@mui/material';
import cat from '../public/images/cat.jpg';
import catSleeping from '../public/images/catSleeping.jpg';
import { CloudflareImage } from './CloudflareLoader';

export default function BackImage() {
    return (
        <Box
            position='fixed'
            width='100vw'
            height='100vh'
            sx={{
                filter: { xs: 'blur(3px)', md: 'blur(5px)' },
            }}
        >
            <CloudflareImage
                src={useMediaQuery(useTheme().breakpoints.up('sm')) ? cat : catSleeping}
                alt='My Cat'
                layout='fill'
                placeholder='blur'
                objectFit='cover'
                priority
            />
        </Box>
    );
}
