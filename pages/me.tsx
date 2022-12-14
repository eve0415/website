import { Grid, Paper, Text, Title } from '@mantine/core';
import { Main } from '../components/Content';
import { Material } from '../components/material/Material';
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
                    毎日プログラム書いてます
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
