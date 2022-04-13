import { Avatar, Backdrop, Container, Typography, useMediaQuery, useTheme } from '@mui/material';
import { CloudflareImage, Main } from '../components';
import cat from '../public/images/cat.jpg';
import catSleeping from '../public/images/catSleeping.jpg';
import profilePic from '../public/images/me.png';

export default function Head() {
    return (
        <>
            <Backdrop
                open
                sx={{
                    filter: { sm: 'blur(3px)', md: 'blur(5px)' },
                    zIndex: -100,
                }}
            >
                <CloudflareImage
                    src={useMediaQuery(useTheme().breakpoints.up('sm')) ? cat : catSleeping}
                    alt='My Cat'
                    layout='fill'
                />
            </Backdrop>

            <Main>
                <Backdrop
                    open
                    sx={{
                        ml: { md: '25%' },
                        zIndex: -1,
                    }}
                >
                    <Container
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            pb: { xs: '20%', md: 0 },
                        }}
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
                                sizes='(min-width: 1200px) 300px, (min-width: 900px) 200px, 100px'
                                priority
                            />
                        </Avatar>

                        <Typography variant='h3' color='white' pt={4}>
                            eve0415
                        </Typography>

                        <Typography variant='body1' color='white' pt={1}>
                            ただの大学生
                        </Typography>
                        <Typography variant='body1' color='white'>
                            いつも眠たい人
                        </Typography>
                    </Container>
                </Backdrop>
            </Main>
        </>
    );
}
