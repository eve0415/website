import { Button, Flex, Grid, Paper, Text, Title, Transition } from '@mantine/core';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { Main } from '../components/Content';
import type { LinkCard } from '../components/me';
import { editor, notUsed, technology } from '../components/me';

export default function Me() {
    return (
        <Main>
            <Title size='3rem' pt={4}>
                プロフィール
            </Title>

            <Paper
                shadow='sm'
                radius='sm'
                mt={20}
                p={10}
                sx={{ border: '1px dashed grey', textAlign: 'center' }}
            >
                <Title order={4} size='2rem'>
                    自己紹介
                </Title>

                <Text pt={3}>
                    こんにちは
                    <br />
                    猫と寝るの大好き
                    <br />
                    たまにプログラム書いてます
                    <br />
                    日本人ですが、どちらかといえば英語の方が得意です
                </Text>
            </Paper>

            <Paper
                shadow='sm'
                radius='sm'
                my={20}
                w='90%'
                withBorder
                sx={{ border: '1px dashed grey', textAlign: 'center' }}
            >
                <Title order={4} size='2rem'>
                    使用している技術・分野
                </Title>

                <Grid justify='center' align='center' gutter='lg' p={10}>
                    {technology.map(({ name, url, svg }) => (
                        <Material key={name} name={name} url={url} svg={svg} width={128} height={128} />
                    ))}
                </Grid>
            </Paper>

            <Paper
                shadow='sm'
                radius='sm'
                my={20}
                w='90%'
                withBorder
                sx={{ border: '1px dashed grey', textAlign: 'center' }}
            >
                <Title order={4} size='2rem'>
                    触れたことがある技術・分野
                </Title>

                <Grid justify='center' align='center' gutter='lg' p={10}>
                    {notUsed.map(({ name, url, svg }) => (
                        <Material key={name} name={name} url={url} svg={svg} width={150} height={150} />
                    ))}
                </Grid>
            </Paper>

            <Paper
                shadow='sm'
                radius='sm'
                my={20}
                w='90%'
                withBorder
                sx={{ border: '1px dashed grey', textAlign: 'center' }}
            >
                <Title order={4} size='2rem'>
                    使用しているエディター・IDE
                </Title>

                <Grid justify='center' align='center' gutter='lg' p={10}>
                    {editor.map(({ name, url, svg }) => (
                        <Material key={name} name={name} url={url} svg={svg} width={150} height={150} />
                    ))}
                </Grid>
            </Paper>
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
    const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });

    return (
        <Grid.Col m={5} span='content' ref={ref} key={name}>
            <Transition mounted={inView} transition='pop' duration={225}>
                {styles => (
                    <Paper shadow='md' w={width} h={height} radius='sm' style={styles}>
                        <Button
                            component={Link}
                            href={url}
                            w={width}
                            h={height}
                            p={0}
                            variant='white'
                            target='_blank'
                            rel='noopener noreferrer'
                            style={{ textDecoration: 'none', color: 'black' }}
                        >
                            <Flex direction='column' align='center'>
                                <svg style={{ width: 70, height: 70 }} viewBox='0 0 128 128'>
                                    {svg}
                                </svg>
                                <Text>{name}</Text>
                            </Flex>
                        </Button>
                    </Paper>
                )}
            </Transition>
        </Grid.Col>
    );
}
