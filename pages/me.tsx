import { Box, CardActionArea, Container, Grid, Paper, Stack, SvgIcon, Typography, Zoom } from '@mui/material';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { Main } from '../components/Content';
import type { LinkCard } from '../components/me';
import { editor, notUsed, technology } from '../components/me';

export default function Me() {
    return (
        <Main>
            <Container
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography variant='h3' pt={4}>
                    プロフィール
                </Typography>

                <Stack spacing={3} mt={5} alignItems='center' justifyContent='center'>
                    <Box
                        sx={{
                            boxShadow: 2,
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            p: 2,
                            border: '1px dashed grey',
                            textAlign: 'center',
                        }}
                    >
                        <Typography variant='h4'>自己紹介</Typography>
                        <Typography variant='body1' pt={3}>
                            こんにちは
                            <br />
                            猫と寝るの大好き
                            <br />
                            たまにプログラム書いてます
                            <br />
                            日本人ですが、どちらかといえば英語の方が得意です
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            boxShadow: 2,
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            p: 2,
                            border: '1px dashed grey',
                            textAlign: 'center',
                        }}
                    >
                        <Typography variant='h4'>使用している技術・分野</Typography>
                        <Grid container spacing={5} mt={2} justifyContent='center'>
                            {technology.map(({ name, url, svg }) => (
                                <Material
                                    key={name}
                                    name={name}
                                    url={url}
                                    svg={svg}
                                    width={128}
                                    height={128}
                                />
                            ))}
                        </Grid>
                    </Box>

                    <Box
                        sx={{
                            boxShadow: 2,
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            p: 2,
                            border: '1px dashed grey',
                            textAlign: 'center',
                        }}
                    >
                        <Typography variant='h4' display='inline-block'>
                            触れたことがある技術・
                        </Typography>
                        <Typography variant='h4' display='inline-block'>
                            分野
                        </Typography>
                        <Grid container spacing={5} mt={2} justifyContent='center'>
                            {notUsed.map(({ name, url, svg }) => (
                                <Material
                                    key={name}
                                    name={name}
                                    url={url}
                                    svg={svg}
                                    width={150}
                                    height={150}
                                />
                            ))}
                        </Grid>
                    </Box>

                    <Box
                        sx={{
                            boxShadow: 2,
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            p: 2,
                            border: '1px dashed grey',
                            textAlign: 'center',
                        }}
                    >
                        <Typography variant='h4'>使用しているエディター・IDE</Typography>
                        <Grid container spacing={5} mt={2} justifyContent='center'>
                            {editor.map(({ name, url, svg }) => (
                                <Material
                                    key={name}
                                    name={name}
                                    url={url}
                                    svg={svg}
                                    width={150}
                                    height={150}
                                />
                            ))}
                        </Grid>
                    </Box>
                </Stack>
            </Container>
        </Main>
    );
}

function Material({
    name,
    url,
    svg,
    width,
    height,
}: LinkCard & {
    width: number;
    height: number;
}) {
    const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });

    return (
        <Grid item ref={ref}>
            <Zoom in={inView}>
                <Paper sx={{ width: width, height: height }}>
                    <Link href={url} passHref>
                        <CardActionArea
                            target='_blank'
                            rel='noopener noreferrer'
                            href=''
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: width,
                                height: height,
                            }}
                        >
                            <SvgIcon viewBox='0 0 128 128' sx={{ fontSize: '70px' }}>
                                {svg}
                            </SvgIcon>
                            {name}
                        </CardActionArea>
                    </Link>
                </Paper>
            </Zoom>
        </Grid>
    );
}
