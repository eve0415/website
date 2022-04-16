import { Box, NoSsr, useMediaQuery, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';
import { CloudflareImage, Main } from '../components';
import cat from '../public/images/cat.jpg';
import catSleeping from '../public/images/catSleeping.jpg';

const Home = dynamic(() => import('../components/Home'));

export default function Head() {
    return (
        <>
            <Box
                position='fixed'
                width='100vw'
                height='100vh'
                sx={{
                    filter: { xs: 'blur(3px)', md: 'blur(5px)' },
                    zIndex: -100,
                }}
            >
                <NoSsr>
                    <CloudflareImage
                        src={useMediaQuery(useTheme().breakpoints.up('sm')) ? cat : catSleeping}
                        alt='My Cat'
                        layout='fill'
                        placeholder='blur'
                        objectFit='cover'
                        priority
                    />
                </NoSsr>
            </Box>

            <Box position='fixed' width='100vw' height='100vh' bgcolor='rgba(0,0,0,0.5)'>
                <Main>
                    <Home />
                </Main>
            </Box>
        </>
    );
}
