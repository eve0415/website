import { Box, useMediaQuery, useTheme } from '@mui/material';
import { CustomImageProxy } from './CustomImageProxy';
import { horizontalPicture, verticalPicture } from './StaticUrl';

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
            <CustomImageProxy
                src={useMediaQuery(useTheme().breakpoints.up('sm')) ? verticalPicture : horizontalPicture}
                alt='My Cat'
                layout='fill'
                // placeholder='blur'
                objectFit='cover'
                priority
            />
        </Box>
    );
}
