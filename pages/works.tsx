import { Box, Card, Chip, Flex, Grid, Paper, Stack, Text, Title, Tooltip } from '@mantine/core';
import Link from 'next/link';
import { Main } from '../components/Content';
import { CustomImageProxy, PreConnect } from '../components/CustomImageProxy';
import type { Project } from '../components/works';
import { BotProject, MinecraftProject, tagList, TranslatedProject } from '../components/works';

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
                                <CreateCard project={p} key={p.name} />
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
                                <CreateCard project={p} key={p.name} />
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
                                <CreateCard project={p} key={p.name} />
                            ))}
                        </Grid>
                    </Box>
                </Paper>
            </Stack>
        </Main>
    );
}

function CreateCard({ project }: { project: Project }) {
    const { name, description, image, language, tag, link } = project;

    return (
        <Grid.Col key={name} span='content'>
            <Card w={300} h={400} withBorder>
                <Card.Section>
                    <CustomImageProxy
                        src={image}
                        alt={name}
                        height={150}
                        width={300}
                        style={{
                            objectFit: /opengraph.githubassets.com/.test(image) ? 'contain' : 'cover',
                            borderRadius: 5,
                        }}
                    />
                </Card.Section>

                <Title order={5} size='2rem'>
                    {name}
                </Title>

                <Chip.Group position='center' mb={10}>
                    <Chip variant='filled'>{language}</Chip>
                    {tag?.map(t => (
                        <CreateTag tagId={t} key={t} />
                    ))}
                </Chip.Group>

                <Text>{description}</Text>

                <Card.Section>
                    <Flex pos='absolute' justify='center' w='100%' bottom={0}>
                        {link.map(({ name: linkName, url, svg }) => (
                            <Link
                                href={url}
                                key={linkName}
                                style={{ fontSize: '1.5rem', paddingLeft: 10, paddingRight: 10 }}
                            >
                                {svg}
                            </Link>
                        ))}
                    </Flex>
                </Card.Section>
            </Card>
        </Grid.Col>
    );
}

function CreateTag({ tagId }: { tagId: string }) {
    const tagName = tagList.find(({ id }) => id === tagId);

    return (
        <Tooltip
            multiline
            withinPortal
            label={tagName?.description}
            events={{ hover: false, focus: true, touch: true }}
            transition='pop'
            transitionDuration={0}
        >
            <Chip variant='filled'>{`${tagName?.name}`}</Chip>
        </Tooltip>
    );
}
