import {
    Box,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Chip,
    Container,
    Grid,
    IconButton,
    Stack,
    SvgIcon,
    Tooltip,
    Typography,
} from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';
import { CloudflareImage, Main } from '../components';
import type { Project } from '../components/constants';
import { BotProject, MinecraftProject, tagList, TranslatedProject } from '../components/constants';

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

function CreateCard({ project }: { project: Project }) {
    const { name, description, image, language, tag, link } = project;

    return (
        <Card
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 300,
                height: 400,
                border: '0.5px solid rgba(0,0,0, 0.25)',
                position: 'relative',
            }}
        >
            <Box width='95%' height='40%' borderRadius={1} overflow='hidden' position='sticky'>
                <CloudflareImage
                    src={image}
                    alt='project'
                    layout='fill'
                    objectFit='cover'
                    sizes='283px'
                    priority
                />
            </Box>

            <CardHeader title={name} />

            <Box>
                <Chip size='small' label={language} />
                {tag?.map(t => (
                    <CreateTag tagId={t} key={t} />
                ))}
            </Box>

            <CardContent>{description}</CardContent>

            <CardActions sx={{ position: 'absolute', bottom: 0 }}>
                {link.map(({ name: linkName, url, svg }) => (
                    <Link href={url} key={linkName} passHref>
                        <IconButton target='_blank' rel='noopener noreferrer' href=''>
                            <SvgIcon viewBox='0 0 128 128'>{svg}</SvgIcon>
                        </IconButton>
                    </Link>
                ))}
            </CardActions>
        </Card>
    );
}

function CreateTag({ tagId }: { tagId: string }) {
    const [open, setOpen] = useState(false);
    const tagName = tagList.find(({ id }) => id === tagId);

    return (
        <Tooltip
            onClose={() => setOpen(false)}
            onClick={() => setOpen(true)}
            onOpen={() => setOpen(true)}
            open={open}
            title={`${tagName?.description}`}
        >
            <Chip size='small' label={`${tagName?.name}`} sx={{ ml: 1 }} />
        </Tooltip>
    );
}
