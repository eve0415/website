import { Box, Grid, Paper, Stack, Title } from '@mantine/core';
import { WorkCard } from '../components/card/WorkCard';
import { Main } from '../components/Content';
import { PreConnect } from '../components/CustomImageProxy';
import { BotProject, MinecraftProject, TranslatedProject } from '../components/works';

export default function Works() {
    return (
        <Main>
            <PreConnect />

            <Title size='3rem' pt={4}>
                プロジェクト関連
            </Title>

            <Stack mt={40} w='95%' pos='relative'>
                <Paper shadow='lg' radius='sm' p={15}>
                    <Title order={4} size='2rem'>
                        Discord BOT 関連
                    </Title>

                    <Box p={16} sx={{ border: '1px dashed grey', borderRadius: 8, textAlign: 'center' }}>
                        <Grid w='calc(100% + 20px);' sx={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
                            {BotProject.map(p => (
                                <WorkCard project={p} key={p.name} />
                            ))}
                        </Grid>
                    </Box>
                </Paper>

                <Paper shadow='lg' radius='sm' p={15}>
                    <Title order={4} size='2rem'>
                        Minecraft 関連
                    </Title>

                    <Box p={16} sx={{ border: '1px dashed grey', borderRadius: 8, textAlign: 'center' }}>
                        <Grid w='calc(100% + 20px);' sx={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
                            {MinecraftProject.map(p => (
                                <WorkCard project={p} key={p.name} />
                            ))}
                        </Grid>
                    </Box>
                </Paper>

                <Paper shadow='lg' radius='sm' p={15}>
                    <Title order={4} size='2rem'>
                        翻訳したプロジェクト
                    </Title>

                    <Box p={16} sx={{ border: '1px dashed grey', borderRadius: 8, textAlign: 'center' }}>
                        <Grid w='calc(100% + 20px);' sx={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
                            {TranslatedProject.map(p => (
                                <WorkCard project={p} key={p.name} />
                            ))}
                        </Grid>
                    </Box>
                </Paper>
            </Stack>
        </Main>
    );
}
