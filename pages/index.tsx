import { Avatar, Box, NoSsr, Typography, useMediaQuery, useTheme } from '@mui/material';
import { CloudflareImage, Main } from '../components';
import cat from '../public/images/cat.jpg';
import catSleeping from '../public/images/catSleeping.jpg';
import profilePic from '../public/images/me.png';

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
                    <Box
                        display='flex'
                        justifyContent='center'
                        flexDirection='column'
                        alignItems='center'
                        height={`calc(100vh - ${useTheme().spacing(10)})`}
                        pb={{ xs: '20%', md: 0 }}
                        color='white'
                    >
                        <Avatar
                            sx={{
                                width: { xs: 100, md: 200, lg: 300 },
                                height: { xs: 100, md: 200, lg: 300 },
                            }}
                        >
                            <CloudflareImage
                                src={profilePic}
                                alt='My profile picture'
                                layout='fill'
                                placeholder='blur'
                                sizes='(min-width: 1200px) 300px, (min-width: 900px) 200px, 100px'
                                priority
                            />
                        </Avatar>

                        <Typography variant='h3' pt={4}>
                            eve0415
                        </Typography>

                        <Typography variant='body1' pt={1}>
                            ただの大学生
                        </Typography>
                        <Typography variant='body1'>いつも眠たい人</Typography>
                    </Box>
                </Main>
            </Box>
        </>
    );
}
