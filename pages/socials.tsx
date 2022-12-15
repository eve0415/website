import { Box, Button, Grid, Paper, Title } from '@mantine/core';
import Link from 'next/link';
import { GrGithub, GrTwitter } from 'react-icons/gr';
import { SiCrowdin } from 'react-icons/si';
import ripplet from 'ripplet.js';
import { Main } from '../components/Content';
import { PreConnect } from '../components/CustomImageProxy';

export default function Socials() {
    return (
        <Main>
            <PreConnect />

            <Title order={1} size='2.2rem' pt={4}>
                ソーシャルアカウント
            </Title>

            <Paper
                withBorder
                shadow='lg'
                radius='sm'
                p={32}
                pt={16}
                m={30}
                sx={{ border: '1px dashed grey', borderRadius: 8, textAlign: 'center' }}
            >
                <Title order={2} p={5} size='2rem'>
                    連絡方法
                </Title>

                <Grid pt={10}>
                    <Grid.Col md={6}>
                        <Button
                            fullWidth
                            h={100}
                            leftIcon={
                                <Box
                                    h={40}
                                    w={40}
                                    sx={{
                                        backgroundColor: 'white',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <svg
                                        viewBox='0 0 71 55'
                                        fill='none'
                                        width='24'
                                        height='24'
                                        xmlns='http://www.w3.org/2000/svg'
                                    >
                                        <g clipPath='url(#clip0)'>
                                            <path
                                                d='M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z'
                                                fill='#5865F2'
                                            />
                                        </g>
                                        <defs>
                                            <clipPath id='clip0'>
                                                <rect width='71' height='55' fill='white' />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </Box>
                            }
                            radius='md'
                            sx={theme => ({
                                backgroundColor: '#2532F2',
                                display: 'flex',
                                justifyContent: 'flex-start',
                                fontSize: '1.5rem',
                                border: 'none',
                                transitionDuration: '500ms',
                                '&:hover': {
                                    backgroundColor: theme.fn.darken('#2532F2', 0.2),
                                },
                            })}
                            onPointerDown={event => ripplet(event, { clearing: false })}
                            onPointerUp={() => ripplet.clear()}
                            onPointerLeave={() => ripplet.clear()}
                        >
                            eve0415#0415
                        </Button>
                    </Grid.Col>

                    <Grid.Col md={6}>
                        <Button
                            fullWidth
                            component={Link}
                            h={100}
                            leftIcon={
                                <Box
                                    h={40}
                                    w={40}
                                    sx={{
                                        backgroundColor: 'white',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <GrTwitter color='#1D9BF0' size='24' />
                                </Box>
                            }
                            radius='md'
                            href='https://twitter.com/eveevekun'
                            target='_blank'
                            rel='noopener noreferrer'
                            sx={theme => ({
                                backgroundColor: '#1D9BF0',
                                display: 'flex',
                                justifyContent: 'flex-start',
                                fontSize: '1.5rem',
                                border: 'none',
                                transitionDuration: '500ms',
                                '&:hover': {
                                    backgroundColor: theme.fn.darken('#1D9BF0', 0.2),
                                },
                            })}
                            onPointerDown={event => ripplet(event, { clearing: false })}
                            onPointerUp={() => ripplet.clear()}
                            onPointerLeave={() => ripplet.clear()}
                        >
                            @eveevekun
                        </Button>
                    </Grid.Col>

                    <Grid.Col md={6}>
                        <Button
                            fullWidth
                            component={Link}
                            h={100}
                            leftIcon={
                                <Box
                                    h={40}
                                    w={40}
                                    sx={{
                                        backgroundColor: 'white',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <svg
                                        clipRule='evenodd'
                                        fillRule='evenodd'
                                        strokeLinejoin='round'
                                        strokeMiterlimit='1.41421'
                                        viewBox='0 0 560 400'
                                        xmlns='http://www.w3.org/2000/svg'
                                        xmlnsXlink='http://www.w3.org/1999/xlink'
                                        fontSize='large'
                                    >
                                        <radialGradient
                                            id='a'
                                            cx='0'
                                            cy='0'
                                            gradientTransform='matrix(0 -128.829 119.854 0 34.5345 140.001)'
                                            gradientUnits='userSpaceOnUse'
                                            r='1'
                                        >
                                            <stop offset='0' stopColor='#fd5' />
                                            <stop offset='.1' stopColor='#fd5' />
                                            <stop offset='.5' stopColor='#ff543e' />
                                            <stop offset='1' stopColor='#c837ab' />
                                        </radialGradient>
                                        <radialGradient
                                            id='b'
                                            cx='0'
                                            cy='0'
                                            gradientTransform='matrix(11.3061 56.4668 -232.817 46.6167 -21.7832 9.36419)'
                                            gradientUnits='userSpaceOnUse'
                                            r='1'
                                        >
                                            <stop offset='0' stopColor='#3771c8' />
                                            <stop offset='.13' stopColor='#3771c8' />
                                            <stop offset='1' stopColor='#60f' stopOpacity='0' />
                                        </radialGradient>
                                        <g
                                            fillRule='nonzero'
                                            transform='matrix(2.07653 0 0 2.07653 142.922 62.9603)'
                                        >
                                            <path
                                                d='m65.03 0c-27.142 0-35.08.028-36.623.156-5.57.463-9.036 1.34-12.812 3.22-2.91 1.445-5.205 3.12-7.47 5.468-4.125 4.282-6.625 9.55-7.53 15.812-.44 3.04-.568 3.66-.594 19.188-.01 5.176 0 11.988 0 21.125 0 27.12.03 35.05.16 36.59.45 5.42 1.3 8.83 3.1 12.56 3.44 7.14 10.01 12.5 17.75 14.5 2.68.69 5.64 1.07 9.44 1.25 1.61.07 18.02.12 34.44.12s32.84-.02 34.41-.1c4.4-.207 6.955-.55 9.78-1.28 7.79-2.01 14.24-7.29 17.75-14.53 1.765-3.64 2.66-7.18 3.065-12.317.088-1.12.125-18.977.125-36.81 0-17.836-.04-35.66-.128-36.78-.41-5.22-1.305-8.73-3.127-12.44-1.495-3.037-3.155-5.305-5.565-7.624-4.301-4.108-9.561-6.608-15.829-7.512-3.037-.439-3.642-.569-19.182-.596z'
                                                fill='url(#a)'
                                                transform='translate(1.004 1)'
                                            />
                                            <path
                                                d='m65.03 0c-27.142 0-35.08.028-36.623.156-5.57.463-9.036 1.34-12.812 3.22-2.91 1.445-5.205 3.12-7.47 5.468-4.125 4.282-6.625 9.55-7.53 15.812-.44 3.04-.568 3.66-.594 19.188-.01 5.176 0 11.988 0 21.125 0 27.12.03 35.05.16 36.59.45 5.42 1.3 8.83 3.1 12.56 3.44 7.14 10.01 12.5 17.75 14.5 2.68.69 5.64 1.07 9.44 1.25 1.61.07 18.02.12 34.44.12s32.84-.02 34.41-.1c4.4-.207 6.955-.55 9.78-1.28 7.79-2.01 14.24-7.29 17.75-14.53 1.765-3.64 2.66-7.18 3.065-12.317.088-1.12.125-18.977.125-36.81 0-17.836-.04-35.66-.128-36.78-.41-5.22-1.305-8.73-3.127-12.44-1.495-3.037-3.155-5.305-5.565-7.624-4.301-4.108-9.561-6.608-15.829-7.512-3.037-.439-3.642-.569-19.182-.596z'
                                                fill='url(#b)'
                                                transform='translate(1.004 1)'
                                            />
                                            <path
                                                d='m66.004 18c-13.036 0-14.672.057-19.792.29-5.11.234-8.598 1.043-11.65 2.23-3.157 1.226-5.835 2.866-8.503 5.535-2.67 2.668-4.31 5.346-5.54 8.502-1.19 3.053-2 6.542-2.23 11.65-.229 5.12-.289 6.757-.289 19.793s.058 14.667.29 19.787c.235 5.11 1.044 8.598 2.23 11.65 1.227 3.157 2.867 5.835 5.536 8.503 2.667 2.67 5.345 4.314 8.5 5.54 3.054 1.187 6.543 1.996 11.652 2.23 5.12.233 6.755.29 19.79.29 13.037 0 14.668-.057 19.788-.29 5.11-.234 8.602-1.043 11.656-2.23 3.156-1.226 5.83-2.87 8.497-5.54 2.67-2.668 4.31-5.346 5.54-8.502 1.18-3.053 1.99-6.542 2.23-11.65.23-5.12.29-6.752.29-19.788s-.06-14.672-.29-19.792c-.24-5.11-1.05-8.598-2.23-11.65-1.23-3.157-2.87-5.835-5.54-8.503-2.67-2.67-5.34-4.31-8.5-5.535-3.06-1.187-6.55-1.996-11.66-2.23-5.12-.233-6.75-.29-19.79-.29zm-4.306 8.65c1.278-.002 2.704 0 4.306 0 12.816 0 14.335.046 19.396.276 4.68.214 7.22.996 8.912 1.653 2.24.87 3.837 1.91 5.516 3.59 1.68 1.68 2.72 3.28 3.592 5.52.657 1.69 1.44 4.23 1.653 8.91.23 5.06.28 6.58.28 19.39s-.05 14.33-.28 19.39c-.214 4.68-.996 7.22-1.653 8.91-.87 2.24-1.912 3.835-3.592 5.514-1.68 1.68-3.275 2.72-5.516 3.59-1.69.66-4.232 1.44-8.912 1.654-5.06.23-6.58.28-19.396.28-12.817 0-14.336-.05-19.396-.28-4.68-.216-7.22-.998-8.913-1.655-2.24-.87-3.84-1.91-5.52-3.59s-2.72-3.276-3.592-5.517c-.657-1.69-1.44-4.23-1.653-8.91-.23-5.06-.276-6.58-.276-19.398s.046-14.33.276-19.39c.214-4.68.996-7.22 1.653-8.912.87-2.24 1.912-3.84 3.592-5.52s3.28-2.72 5.52-3.592c1.692-.66 4.233-1.44 8.913-1.655 4.428-.2 6.144-.26 15.09-.27zm29.928 7.97c-3.18 0-5.76 2.577-5.76 5.758 0 3.18 2.58 5.76 5.76 5.76s5.76-2.58 5.76-5.76-2.58-5.76-5.76-5.76zm-25.622 6.73c-13.613 0-24.65 11.037-24.65 24.65s11.037 24.645 24.65 24.645 24.646-11.032 24.646-24.645-11.034-24.65-24.647-24.65zm0 8.65c8.836 0 16 7.163 16 16 0 8.836-7.164 16-16 16-8.837 0-16-7.164-16-16 0-8.837 7.163-16 16-16z'
                                                fill='#fff'
                                            />
                                        </g>
                                    </svg>
                                </Box>
                            }
                            radius='md'
                            href='https://www.instagram.com/eveevekun'
                            target='_blank'
                            rel='noopener noreferrer'
                            sx={{
                                background:
                                    'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 35%, #d6249f 40%, #285AEB 90%)',
                                display: 'flex',
                                justifyContent: 'flex-start',
                                border: 'none',
                                fontSize: '1.5rem',
                            }}
                            onPointerDown={event => ripplet(event, { clearing: false })}
                            onPointerUp={() => ripplet.clear()}
                            onPointerLeave={() => ripplet.clear()}
                        >
                            eveevekun
                        </Button>
                    </Grid.Col>

                    <Grid.Col md={6}>
                        <Button
                            fullWidth
                            component={Link}
                            h={100}
                            leftIcon={
                                <Box
                                    h={40}
                                    w={40}
                                    sx={{
                                        backgroundColor: 'white',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <GrGithub color='#181616' size='24' />
                                </Box>
                            }
                            radius='md'
                            href='https://github.com/eve0415'
                            target='_blank'
                            rel='noopener noreferrer'
                            sx={theme => ({
                                backgroundColor: '#181616',
                                display: 'flex',
                                justifyContent: 'flex-start',
                                fontSize: '1.5rem',
                                border: 'none',
                                transitionDuration: '500ms',
                                '&:hover': {
                                    backgroundColor: theme.fn.darken('#fff', 0.7),
                                },
                            })}
                            onPointerDown={event => ripplet(event, { clearing: false })}
                            onPointerUp={() => ripplet.clear()}
                            onPointerLeave={() => ripplet.clear()}
                        >
                            eve0415
                        </Button>
                    </Grid.Col>

                    <Grid.Col md={6}>
                        <Button
                            fullWidth
                            component={Link}
                            h={100}
                            leftIcon={
                                <Box
                                    h={40}
                                    w={40}
                                    sx={{
                                        backgroundColor: 'white',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <SiCrowdin color='#2E3340' size='24' />
                                </Box>
                            }
                            radius='md'
                            href='https://crowdin.com/profile/eve0415'
                            target='_blank'
                            rel='noopener noreferrer'
                            sx={theme => ({
                                backgroundColor: '#2E3340',
                                display: 'flex',
                                justifyContent: 'flex-start',
                                fontSize: '1.5rem',
                                border: 'none',
                                transitionDuration: '500ms',
                                '&:hover': {
                                    backgroundColor: theme.fn.darken('#2E3340', 0.5),
                                },
                            })}
                            onPointerDown={event => ripplet(event, { clearing: false })}
                            onPointerUp={() => ripplet.clear()}
                            onPointerLeave={() => ripplet.clear()}
                        >
                            eve0415
                        </Button>
                    </Grid.Col>
                </Grid>
            </Paper>
        </Main>
    );
}
