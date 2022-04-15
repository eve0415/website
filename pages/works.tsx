import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import { BotProject, MinecraftProject, TranslatedProject } from '../components/constants';
import { Main } from '../components/Content';
import { CreateCard } from '../components/works';

export default function Works() {
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
                    プロジェクト関連
                </Typography>

                <Stack spacing={3} mt={5} width='100%'>
                    <Box
                        sx={{
                            boxShadow: 2,
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            p: 2,
                        }}
                    >
                        <Typography variant='h4'>Discord BOT 関連</Typography>

                        <Box
                            sx={{
                                border: '1px dashed grey',
                                mt: 2,
                                p: 2,
                            }}
                        >
                            <Grid
                                container
                                columnSpacing={2}
                                flexWrap='nowrap'
                                overflow='auto'
                                width='calc(100% + 30px);'
                                p={1}
                            >
                                {BotProject.map(p => (
                                    <Grid item key={p.name}>
                                        <CreateCard project={p} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            boxShadow: 2,
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            p: 2,
                        }}
                    >
                        <Typography variant='h4'>Minecraft 関連</Typography>

                        <Box
                            sx={{
                                border: '1px dashed grey',
                                mt: 2,
                                p: 2,
                            }}
                        >
                            <Grid
                                container
                                columnSpacing={2}
                                flexWrap='nowrap'
                                overflow='auto'
                                width='calc(100% + 30px);'
                                p={1}
                            >
                                {MinecraftProject.map(p => (
                                    <Grid item key={p.name}>
                                        <CreateCard project={p} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            boxShadow: 2,
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            p: 2,
                        }}
                    >
                        <Typography variant='h4'>翻訳したプロジェクト</Typography>

                        <Box
                            sx={{
                                border: '1px dashed grey',
                                mt: 2,
                                p: 2,
                            }}
                        >
                            <Grid
                                container
                                columnSpacing={2}
                                flexWrap='nowrap'
                                overflow='auto'
                                width='calc(100% + 30px);'
                                p={1}
                            >
                                {TranslatedProject.map(p => (
                                    <Grid item key={p.name}>
                                        <CreateCard project={p} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Box>
                </Stack>
            </Container>
        </Main>
    );
}
