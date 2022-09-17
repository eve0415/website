import { Box, Typography, useTheme } from '@mui/material';
import { CustomImageProxy } from './CustomImageProxy';
import { profilePicture } from './StaticUrl';

export default function Home() {
    return (
        <Box
            display='flex'
            justifyContent='center'
            flexDirection='column'
            alignItems='center'
            position='relative'
            height={`calc(100vh - ${useTheme().spacing(10)})`}
            pb={{ xs: '20%', md: 0 }}
            color='white'
        >
            <Box
                width={{ xs: 100, md: 200, lg: 300 }}
                height={{ xs: 100, md: 200, lg: 300 }}
                position='relative'
                borderRadius='50%'
                overflow='hidden'
            >
                <CustomImageProxy
                    src={profilePicture}
                    alt='My profile picture'
                    sizes='(min-width: 1200px) 300px, (min-width: 900px) 200px, 100px'
                    fill
                />
            </Box>

            <Typography variant='h3' pt={4}>
                eve0415
            </Typography>

            <Typography variant='body1' pt={1}>
                ただの大学生
            </Typography>
            <Typography variant='body1'>いつも眠たい人</Typography>
        </Box>
    );
}
